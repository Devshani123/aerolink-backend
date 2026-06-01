const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const logger = require('./logger');

const app = express();
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
const PORT = 5000;
const SERVICE = 'api-gateway';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(YAML.load('./openapi.yaml')));

const AUTH_SERVICE_URL    = process.env.AUTH_SERVICE_URL    || 'http://localhost:5001';
const FLIGHT_SERVICE_URL  = process.env.FLIGHT_SERVICE_URL  || 'http://localhost:5002';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:5003';
const BAGGAGE_SERVICE_URL = process.env.BAGGAGE_SERVICE_URL || 'http://localhost:5004';


// METRICS ENGINE MATRIX (Simulates CloudWatch Dashboard)

const metrics = {
    totalRequests: 0,
    totalErrors: 0,
    responseTimes: [],

    record(duration, isError) {
        this.totalRequests++;
        this.responseTimes.push(duration);
        if (isError) this.totalErrors++;
        if (this.responseTimes.length > 100) this.responseTimes.shift();
    },

    getSummary() {
        const times = this.responseTimes;
        const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
        const sorted = [...times].sort((a, b) => a - b);
        const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;

        return {
            totalRequests: this.totalRequests,
            totalErrors: this.totalErrors,
            errorRate: this.totalRequests ? ((this.totalErrors / this.totalRequests) * 100).toFixed(2) + '%' : '0%',
            avgResponseTimeMs: avg,
            p95ResponseTimeMs: p95
        };
    }
};


// DISTRIBUTED TRACING ENGINE INTERCEPTOR (Simulates AWS X-Ray)

app.use((req, res, next) => {
    const requestId = 'REQ-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const isError = res.statusCode >= 400;

        metrics.record(duration, isError);

        logger.info(SERVICE, 'Request completed transaction flow', {
            requestId,
            method: req.method,
            path: req.path,
            status: res.statusCode,
            durationMs: duration
        });
    });

    next();
});

// Metrics Exposing Endpoint
app.get('/metrics', (req, res) => {
    res.status(200).json({
        service: 'AeroLink API Gateway Cluster',
        timestamp: new Date().toISOString(),
        ...metrics.getSummary()
    });
});

// Authentication Validation Layer
const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const result = await response.json();
        if (!result.valid) return res.status(401).json({ error: 'Invalid or expired token' });
        req.user = result.user;
        next();
    } catch (err) {
        logger.error(SERVICE, 'Auth service connection lost', { error: err.message });
        res.status(500).json({ error: 'Auth service unavailable' });
    }
};

// Role Enforcement Firewall
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
        if (!allowedRoles.includes(req.user.role)) {
            logger.warn(SERVICE, 'Access denied - invalid role permissions', {
                userRole: req.user.role,
                required: allowedRoles,
                requestId: req.requestId
            });
            return res.status(403).json({ error: `Access denied. Required: ${allowedRoles.join(' or ')}` });
        }
        next();
    };
};

// Proxies with Preserved Paths and Telemetry Integration
app.use('/api/auth', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => { return '/api/auth' + path; }
}));

app.use('/api/flights', (req, res, next) => {
    if (req.method === 'GET') return next();
    return authenticate(req, res, next);
}, (req, res, next) => {
    if (req.method === 'GET') return next();
    return requireRole(['Admin'])(req, res, next);
}, createProxyMiddleware({
    target: FLIGHT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => { return '/api/flights' + path; }
}));

app.use('/api/bookings', authenticate, createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => { return '/api/bookings' + path; },
    on: {
        proxyReq: (proxyReq, req) => {
            if (req.user) {
                proxyReq.setHeader('x-user-id', req.user.userId);
                proxyReq.setHeader('x-user-role', req.user.role);
            }
        }
    }
}));

app.use('/api/baggage', authenticate, createProxyMiddleware({
    target: BAGGAGE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => { return '/api/baggage' + path; }
}));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'API Gateway' });
});

app.listen(PORT, () => {
    logger.info(SERVICE, 'API Gateway telemetry layer online', { port: PORT });
});
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PutCommand, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const db = require('./db');
const logger = require('./logger');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5001;
const SERVICE = 'auth-service';
const JWT_SECRET = process.env.JWT_SECRET || 'aerolink_secret_key';
const TABLE = 'aerolink-users';

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'Auth Service' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists in DynamoDB
        const existing = await db.send(new ScanCommand({
            TableName: TABLE,
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email }
        }));

        if (existing.Items && existing.Items.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const validRoles = ['Passenger', 'Admin', 'Staff'];
        const assignedRole = validRoles.includes(role) ? role : 'Passenger';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            id: Date.now().toString(),
            email,
            password: hashedPassword,
            role: assignedRole,
            createdAt: new Date().toISOString()
        };

        // Save to DynamoDB
        await db.send(new PutCommand({
            TableName: TABLE,
            Item: user
        }));

        logger.info(SERVICE, 'User registered', { userId: user.id, role: assignedRole });
        res.status(201).json({ message: 'Registered successfully', userId: user.id });

    } catch (err) {
        logger.error(SERVICE, 'Registration error', { error: err.message });
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user in DynamoDB
        const result = await db.send(new ScanCommand({
            TableName: TABLE,
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email }
        }));

        const user = result.Items && result.Items[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        logger.info(SERVICE, 'Login successful', { userId: user.id });
        res.status(200).json({ token });

    } catch (err) {
        logger.error(SERVICE, 'Login error', { error: err.message });
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify token
app.post('/api/auth/verify', (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ valid: false, error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ valid: true, user: decoded });
    } catch (err) {
        res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(SERVICE, 'Service started', { port: PORT });
    });
}

module.exports = app;
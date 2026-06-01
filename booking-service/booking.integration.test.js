const request = require('supertest');
const app = require('./server');

describe('Booking Service - Integration Tests', () => {
    test('GET /health returns UP with circuit breaker initialization parameters', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.circuitBreaker).toBeDefined();
    });

    test('POST /api/bookings fails instantly if payload parameters are missing', async () => {
        const res = await request(app).post('/api/bookings').send({});
        expect(res.statusCode).toBe(400);
    });

    test('GET /api/bookings reads baseline transaction collection records', async () => {
        const res = await request(app).get('/api/bookings');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
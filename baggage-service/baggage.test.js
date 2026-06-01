const request = require('supertest');
const app = require('./server');

describe('Baggage Service - Unit Tests', () => {
    test('GET /health returns status UP', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
    });

    test('POST /api/baggage/scan records a checkpoint log', async () => {
        const res = await request(app)
            .post('/api/baggage/scan')
            .send({ bookingId: 'BK-111111', location: 'Check-in Counter', status: 'Checked In' });
        expect(res.statusCode).toBe(201);
        expect(res.body.scan.bookingId).toBe('BK-111111');
    });

    test('POST /api/baggage/scan fails with missing fields', async () => {
        const res = await request(app).post('/api/baggage/scan').send({ bookingId: 'BK-111111' });
        expect(res.statusCode).toBe(400);
    });

    test('GET /api/baggage/:bookingId returns tracking records history array', async () => {
        await request(app).post('/api/baggage/scan').send({ bookingId: 'BK-222', location: 'Gate', status: 'Loaded' });
        const res = await request(app).get('/api/baggage/BK-222');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
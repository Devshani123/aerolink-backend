const request = require('supertest');
const app = require('./server');

describe('Flight Service - Unit Tests', () => {
    test('GET /health returns status UP', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('UP');
    });

    test('GET /api/flights returns list of flights', async () => {
        const res = await request(app).get('/api/flights');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/flights/:id returns 404 for unknown flight', async () => {
        const res = await request(app).get('/api/flights/FAKE-999');
        expect(res.statusCode).toBe(404);
    });

    test('POST /api/flights/:id/reserve reduces seat count', async () => {
        const res = await request(app).post('/api/flights/AL-101/reserve').send();
        expect(res.statusCode).toBe(200);
    });

    test('PUT /api/flights/:id updates flight properties cleanly', async () => {
        const res = await request(app).put('/api/flights/AL-101').send({ status: 'Delayed', price: 425 });
        expect(res.statusCode).toBe(200);
        expect(res.body.flight.status).toBe('Delayed');
    });
});
const request = require('supertest');
const app = require('./server');

describe('Auth Service - Unit Tests', () => {
    test('GET /health returns status UP', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('UP');
    });

    test('POST /api/auth/register creates a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@aerolink.com', password: 'Pass123', role: 'Passenger' });
        expect(res.statusCode).toBe(201);
        expect(res.body.userId).toBeDefined();
    });

    test('POST /api/auth/register fails without email', async () => {
        const res = await request(app).post('/api/auth/register').send({ password: 'Pass123' });
        expect(res.statusCode).toBe(400);
    });

    test('POST /api/auth/register fails for duplicate email', async () => {
        await request(app).post('/api/auth/register').send({ email: 'dup@aerolink.com', password: 'Pass123' });
        const res = await request(app).post('/api/auth/register').send({ email: 'dup@aerolink.com', password: 'Pass123' });
        expect(res.statusCode).toBe(409);
    });

    test('POST /api/auth/login returns a token', async () => {
        await request(app).post('/api/auth/register').send({ email: 'login@aerolink.com', password: 'Pass123' });
        const res = await request(app).post('/api/auth/login').send({ email: 'login@aerolink.com', password: 'Pass123' });
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test('POST /api/auth/login fails with wrong password', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'login@aerolink.com', password: 'Wrong' });
        expect(res.statusCode).toBe(401);
    });
});
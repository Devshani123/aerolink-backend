import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 50  },  // Baseline load
        { duration: '30s', target: 100 },  // Breakpoint evaluation step 1
        { duration: '30s', target: 200 },  // Extreme concurrency stress maximum
        { duration: '30s', target: 0   },  // Controlled cooldown
    ],
};

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNzc5OTQ4OTYwNTU4IiwiZW1haWwiOiJsb2FkdGVzdDNAYWVyb2xpbmsuY29tIiwicm9sZSI6IlBhc3NlbmdlciIsImlhdCI6MTc3OTk0OTA2NiwiZXhwIjoxNzc5OTUyNjY2fQ.AO_E7MHb8q0H1TUkJJtMCDMilycMAf6FSzye5Ws2YI4';
const BASE_URL = 'http://localhost:5000';

export default function () {
    const res = http.get(`${BASE_URL}/api/flights`);
    check(res, { 'status is 200': (r) => r.status === 200 });
    sleep(0.3);

    const bookRes = http.get(`${BASE_URL}/api/bookings`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    check(bookRes, { 'bookings status is 200': (r) => r.status === 200 });
    sleep(0.3);
}
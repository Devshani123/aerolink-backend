import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 10 },  // Ramp up to 10 users
        { duration: '1m',  target: 50 },  // Maintain up to 50 users under standard loads
        { duration: '30s', target: 0  },  // Cool down back to 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],  // 95% of requests must finish under 2 seconds
        http_req_failed:   ['rate<0.05'],   // Error rate must remain under 5%
    },
};

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNzc5OTQ4OTYwNTU4IiwiZW1haWwiOiJsb2FkdGVzdDNAYWVyb2xpbmsuY29tIiwicm9sZSI6IlBhc3NlbmdlciIsImlhdCI6MTc3OTk0OTA2NiwiZXhwIjoxNzc5OTUyNjY2fQ.AO_E7MHb8q0H1TUkJJtMCDMilycMAf6FSzye5Ws2YI4';
const BASE_URL = 'http://localhost:5000';

export default function () {
    // 1. Public schedule query read
    const flightsRes = http.get(`${BASE_URL}/api/flights`);
    check(flightsRes, {
        'flights status is 200': (r) => r.status === 200,
        'flights latency < 500ms': (r) => r.timings.duration < 500,
    });
    sleep(0.5);

    // 2. Singular index query read
    const flightRes = http.get(`${BASE_URL}/api/flights/AL-101`);
    check(flightRes, {
        'single flight status is 200': (r) => r.status === 200,
    });
    sleep(0.5);

    // 3. Protected inter-service reservation call
    const bookingRes = http.post(
        `${BASE_URL}/api/bookings`,
        JSON.stringify({ flightId: 'AL-101' }),
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`,
            },
        }
    );
    check(bookingRes, {
        'booking status is valid (201/400)': (r) => r.status === 201 || r.status === 400,
    });
    sleep(1);
}
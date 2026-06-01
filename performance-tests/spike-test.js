import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 5   },  // Steady baseline traffic
        { duration: '10s', target: 150 },  // Flash traffic surge
        { duration: '10s', target: 10   },  // Drastic deflation recovery
        { duration: '10s', target: 0   },  // Finish execution
    ],
};

const BASE_URL = 'http://localhost:5000';

export default function () {
    const res = http.get(`${BASE_URL}/api/flights`);
    check(res, {
        'status is 200': (r) => r.status === 200,
        'spike latency < 2000ms': (r) => r.timings.duration < 2000,
    });
    sleep(0.2);
}
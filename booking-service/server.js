require('dotenv').config();
const express = require('express');
const EventEmitter = require('events');
const { PutCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const db = require('./db');
const logger = require('./logger');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5003;
const SERVICE = 'booking-service';
const FLIGHT_SERVICE_URL = process.env.FLIGHT_SERVICE_URL || 'http://localhost:5002';
const TABLE = 'aerolink-bookings';

const eventBus = new EventEmitter();

eventBus.on('BookingCreated', (booking) => {
    logger.info(SERVICE, '[EventBridge] BookingCreated event published', {
        bookingId: booking.bookingId
    });
    logger.info(SERVICE, '[Lambda] Sending confirmation email', { userId: booking.userId });
    logger.info(SERVICE, '[Lambda] Syncing seat update to Europe region', {
        flightId: booking.flightId
    });
});

eventBus.on('BookingCancelled', (booking) => {
    logger.info(SERVICE, '[EventBridge] BookingCancelled event published', {
        bookingId: booking.bookingId
    });
});

// Circuit Breaker
const circuitBreaker = {
    state: 'CLOSED',
    failureCount: 0,
    failureThreshold: 3,
    retryAfter: 15000,
    lastFailureTime: null,
    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    },
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
        }
    },
    canCall() {
        if (this.state === 'CLOSED') return true;
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime >= this.retryAfter) {
                this.state = 'HALF';
                return true;
            }
            return false;
        }
        if (this.state === 'HALF') return true;
    }
};

const callWithRetry = async (url, options, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.status >= 500 && attempt < retries) {
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }
            return response;
        } catch (err) {
            if (attempt < retries) {
                await new Promise(r => setTimeout(r, 1000));
            } else {
                throw err;
            }
        }
    }
};

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        service: 'Booking Service',
        circuitBreaker: circuitBreaker.state
    });
});

app.get('/circuit-status', (req, res) => {
    res.status(200).json({
        state: circuitBreaker.state,
        failureCount: circuitBreaker.failureCount,
        failureThreshold: circuitBreaker.failureThreshold
    });
});

// Create booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { flightId } = req.body;
        const userId = req.headers['x-user-id'] || 'unknown';

        if (!flightId) {
            return res.status(400).json({ error: 'flightId is required' });
        }

        if (!circuitBreaker.canCall()) {
            return res.status(503).json({ error: 'Flight Service temporarily unavailable' });
        }

        let response;
        try {
            response = await callWithRetry(
                `${FLIGHT_SERVICE_URL}/api/flights/${flightId}/reserve`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' } },
                3
            );
            circuitBreaker.onSuccess();
        } catch (err) {
            circuitBreaker.onFailure();
            return res.status(503).json({ error: 'Flight Service unavailable' });
        }

        if (response.status === 404) return res.status(404).json({ error: 'Flight not found' });
        if (response.status === 400) return res.status(400).json({ error: 'Flight is fully booked' });

        const booking = {
            bookingId: 'BK-' + Math.floor(100000 + Math.random() * 900000),
            userId,
            flightId,
            status: 'Confirmed',
            createdAt: new Date().toISOString()
        };

        // Save to DynamoDB
        await db.send(new PutCommand({
            TableName: TABLE,
            Item: booking
        }));

        eventBus.emit('BookingCreated', booking);
        logger.info(SERVICE, 'Booking confirmed', {
            bookingId: booking.bookingId,
            userId,
            flightId
        });

        res.status(201).json({ message: 'Booking confirmed', booking });

    } catch (err) {
        logger.error(SERVICE, 'Booking error', { error: err.message });
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const result = await db.send(new ScanCommand({ TableName: TABLE }));
        res.status(200).json(result.Items || []);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Cancel booking
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        // Get the booking first to find the flightId
        const bookings = await db.send(new ScanCommand({
            TableName: TABLE,
            FilterExpression: 'bookingId = :id',
            ExpressionAttributeValues: { ':id': req.params.id }
        }));

        const booking = bookings.Items && bookings.Items[0];

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ error: 'Booking is already cancelled' });
        }

        // Update booking status to Cancelled
        await db.send(new UpdateCommand({
            TableName: TABLE,
            Key: { bookingId: req.params.id },
            UpdateExpression: 'SET #st = :status',
            ExpressionAttributeNames: { '#st': 'status' },
            ExpressionAttributeValues: { ':status': 'Cancelled' }
        }));

        // Restore the seat in DynamoDB
        await db.send(new UpdateCommand({
            TableName: 'aerolink-flights',
            Key: { id: booking.flightId },
            UpdateExpression: 'SET seats = seats + :one',
            ExpressionAttributeValues: { ':one': 1 }
        }));

        logger.info(SERVICE, 'Booking cancelled and seat restored', {
            bookingId: req.params.id,
            flightId: booking.flightId
        });

        eventBus.emit('BookingCancelled', booking);

        res.status(200).json({
            message: 'Booking cancelled and seat restored',
            bookingId: req.params.id,
            flightId: booking.flightId
        });

    } catch (err) {
        logger.error(SERVICE, 'Cancellation error', { error: err.message });
        res.status(500).json({ error: 'Server error' });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(SERVICE, 'Service started', { port: PORT });
    });
}

module.exports = app;
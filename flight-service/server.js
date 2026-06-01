require('dotenv').config();
const express = require('express');
const EventEmitter = require('events');
const { PutCommand, GetCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const db = require('./db');
const logger = require('./logger');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5002;
const SERVICE = 'flight-service';
const TABLE = 'aerolink-flights';

const eventBus = new EventEmitter();

eventBus.on('FlightUpdated', (flight) => {
    logger.info(SERVICE, '[EventBridge] FlightUpdated event published', { flightId: flight.id });
    logger.info(SERVICE, '[Lambda] Syncing flight update to all regions', {
        status: flight.status,
        price: flight.price
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'Flight Service' });
});

// Get all flights
app.get('/api/flights', async (req, res) => {
    try {
        const result = await db.send(new ScanCommand({ TableName: TABLE }));
        logger.info(SERVICE, 'All flights requested');
        res.status(200).json(result.Items || []);
    } catch (err) {
        logger.error(SERVICE, 'Error fetching flights', { error: err.message });
        res.status(500).json({ error: 'Server error' });
    }
});

// Get one flight
app.get('/api/flights/:id', async (req, res) => {
    try {
        const result = await db.send(new GetCommand({
            TableName: TABLE,
            Key: { id: req.params.id }
        }));
        if (!result.Item) {
            return res.status(404).json({ error: 'Flight not found' });
        }
        res.status(200).json(result.Item);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Reserve a seat
app.post('/api/flights/:id/reserve', async (req, res) => {
    try {
        const result = await db.send(new GetCommand({
            TableName: TABLE,
            Key: { id: req.params.id }
        }));

        const flight = result.Item;
        if (!flight) return res.status(404).json({ error: 'Flight not found' });
        if (flight.seats <= 0) return res.status(400).json({ error: 'No seats available' });

        // Update seat count in DynamoDB
        await db.send(new UpdateCommand({
            TableName: TABLE,
            Key: { id: req.params.id },
            UpdateExpression: 'SET seats = seats - :one',
            ExpressionAttributeValues: { ':one': 1 }
        }));

        logger.info(SERVICE, 'Seat reserved', {
            flightId: flight.id,
            remainingSeats: flight.seats - 1
        });
        res.status(200).json({
            message: 'Seat reserved',
            remainingSeats: flight.seats - 1
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update flight
app.put('/api/flights/:id/update', async (req, res) => {
    try {
        const { status, price } = req.body;
        const result = await db.send(new GetCommand({
            TableName: TABLE,
            Key: { id: req.params.id }
        }));

        if (!result.Item) return res.status(404).json({ error: 'Flight not found' });

        let updateExp = 'SET ';
        const expValues = {};
        const parts = [];

        if (status) { parts.push('#st = :status'); expValues[':status'] = status; }
        if (price) { parts.push('price = :price'); expValues[':price'] = parseFloat(price); }

        updateExp += parts.join(', ');

        await db.send(new UpdateCommand({
            TableName: TABLE,
            Key: { id: req.params.id },
            UpdateExpression: updateExp,
            ExpressionAttributeNames: status ? { '#st': 'status' } : undefined,
            ExpressionAttributeValues: expValues
        }));

        const updated = { ...result.Item, ...req.body };
        eventBus.emit('FlightUpdated', updated);

        logger.info(SERVICE, 'Flight updated', { flightId: req.params.id });
        res.status(200).json({ message: 'Flight updated', flight: updated });
    } catch (err) {
        logger.error(SERVICE, 'Update error', { error: err.message });
        res.status(500).json({ error: 'Server error' });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(SERVICE, 'Service started', { port: PORT });
    });
}

module.exports = app;
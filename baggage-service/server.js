require('dotenv').config();
const express = require('express');
const EventEmitter = require('events');
const { PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const db = require('./db');
const logger = require('./logger');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5004;
const SERVICE = 'baggage-service';
const TABLE = 'aerolink-baggage';

const eventBus = new EventEmitter();

eventBus.on('BaggageScanned', (scan) => {
    logger.info(SERVICE, '[EventBridge] BaggageScanned event published', {
        bookingId: scan.bookingId
    });
    logger.info(SERVICE, '[Lambda] Sending baggage notification to passenger', {
        location: scan.location,
        status: scan.status
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'Baggage Service' });
});

// Record scan
app.post('/api/baggage/scan', async (req, res) => {
    try {
        const { bookingId, location, status } = req.body;

        if (!bookingId || !location || !status) {
            return res.status(400).json({
                error: 'bookingId, location and status are required'
            });
        }

        const scan = {
            scanId: 'SC-' + Date.now(),
            bookingId,
            location,
            status,
            time: new Date().toISOString()
        };

        // Save to DynamoDB
        await db.send(new PutCommand({
            TableName: TABLE,
            Item: scan
        }));

        eventBus.emit('BaggageScanned', scan);
        logger.info(SERVICE, 'Baggage scan recorded', {
            scanId: scan.scanId,
            bookingId,
            location
        });

        res.status(201).json({ message: 'Scan recorded', scan });

    } catch (err) {
        logger.error(SERVICE, 'Scan error', { error: err.message });
        res.status(500).json({ error: 'Server error' });
    }
});

// Get scans for booking
app.get('/api/baggage/:bookingId', async (req, res) => {
    try {
        const result = await db.send(new ScanCommand({
            TableName: TABLE,
            FilterExpression: 'bookingId = :bookingId',
            ExpressionAttributeValues: { ':bookingId': req.params.bookingId }
        }));

        if (!result.Items || result.Items.length === 0) {
            return res.status(404).json({ error: 'No baggage records found' });
        }

        logger.info(SERVICE, 'Baggage records retrieved', {
            bookingId: req.params.bookingId,
            count: result.Items.length
        });

        res.status(200).json(result.Items);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(SERVICE, 'Service started', { port: PORT });
    });
}

module.exports = app;
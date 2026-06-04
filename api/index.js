const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { generateReport } = require('./scripts/generate-report');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ─── Swagger Setup ────────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🏛️ Finca M&M API',
      version: '1.0.0',
      description: 'Real-time booking API for Finca M&M studios. Watch live interactions from the React Native app here.',
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Local Development' },
      { url: 'https://finca-mm-api.onrender.com', description: 'Production' },
    ],
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: '🏛️ Finca M&M API Docs',
  customCss: `
    .swagger-ui .topbar { background-color: #8b4513; }
    .swagger-ui .topbar-wrapper img { content: url(''); }
    .swagger-ui .topbar-wrapper::after { content: '🏛️ Finca M&M API'; color: white; font-size: 20px; font-weight: bold; }
    .swagger-ui .info .title { color: #8b4513; }
  `,
}));

// ─── In-Memory Data ───────────────────────────────────────────────────────────
let bookings = [];
let bookingIdCounter = 1;

const studios = [
  { id: 1, name: '🐦 Carpintero', description: 'Budget-friendly studio', price: 60, capacity: 2, amenities: ['WiFi', 'Kitchenette', 'Fan', 'TV'], available: true },
  { id: 2, name: '🐦 Periquito', description: 'Cozy studio perfect for couples', price: 70, capacity: 2, amenities: ['WiFi', 'Kitchenette', 'Air Conditioning', 'TV'], available: true },
  { id: 3, name: '🦅 Tucán', description: 'Spacious studio with mountain view', price: 80, capacity: 2, amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'TV', 'Private Bathroom'], available: true },
  { id: 4, name: '🦅 Zambullidor', description: 'Large studio ideal for families', price: 100, capacity: 4, amenities: ['WiFi', 'Full Kitchen', 'Air Conditioning', 'TV', 'Balcony'], available: true },
  { id: 5, name: '🦅 Cacique amarillo', description: 'Luxury studio with all amenities', price: 120, capacity: 3, amenities: ['WiFi', 'Full Kitchen', 'Air Conditioning', 'Smart TV', 'Balcony', 'Jacuzzi'], available: true },
];

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /:
 *   get:
 *     summary: API health check
 *     responses:
 *       200:
 *         description: API is running
 */
app.get('/', (req, res) => {
  res.redirect('/status');
});

// Live Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs-html', 'dashboard.html'));
});

// Service Status Page
app.get('/status', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs-html', 'status.html'));
});

// Documentation Page
app.get('/documentation', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs-html', 'documentation.html'));
});

/**
 * @swagger
 * /api/studios:
 *   get:
 *     summary: Get all studios
 *     tags: [Studios]
 *     responses:
 *       200:
 *         description: List of all studios
 */
app.get('/api/studios', (req, res) => {
  res.json(studios);
});

/**
 * @swagger
 * /api/studios/{id}:
 *   get:
 *     summary: Get studio by ID
 *     tags: [Studios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Studio found
 *       404:
 *         description: Studio not found
 */
app.get('/api/studios/:id', (req, res) => {
  const studio = studios.find(s => s.id === parseInt(req.params.id));
  if (!studio) return res.status(404).json({ error: 'Studio not found' });
  res.json(studio);
});

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of all bookings
 */
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking found
 *       404:
 *         description: Booking not found
 */
app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
});

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studioId, guestName, guestEmail, guestPhone, checkIn, checkOut, guests]
 *             properties:
 *               studioId:
 *                 type: integer
 *                 example: 1
 *               guestName:
 *                 type: string
 *                 example: John Doe
 *               guestEmail:
 *                 type: string
 *                 example: john@example.com
 *               guestPhone:
 *                 type: string
 *                 example: "+1234567890"
 *               checkIn:
 *                 type: string
 *                 example: "2026-07-01"
 *               checkOut:
 *                 type: string
 *                 example: "2026-07-05"
 *               guests:
 *                 type: integer
 *                 example: 2
 *               totalPrice:
 *                 type: number
 *                 example: 240
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Validation error
 */
app.post('/api/bookings', (req, res) => {
  const { studioId, guestName, guestEmail, guestPhone, checkIn, checkOut, guests, totalPrice } = req.body;

  if (!studioId || !guestName || !guestEmail || !guestPhone || !checkIn || !checkOut || !guests) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const studio = studios.find(s => s.id === studioId);
  if (!studio) return res.status(404).json({ error: 'Studio not found' });
  if (guests > studio.capacity) return res.status(400).json({ error: `Studio capacity is ${studio.capacity} guests` });

  const booking = {
    id: bookingIdCounter.toString(),
    studioId, guestName, guestEmail, guestPhone, checkIn, checkOut, guests, totalPrice,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  bookingIdCounter++;

  // Mark studio as unavailable
  const studioIndex = studios.findIndex(s => s.id === studioId);
  if (studioIndex !== -1) studios[studioIndex].available = false;

  res.status(201).json(booking);
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       404:
 *         description: Booking not found
 */
app.delete('/api/bookings/:id', (req, res) => {
  const index = bookings.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Booking not found' });
  bookings[index].status = 'cancelled';

  // Mark studio as available again
  const studioIndex = studios.findIndex(s => s.id === bookings[index].studioId);
  if (studioIndex !== -1) studios[studioIndex].available = true;

  res.json({ message: 'Booking cancelled', booking: bookings[index] });
});

// ─── Auto-release studios after checkout ─────────────────────────────────────
setInterval(() => {
  const now = new Date();
  bookings.forEach(booking => {
    if (booking.status === 'confirmed') {
      const checkOut = new Date(booking.checkOut);
      if (now >= checkOut) {
        booking.status = 'completed';
        const studioIndex = studios.findIndex(s => s.id === booking.studioId);
        if (studioIndex !== -1) studios[studioIndex].available = true;
        console.log(`✓ Studio #${booking.studioId} released after stay completion (Booking #${booking.id})`);
      }
    }
  });
}, 60 * 1000);

// ─── Weekly Report Generator (every Monday at midnight) ──────────────────────
setInterval(() => {
  const now = new Date();
  if (now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
    generateReport(bookings, studios);
    console.log('📊 Weekly report generated automatically.');
  }
}, 60 * 1000);

// Generate initial report on startup
generateReport(bookings, studios);

// ─── Report Route ─────────────────────────────────────────────────────────────
app.get('/weekly-booking-report', (req, res) => {
  const reportPath = path.join(__dirname, 'docs-html', 'weekly-booking-report.html');
  if (fs.existsSync(reportPath)) {
    res.sendFile(reportPath);
  } else {
    generateReport(bookings, studios);
    res.sendFile(reportPath);
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`📋  Service Status: http://localhost:${PORT}/status`);
});

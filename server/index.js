const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory data storage
let bookings = [];
let bookingIdCounter = 1;

const studios = [
  {
    id: 1,
    name: '🐦 Sparrow',
    description: 'Budget-friendly studio',
    price: 60,
    capacity: 2,
    amenities: ['WiFi', 'Kitchenette', 'Fan', 'TV'],
    available: true,
  },
  {
    id: 2,
    name: '🐦 Robin',
    description: 'Cozy studio perfect for couples',
    price: 70,
    capacity: 2,
    amenities: ['WiFi', 'Kitchenette', 'Air Conditioning', 'TV'],
    available: true,
  },
  {
    id: 3,
    name: '🦅 Falcon',
    description: 'Spacious studio with mountain view',
    price: 80,
    capacity: 2,
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'TV', 'Private Bathroom'],
    available: true,
  },
  {
    id: 4,
    name: '🦅 Hawk',
    description: 'Large studio ideal for families',
    price: 100,
    capacity: 4,
    amenities: ['WiFi', 'Full Kitchen', 'Air Conditioning', 'TV', 'Balcony'],
    available: true,
  },
  {
    id: 5,
    name: '🦅 Eagle',
    description: 'Luxury studio with all amenities',
    price: 120,
    capacity: 3,
    amenities: ['WiFi', 'Full Kitchen', 'Air Conditioning', 'Smart TV', 'Balcony', 'Jacuzzi'],
    available: true,
  },
];

// Routes
app.get('/', (req, res) => {
  res.json({ message: '🏛️ Finca M&M API - Amphitheatrum Edition' });
});

// Get all studios
app.get('/api/studios', (req, res) => {
  res.json(studios);
});

// Get studio by ID
app.get('/api/studios/:id', (req, res) => {
  const studio = studios.find(s => s.id === parseInt(req.params.id));
  if (!studio) {
    return res.status(404).json({ error: 'Studio not found' });
  }
  res.json(studio);
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// Get booking by ID
app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json(booking);
});

// Create new booking
app.post('/api/bookings', (req, res) => {
  const { studioId, guestName, guestEmail, guestPhone, checkIn, checkOut, guests, totalPrice } = req.body;

  // Validation
  if (!studioId || !guestName || !guestEmail || !guestPhone || !checkIn || !checkOut || !guests) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const studio = studios.find(s => s.id === studioId);
  if (!studio) {
    return res.status(404).json({ error: 'Studio not found' });
  }

  if (guests > studio.capacity) {
    return res.status(400).json({ error: `Studio capacity is ${studio.capacity} guests` });
  }

  const booking = {
    id: bookingIdCounter.toString(),
    studioId,
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  bookingIdCounter++;

  res.status(201).json(booking);
});

// Cancel booking
app.delete('/api/bookings/:id', (req, res) => {
  const index = bookings.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  bookings[index].status = 'cancelled';
  res.json({ message: 'Booking cancelled', booking: bookings[index] });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏛️ Finca M&M API running on http://localhost:${PORT}`);
  console.log(`📍 Studios endpoint: http://localhost:${PORT}/api/studios`);
  console.log(`📍 Bookings endpoint: http://localhost:${PORT}/api/bookings`);
});

# Finca M&M API

Express.js backend for the Finca M&M booking system.

## Setup

```bash
cd server
npm install
```

## Run

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will run on http://localhost:3000

## Endpoints

- `GET /api/studios` - Get all studios
- `GET /api/studios/:id` - Get studio by ID
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `DELETE /api/bookings/:id` - Cancel booking

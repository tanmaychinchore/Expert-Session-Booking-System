# Expert Session Booking Backend

Node.js, Express, MongoDB, and Socket.io backend for the real-time expert session booking system.

## Setup

```bash
cd backend
npm install
```

Create a local `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expert_session_booking
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Scripts

```bash
npm run dev
npm run seed
npm start
```

Run `npm run seed` after MongoDB is running to insert sample experts and slots.

## APIs

```txt
GET /api/health
GET /api/experts?page=1&limit=6&search=&category=
GET /api/experts/:id
POST /api/bookings
GET /api/bookings?email=user@example.com
PATCH /api/bookings/:id/status
```

## Real-Time Events

```txt
slotBooked
bookingStatusUpdated
```

## Double Booking Protection

The `Booking` model has a unique MongoDB index on:

```txt
expert + date + timeSlot
```

This prevents two users from booking the same expert slot, even if requests arrive at nearly the same time.

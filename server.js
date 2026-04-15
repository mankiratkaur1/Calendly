const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const eventTypesRoutes = require('./routes/eventTypes');
const availabilityRoutes = require('./routes/availability');
const slotsRoutes = require('./routes/slots');
const bookingsRoutes = require('./routes/bookings');
const pollsRoutes = require('./routes/polls');

const app = express();
const prisma = new PrismaClient();

const allowedOrigins = [
  'https://calendly-seven-sigma.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/event-types', eventTypesRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/polls', pollsRoutes);

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
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

app.use(cors());
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
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const mailer = require('../utils/mailer');

const router = express.Router();
const prisma = new PrismaClient();

async function getDefaultUser() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!user) throw new Error('No user found. Please run: npm run db:seed');
  return user;
}

// GET /api/bookings?filter=upcoming|past
router.get('/', async (req, res) => {
  const { filter } = req.query;
  const now = new Date();
  try {
    const user = await getDefaultUser();
    let whereClause = {
      eventType: { userId: user.id },
    };
    if (filter === 'upcoming') {
      whereClause.startTime = { gte: now };
      whereClause.status = 'CONFIRMED';
    } else if (filter === 'past') {
      whereClause.startTime = { lt: now };
    }
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: { eventType: { include: { user: true } } },
      orderBy: { startTime: 'asc' },
    });
    res.json({ data: bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/bookings
router.post('/', async (req, res) => {
  const { eventTypeId, inviteeName, inviteeEmail, date, time } = req.body;
  if (!eventTypeId || !inviteeName || !inviteeEmail || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const eventType = await prisma.eventType.findUnique({ 
      where: { id: eventTypeId },
      include: { user: true } 
    });
    if (!eventType) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    const startTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(startTime.getTime() + eventType.durationMinutes * 60 * 1000);

    const newSlotStart = new Date(startTime.getTime() - (eventType.bufferBefore * 60 * 1000));
    const newSlotEnd = new Date(endTime.getTime() + (eventType.bufferAfter * 60 * 1000));

    const existingBookings = await prisma.booking.findMany({
      where: {
        eventType: { userId: eventType.userId },
        status: 'CONFIRMED',
      },
      include: { eventType: true },
    });

    const isConflict = existingBookings.some(booking => {
      const bookingStart = new Date(booking.startTime.getTime() - (booking.eventType.bufferBefore * 60 * 1000));
      const bookingEnd = new Date(booking.endTime.getTime() + (booking.eventType.bufferAfter * 60 * 1000));
      
      return newSlotStart < bookingEnd && newSlotEnd > bookingStart;
    });

    if (isConflict) {
      return res.status(409).json({ error: 'Time slot is already booked' });
    }

    const booking = await prisma.booking.create({
      data: { eventTypeId, inviteeName, inviteeEmail, startTime, endTime },
      include: { eventType: { include: { user: true } } },
    });
    
    // Dispatch Email (Do not await to avoid blocking API response)
    mailer.sendBookingConfirmation(booking, eventType);

    res.status(201).json({ data: booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { eventType: { include: { user: true } } },
    });

    // Dispatch Cancellation Email
    mailer.sendCancellationNotification(booking, booking.eventType);

    res.json({ data: booking });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Booking not found' });
    } else {
      console.error(error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

module.exports = router;
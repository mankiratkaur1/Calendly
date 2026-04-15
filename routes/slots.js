const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/slots?eventTypeId=X&date=YYYY-MM-DD
router.get('/', async (req, res) => {
  const { eventTypeId, date } = req.query;
  if (!eventTypeId || !date) {
    return res.status(400).json({ error: 'Missing eventTypeId or date' });
  }

  try {
    const eventType = await prisma.eventType.findUnique({ where: { id: eventTypeId } });
    if (!eventType) {
      return res.status(404).json({ error: 'Event type not found' });
    }
    const { durationMinutes, userId } = eventType;

    const targetDate = new Date(date + 'T00:00:00');
    const dayOfWeek = targetDate.getDay();

    const availability = await prisma.availability.findFirst({
      where: { userId, dayOfWeek },
    });
    if (!availability || !availability.isAvailable) {
      return res.json({ data: [] });
    }

    const slots = [];
    const [startHour, startMin] = availability.startTime.split(':').map(Number);
    const [endHour, endMin] = availability.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    for (let minutes = startMinutes; minutes + durationMinutes <= endMinutes; minutes += durationMinutes) {
      const hour = Math.floor(minutes / 60);
      const min = minutes % 60;
      const suffix = hour >= 12 ? 'pm' : 'am';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const time12 = `${displayHour}:${min.toString().padStart(2, '0')}${suffix}`;
      const time24 = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

      const datetime = new Date(targetDate);
      datetime.setHours(hour, min, 0, 0);
      slots.push({
        time: time12,
        time24,
        datetime: datetime.toISOString(),
        available: true,
      });
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        eventType: { userId },
        startTime: { gte: startOfDay, lte: endOfDay },
        status: 'CONFIRMED',
      },
      include: { eventType: true },
    });

    const availableSlots = slots.filter(slot => {
      const slotStart = new Date(slot.datetime);
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
      
      const newSlotStart = new Date(slotStart.getTime() - (eventType.bufferBefore * 60 * 1000));
      const newSlotEnd = new Date(slotEnd.getTime() + (eventType.bufferAfter * 60 * 1000));

      return !bookings.some(booking => {
        const bookingStart = new Date(new Date(booking.startTime).getTime() - (booking.eventType.bufferBefore * 60 * 1000));
        const bookingEnd = new Date(new Date(booking.endTime).getTime() + (booking.eventType.bufferAfter * 60 * 1000));
        
        return newSlotStart < bookingEnd && newSlotEnd > bookingStart;
      });
    });

    res.json({ data: availableSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;
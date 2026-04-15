const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

async function getDefaultUser() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!user) throw new Error('No user found. Please run: npm run db:seed');
  return user;
}

// GET /api/availability
router.get('/', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const availability = await prisma.availability.findMany({
      where: { userId: user.id },
      orderBy: { dayOfWeek: 'asc' },
    });
    res.json({ data: availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PUT /api/availability  — saves ONE day at a time
router.put('/', async (req, res) => {
  const { dayOfWeek, startTime, endTime, isAvailable } = req.body;
  if (dayOfWeek === undefined || !startTime || !endTime || isAvailable === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const user = await getDefaultUser();
    // Use findFirst + update/create instead of upsert (no unique constraint on userId+dayOfWeek in schema)
    const existing = await prisma.availability.findFirst({
      where: { userId: user.id, dayOfWeek: Number(dayOfWeek) },
    });

    let availability;
    if (existing) {
      availability = await prisma.availability.update({
        where: { id: existing.id },
        data: { startTime, endTime, isAvailable },
      });
    } else {
      availability = await prisma.availability.create({
        data: {
          userId: user.id,
          dayOfWeek: Number(dayOfWeek),
          startTime,
          endTime,
          isAvailable,
        },
      });
    }
    res.json({ data: availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;
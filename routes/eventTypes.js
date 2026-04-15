const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Helper: get the first (demo) user from DB
async function getDefaultUser() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!user) throw new Error('No user found. Please run: npm run db:seed');
  return user;
}

// GET /api/event-types
router.get('/', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const eventTypes = await prisma.eventType.findMany({
      where: { userId: user.id },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ data: eventTypes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/event-types
router.post('/', async (req, res) => {
  const { name, slug, durationMinutes, description, color, bufferBefore, bufferAfter } = req.body;
  if (!name || !slug || !durationMinutes || !color) {
    return res.status(400).json({ error: 'Missing required fields: name, slug, durationMinutes, color' });
  }
  try {
    const user = await getDefaultUser();
    const eventType = await prisma.eventType.create({
      data: {
        userId: user.id,
        name,
        slug,
        durationMinutes: Number(durationMinutes),
        description: description || null,
        color,
        bufferBefore: bufferBefore ? Number(bufferBefore) : 0,
        bufferAfter: bufferAfter ? Number(bufferAfter) : 0,
      },
      include: { user: true },
    });
    res.status(201).json({ data: eventType });
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Slug already exists for this user' });
    } else {
      console.error(error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

// PUT /api/event-types/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, slug, durationMinutes, description, color, bufferBefore, bufferAfter } = req.body;
  try {
    const eventType = await prisma.eventType.update({
      where: { id },
      data: {
        name,
        slug,
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        description,
        color,
        bufferBefore: bufferBefore !== undefined ? Number(bufferBefore) : undefined,
        bufferAfter: bufferAfter !== undefined ? Number(bufferAfter) : undefined,
      },
      include: { user: true },
    });
    res.json({ data: eventType });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Event type not found' });
    } else if (error.code === 'P2002') {
      res.status(409).json({ error: 'Slug already exists for this user' });
    } else {
      console.error(error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

// DELETE /api/event-types/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.eventType.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Event type not found' });
    } else {
      console.error(error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

module.exports = router;
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Helper: get the default user from DB (since there's no real auth yet)
async function getDefaultUser() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!user) throw new Error('No user found. Please run database seed.');
  return user;
}

// GET /api/polls
router.get('/', async (req, res) => {
  try {
    const user = await getDefaultUser();
    const polls = await prisma.meetingPoll.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: polls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/polls
router.post('/', async (req, res) => {
  const { name, duration, location, description, reserveTimes, showVotes, link, selections } = req.body;
  if (!name || !duration || !link) {
    return res.status(400).json({ error: 'Missing required fields: name, duration, link' });
  }
  
  try {
    const user = await getDefaultUser();
    const poll = await prisma.meetingPoll.create({
      data: {
        userId: user.id,
        name,
        duration,
        location: location || 'zoom',
        description: description || null,
        reserveTimes: !!reserveTimes,
        showVotes: !!showVotes,
        link,
        selections: selections || [],
      },
    });
    res.status(201).json({ data: poll });
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'A poll with this link already exists' });
    } else {
      console.error(error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

// DELETE /api/polls/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getDefaultUser();
    // Ensure the poll belongs to the user before deleting
    await prisma.meetingPoll.deleteMany({ 
      where: { 
        id,
        userId: user.id
      } 
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;

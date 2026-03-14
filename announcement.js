const express = require('express');
const db = require('./pool');
const { authenticate } = require('./auth-middleware');

const router = express.Router();
router.use(authenticate);

// GET /api/announcement — récupérer l'annonce active
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM announcements ORDER BY created_at DESC LIMIT 1`
    );
    if (rows.length === 0) return res.json(null);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/announcement — créer/remplacer l'annonce (manager/admin uniquement)
router.post('/', async (req, res) => {
  if (!['manager', 'admin'].includes(req.agent.role)) {
    return res.status(403).json({ error: 'Non autorisé.' });
  }
  const { message, level } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message requis.' });
  const validLevels = ['info', 'warning', 'urgent'];
  const lvl = validLevels.includes(level) ? level : 'info';
  try {
    // Supprimer l'ancienne annonce
    await db.query('DELETE FROM announcements');
    const authorName = `${req.agent.first_name || ''} ${req.agent.last_name || ''}`.trim() || req.agent.email;
    const { rows } = await db.query(
      `INSERT INTO announcements (message, level, author_name, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [message.trim(), lvl, authorName]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/announcement — supprimer l'annonce (manager/admin uniquement)
router.delete('/', async (req, res) => {
  if (!['manager', 'admin'].includes(req.agent.role)) {
    return res.status(403).json({ error: 'Non autorisé.' });
  }
  try {
    await db.query('DELETE FROM announcements');
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;

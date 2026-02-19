const express = require('express');
const router = express.Router();
const db = require('../pool');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM leave_types ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  const { name, color, bg_color } = req.body;
  if (!name || !color) return res.status(400).json({ error: 'Nom et couleur requis' });
  try {
    const result = await db.query(
      'INSERT INTO leave_types (name, color, bg_color) VALUES ($1, $2, $3) RETURNING *',
      [name, color, bg_color || color + '20']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.patch('/:id', async (req, res) => {
  const { name, color } = req.body;
  try {
    const result = await db.query(
      'UPDATE leave_types SET name = COALESCE($1, name), color = COALESCE($2, color) WHERE id = $3 RETURNING *',
      [name, color, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM leave_types WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

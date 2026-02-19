const express = require('express');
const router = express.Router();
const db = require('../pool');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM leave_types ORDER BY label');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
});

router.post('/', async (req, res) => {
  const { label, color } = req.body;
  if (!label || !color) return res.status(400).json({ error: 'Label et couleur requis' });
  try {
    const result = await db.query(
      'INSERT INTO leave_types (label, color) VALUES ($1, $2) RETURNING *',
      [label, color]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { label, color } = req.body;
  try {
    const result = await db.query(
      'UPDATE leave_types SET label = COALESCE($1, label), color = COALESCE($2, color) WHERE id = $3 RETURNING *',
      [label, color, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM leave_types WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
});

module.exports = router;

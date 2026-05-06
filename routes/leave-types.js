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
  const { label, color, is_exceptional } = req.body;
  if (!label || !color) return res.status(400).json({ error: 'Label et couleur requis' });
  const baseCode = label.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')
    .replace(/^_|_$/g, '').slice(0, 20);
  try {
    let code = baseCode;
    const existing = await db.query("SELECT code FROM leave_types WHERE code LIKE $1", [baseCode + '%']);
    if (existing.rows.length > 0) code = baseCode + '_' + Date.now().toString().slice(-4);
    const result = await db.query(
      'INSERT INTO leave_types (label, color, code, is_exceptional) VALUES ($1, $2, $3, $4) RETURNING *',
      [label, color, code, is_exceptional === true]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { label, color, is_exceptional } = req.body;
  try {
    const result = await db.query(
      `UPDATE leave_types
       SET label = COALESCE($1, label),
           color = COALESCE($2, color),
           is_exceptional = CASE WHEN $3::boolean IS NOT NULL THEN $3 ELSE is_exceptional END
       WHERE id = $4 RETURNING *`,
      [label, color, is_exceptional !== undefined ? is_exceptional : null, req.params.id]
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

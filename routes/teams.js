const express = require('express');
const router = express.Router();
const db = require('../pool');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM teams ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nom requis' });
  try {
    const result = await db.query('INSERT INTO teams (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.patch('/:id', async (req, res) => {
  const { name, astreinte_slot } = req.body;
  const id = req.params.id;
  try {
    // Désignation Équipe A / Équipe B pour l'astreinte du vendredi (une seule équipe par slot)
    if (astreinte_slot !== undefined) {
      if (astreinte_slot !== null && !['A', 'B'].includes(astreinte_slot)) {
        return res.status(400).json({ error: 'Slot invalide (A, B ou null)' });
      }
      if (astreinte_slot) {
        await db.query('UPDATE teams SET astreinte_slot = NULL WHERE astreinte_slot = $1 AND id <> $2', [astreinte_slot, id]);
      }
      await db.query('UPDATE teams SET astreinte_slot = $1 WHERE id = $2', [astreinte_slot, id]);
    }
    // Renommage
    if (name !== undefined) {
      if (!name || !name.trim()) return res.status(400).json({ error: 'Nom requis' });
      await db.query('UPDATE teams SET name = $1 WHERE id = $2', [name.trim(), id]);
    }
    const result = await db.query('SELECT * FROM teams WHERE id = $1', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Équipe introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM teams WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../pool');
const bcrypt = require('bcrypt');

// GET tous les agents
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.id, a.first_name, a.last_name, a.email, a.role,
             a.avatar_initials, t.name as team_name
      FROM agents a
      LEFT JOIN teams t ON a.team_id = t.id
      ORDER BY a.first_name, a.last_name
    `);
    res.json({ agents: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PATCH /api/agents/:id
router.patch('/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, role, team, password } = req.body;

    // Résoudre l'équipe par nom → ID
    let team_id = null;
    if (team) {
      const teamResult = await db.query('SELECT id FROM teams WHERE name = $1', [team]);
      if (teamResult.rows.length > 0) team_id = teamResult.rows[0].id;
    }

    // Hash du mot de passe si fourni
    let passwordHash = null;
    if (password && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const { rows } = await db.query(`
      UPDATE agents SET
        first_name   = COALESCE($1, first_name),
        last_name    = COALESCE($2, last_name),
        email        = COALESCE($3, email),
        role         = COALESCE($4, role),
        team_id      = CASE WHEN $5::text IS NOT NULL THEN $6::int ELSE team_id END,
        password     = CASE WHEN $7::text IS NOT NULL THEN $7 ELSE password END,
        updated_at   = NOW()
      WHERE id = $8
      RETURNING id, first_name, last_name, email, role, avatar_initials
    `, [
      first_name  || null,
      last_name   || null,
      email       || null,
      role        || null,
      team        || null,
      team_id,
      passwordHash,
      req.params.id
    ]);

    if (!rows.length) return res.status(404).json({ error: 'Agent introuvable.' });
    res.json({ agent: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/agents/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM agents WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('./pool');
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

    // Construire la requête dynamiquement
    const fields = [];
    const values = [];
    let idx = 1;

    if (first_name) { fields.push(`first_name = $${idx++}`); values.push(first_name); }
    if (last_name !== undefined) { fields.push(`last_name = $${idx++}`); values.push(last_name); }
    if (email) { fields.push(`email = $${idx++}`); values.push(email); }
    if (role) { fields.push(`role = $${idx++}`); values.push(role); }
    if (team_id !== null) { fields.push(`team_id = $${idx++}`); values.push(team_id); }
    if (password && password.trim().length > 0) {
      const hash = await bcrypt.hash(password, 10);
      fields.push(`password = $${idx++}`);
      values.push(hash);
    }

    if (fields.length === 0) return res.json({ message: 'Rien à modifier.' });

    values.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE agents SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, first_name, last_name, email, role, avatar_initials`,
      values
    );

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
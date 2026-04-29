const express = require('express');
const router = express.Router();
const db = require('./pool');
const bcrypt = require('bcrypt');

// GET tous les agents
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.id, a.first_name, a.last_name, a.email, a.role,
             a.avatar_initials, a.can_book_presence_sites, a.agent_display_order, a.sub_team, t.name as team_name
      FROM agents a
      LEFT JOIN teams t ON a.team_id = t.id
      ORDER BY a.agent_display_order
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
    const { first_name, last_name, email, role, team, password, can_book_presence_sites, sub_team } = req.body;

    // Résoudre l'équipe par nom → ID
    let team_id = null;
    if (team) {
      const teamResult = await db.query('SELECT id FROM teams WHERE name = $1', [team]);
      if (teamResult.rows.length > 0) team_id = teamResult.rows[0].id;
    }
    if (team === '') team_id = null;

    // Construire la requête dynamiquement
    const fields = [];
    const values = [];
    let idx = 1;

    if (first_name) { fields.push(`first_name = $${idx++}`); values.push(first_name); }
    if (last_name !== undefined && last_name !== null) { fields.push(`last_name = $${idx++}`); values.push(last_name); }
    if (email) { fields.push(`email = $${idx++}`); values.push(email); }
    if (role) { fields.push(`role = $${idx++}`); values.push(role); }
    if (team_id !== null) { fields.push(`team_id = $${idx++}`); values.push(team_id); }
    if (team === '') { fields.push(`team_id = $${idx++}`); values.push(null); }

    // ✅ Hash du mot de passe avant sauvegarde
    if (password && password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      fields.push(`password_hash = $${idx++}`);
      values.push(hashedPassword);
    }

    if (can_book_presence_sites !== undefined) {
      fields.push(`can_book_presence_sites = $${idx++}`);
      values.push(can_book_presence_sites);
    }

    if (sub_team !== undefined) {
      fields.push(`sub_team = $${idx++}`);
      values.push(sub_team || null);
    }

    if (fields.length === 0) return res.json({ message: 'Rien à modifier.' });

    values.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE agents SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, first_name, last_name, email, role, avatar_initials, can_book_presence_sites, sub_team`,
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

// PATCH /api/agents/reorder
router.patch('/reorder', async (req, res) => {
  try {
    const { agentIds } = req.body;
    if (!Array.isArray(agentIds)) return res.status(400).json({ error: 'agentIds requis.' });
    await Promise.all(agentIds.map((id, idx) =>
      db.query('UPDATE agents SET agent_display_order = $1 WHERE id = $2', [idx + 1, id])
    ));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;

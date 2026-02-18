const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('./pool');
const { authenticate, requireRole } = require('./auth-middleware');

const router = express.Router();
router.use(authenticate);

// ── GET /api/agents ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        a.id, a.email, a.first_name, a.last_name, a.role, a.job_title,
        a.avatar_initials, a.is_active, a.created_at,
        t.id AS team_id, t.name AS team_name,
        (SELECT COUNT(*) FROM leave_requests lr
         WHERE lr.agent_id = a.id AND lr.status = 'approved'
         AND EXTRACT(YEAR FROM lr.start_date) = EXTRACT(YEAR FROM NOW())
        ) AS days_off_this_year
      FROM agents a
      LEFT JOIN teams t ON t.id = a.team_id
      WHERE a.is_active = TRUE
      ORDER BY a.last_name, a.first_name
    `);
    res.json({ agents: rows, total: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── GET /api/agents/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  // Un agent ne peut voir que son propre profil
  if (req.agent.role === 'agent' && req.params.id !== req.agent.id) {
    return res.status(403).json({ error: 'Accès refusé.' });
  }
  try {
    const { rows } = await db.query(`
      SELECT a.id, a.email, a.first_name, a.last_name, a.role, a.job_title,
             a.avatar_initials, a.is_active, a.created_at,
             t.id AS team_id, t.name AS team_name
      FROM agents a
      LEFT JOIN teams t ON t.id = a.team_id
      WHERE a.id = $1
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ error: 'Agent introuvable.' });
    res.json({ agent: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── PUT /api/agents/:id ────────────────────────────────────────────────────
router.put('/:id', [
  body('first_name').optional().trim().notEmpty(),
  body('last_name').optional().trim().notEmpty(),
  body('job_title').optional().trim(),
  body('team_id').optional().isUUID(),
  body('role').optional().isIn(['agent', 'manager', 'admin']),
], async (req, res) => {
  // Un agent ne peut modifier que son propre profil et pas son rôle
  if (req.agent.role === 'agent') {
    if (req.params.id !== req.agent.id) return res.status(403).json({ error: 'Accès refusé.' });
    delete req.body.role;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { first_name, last_name, job_title, team_id, role } = req.body;

  try {
    const updates = [];
    const params = [];
    let i = 1;

    if (first_name) { updates.push(`first_name = $${i++}`); params.push(first_name); }
    if (last_name) { updates.push(`last_name = $${i++}`); params.push(last_name); }
    if (job_title !== undefined) { updates.push(`job_title = $${i++}`); params.push(job_title); }
    if (team_id !== undefined) { updates.push(`team_id = $${i++}`); params.push(team_id || null); }
    if (role) { updates.push(`role = $${i++}`); params.push(role); }

    if (!updates.length) return res.status(400).json({ error: 'Aucune donnée à mettre à jour.' });

    // Recalculer les initiales si prénom/nom changé
    if (first_name || last_name) {
      const current = await db.query('SELECT first_name, last_name FROM agents WHERE id = $1', [req.params.id]);
      const fn = first_name || current.rows[0].first_name;
      const ln = last_name || current.rows[0].last_name;
      updates.push(`avatar_initials = $${i++}`);
      params.push((fn[0] + ln[0]).toUpperCase());
    }

    params.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE agents SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING id, email, first_name, last_name, role, job_title, avatar_initials`,
      params
    );

    if (!rows.length) return res.status(404).json({ error: 'Agent introuvable.' });
    res.json({ agent: rows[0], message: 'Profil mis à jour.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── DELETE /api/agents/:id (désactivation) ─────────────────────────────────
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    await db.query('UPDATE agents SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Agent désactivé.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── GET /api/agents/teams ──────────────────────────────────────────────────
router.get('/meta/teams', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM teams ORDER BY name');
    res.json({ teams: rows });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── POST /api/agents/teams ─────────────────────────────────────────────────
router.post('/meta/teams', requireRole('manager', 'admin'), [
  body('name').trim().notEmpty(),
], async (req, res) => {
  try {
    const { rows } = await db.query(
      'INSERT INTO teams (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
      [req.body.name]
    );
    res.status(201).json({ team: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;

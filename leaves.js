const express = require('express');
const db = require('./pool');
const { authenticate } = require('./auth-middleware');

const router = express.Router();
router.use(authenticate);

// GET /api/leaves
router.get('/', async (req, res) => {
  try {
    const { status, agent_id, month } = req.query;
    const params = [];
    const where = [];
    let i = 1;

    if (req.agent.role === 'agent') {
      where.push(`l.agent_id = $${i++}`);
      params.push(req.agent.id);
    } else if (agent_id) {
      where.push(`l.agent_id = $${i++}`);
      params.push(agent_id);
    }

    if (status) { where.push(`l.status = $${i++}`); params.push(status); }
    if (month) {
      where.push(`TO_CHAR(l.start_date, 'YYYY-MM') = $${i++}`);
      params.push(month);
    }

    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const { rows } = await db.query(`
      SELECT l.id, l.start_date, l.end_date, l.status, l.reason, l.comment, l.created_at,
             a.id AS agent_id, a.first_name, a.last_name, a.avatar_initials,
             t.name AS team_name,
             lt.code AS leave_type_code, lt.label AS leave_type_label, lt.color, lt.id AS leave_type_id
      FROM leaves l
      JOIN agents a ON a.id = l.agent_id
      LEFT JOIN teams t ON t.id = a.team_id
      LEFT JOIN leave_types lt ON lt.id = l.leave_type_id
      ${whereStr}
      ORDER BY l.created_at DESC
    `, params);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/leaves
router.post('/', async (req, res) => {
  try {
    const { leave_type_code, start_date, end_date, reason, agent_id } = req.body;

    const target_agent_id = (req.agent.role !== 'agent' && agent_id) ? agent_id : req.agent.id;

    const ltResult = await db.query('SELECT * FROM leave_types WHERE code = $1', [leave_type_code]);
    if (!ltResult.rows.length) return res.status(400).json({ error: 'Type de congé invalide.' });
    const leaveType = ltResult.rows[0];

    const isPont = (leaveType.code || '').toLowerCase().includes('pont') || (leaveType.label || '').toLowerCase().includes('pont');
    const autoApprove = !isPont && (!leaveType.requires_approval || req.agent.role === 'manager' || req.agent.role === 'admin');
    const status = autoApprove ? 'approved' : 'pending';

    const { rows } = await db.query(`
      INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [target_agent_id, leaveType.id, start_date, end_date, status, reason || null]);

    const leave = rows[0];

    const agentResult = await db.query(`
      SELECT a.first_name, a.last_name, a.avatar_initials, t.name AS team_name
      FROM agents a LEFT JOIN teams t ON t.id = a.team_id
      WHERE a.id = $1
    `, [target_agent_id]);

    const agent = agentResult.rows[0];

    res.status(201).json({
      leave: {
        ...leave,
        agent_id: target_agent_id,
        first_name: agent.first_name,
        last_name: agent.last_name,
        avatar_initials: agent.avatar_initials,
        team_name: agent.team_name,
        leave_type_code: leaveType.code,
        leave_type_label: leaveType.label,
        color: leaveType.color,
        leave_type_id: leaveType.id,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PATCH /api/leaves/:id
router.patch('/:id', async (req, res) => {
  try {
    const { status, comment } = req.body;
    const { rows } = await db.query(`
      UPDATE leaves SET status = $1, comment = $2 WHERE id = $3 RETURNING *
    `, [status, comment || null, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Congé introuvable.' });
    res.json({ leave: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/leaves/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM leaves WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Congé introuvable.' });

    const leave = rows[0];
    const canDelete = req.agent.role !== 'agent' || leave.agent_id === req.agent.id;
    if (!canDelete) return res.status(403).json({ error: 'Non autorisé.' });

    await db.query('DELETE FROM leaves WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;

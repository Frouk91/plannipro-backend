const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { isWeekend, eachDayOfInterval, parseISO, format } = require('date-fns');
const db = require('./pool');
const { authenticate, requireRole } = require('./auth-middleware');

const router = express.Router();
router.use(authenticate); // Toutes les routes nécessitent une authentification

// ── Calcul des jours ouvrés (hors weekends + jours fériés) ────────────────
async function countWorkingDays(startDate, endDate) {
  const { rows: holidays } = await db.query(
    'SELECT date FROM public_holidays WHERE date BETWEEN $1 AND $2',
    [startDate, endDate]
  );
  const holidaySet = new Set(holidays.map(h => format(h.date, 'yyyy-MM-dd')));

  const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
  return days.filter(d => !isWeekend(d) && !holidaySet.has(format(d, 'yyyy-MM-dd'))).length;
}

// ── GET /api/leaves ────────────────────────────────────────────────────────
router.get('/', [
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']),
  query('agent_id').optional().isUUID(),
  query('month').optional().matches(/^\d{4}-\d{2}$/),
  query('team_id').optional().isUUID(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { status, agent_id, month, team_id } = req.query;

    let whereClause = [];
    let params = [];
    let i = 1;

    whereClause.push(`lr.status != 'cancelled'`);

    if (agent_id) {
      whereClause.push(`lr.agent_id = $${i++}`);
      params.push(agent_id);
    }

    if (status) { whereClause.push(`lr.status = $${i++}`); params.push(status); }
    if (team_id) { whereClause.push(`a.team_id = $${i++}`); params.push(team_id); }
    if (month) {
      whereClause.push(`TO_CHAR(lr.start_date, 'YYYY-MM') = $${i++}`);
      params.push(month);
    }

    const where = whereClause.length ? 'WHERE ' + whereClause.join(' AND ') : '';

    const { rows } = await db.query(`
      SELECT
        lr.id, lr.start_date, lr.end_date, lr.total_days, lr.status,
        lr.reason, lr.manager_comment, lr.created_at, lr.approved_at,
        a.id AS agent_id, a.first_name, a.last_name, a.avatar_initials, a.email,
        t.name AS team_name,
        lt.code AS leave_type_code, lt.label AS leave_type_label, lt.color,
        mgr.first_name || ' ' || mgr.last_name AS approved_by_name
      FROM leave_requests lr
      JOIN agents a ON a.id = lr.agent_id
      LEFT JOIN teams t ON t.id = a.team_id
      JOIN leave_types lt ON lt.id = lr.leave_type_id
      LEFT JOIN agents mgr ON mgr.id = lr.approved_by
      ${where}
      ORDER BY lr.created_at DESC
    `, params);

    res.json({ leaves: rows, total: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── GET /api/leaves/planning ───────────────────────────────────────────────
router.get('/planning', [
  query('year').isInt({ min: 2020, max: 2030 }),
  query('month').isInt({ min: 1, max: 12 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { year, month } = req.query;
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  try {
    const { rows } = await db.query(`
      SELECT * FROM v_planning_monthly
      WHERE start_date <= $2 AND end_date >= $1
        AND status != 'cancelled'
      ORDER BY agent_name, start_date
    `, [startDate, endDate]);

    res.json({ planning: rows, year: parseInt(year), month: parseInt(month) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── POST /api/leaves ───────────────────────────────────────────────────────
router.post('/', [
  body('leave_type_code').notEmpty(),
  body('start_date').isDate(),
  body('end_date').isDate(),
  body('reason').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { leave_type_code, start_date, end_date, reason } = req.body;
  const target_agent_id = (req.agent.role !== 'agent' && req.body.agent_id)
    ? req.body.agent_id
    : req.agent.id;

  try {
    // Vérifier le type de congé
    const ltResult = await db.query(
      'SELECT * FROM leave_types WHERE code = $1',
      [leave_type_code]
    );
    if (!ltResult.rows.length) return res.status(400).json({ error: 'Type de congé invalide.' });
    const leaveType = ltResult.rows[0];

    // Vérifier les chevauchements
    // Règle : Rueil/Paris peuvent coexister avec n'importe quel autre type de congé
    const PRESENCE_CODES_CHECK = ['rueil', 'paris'];

    const overlap = await db.query(`
      SELECT lr.id, lt.code as leave_code FROM leave_requests lr
      JOIN leave_types lt ON lt.id = lr.leave_type_id
      WHERE lr.agent_id = $1
        AND lr.status NOT IN ('rejected', 'cancelled')
        AND lr.start_date <= $3 AND lr.end_date >= $2
    `, [target_agent_id, start_date, end_date]);

    const realOverlap = overlap.rows.filter(row => {
      const existingIsPresence = PRESENCE_CODES_CHECK.includes((row.leave_code || '').toLowerCase());
      // Si on pose une présence, elle ne bloque jamais
      if (isPresenceType) return false;
      // Si la demande existante est une présence, elle ne bloque pas un CP/RTT
      if (existingIsPresence) return false;
      // Sinon conflit réel
      return true;
    });

    if (realOverlap.length) {
      return res.status(409).json({ error: 'Cette période chevauche une demande existante.' });
    }

    const total_days = await countWorkingDays(start_date, end_date);
    if (total_days === 0) {
      return res.status(400).json({ error: 'Aucun jour ouvré sur cette période.' });
    }

    // ✅ CORRECTION : Vérifier si c'est un type présence site (Rueil/Paris)
    // et si l'agent a la permission can_book_presence_sites
    const PRESENCE_CODES = ['rueil', 'paris'];
    const isPresenceType = PRESENCE_CODES.includes((leaveType.code || '').toLowerCase()) ||
                           PRESENCE_CODES.includes((leaveType.label || '').toLowerCase());

    let autoApprove = false;
    if (isPresenceType && req.agent.role === 'agent') {
      // Vérifier la permission de l'agent
      const agentResult = await db.query(
        'SELECT can_book_presence_sites FROM agents WHERE id = $1',
        [target_agent_id]
      );
      if (agentResult.rows.length && agentResult.rows[0].can_book_presence_sites) {
        autoApprove = true;
      }
    }

    // Déterminer le statut final
    // - Manager/admin : toujours approuvé directement
    // - Agent avec présence autorisée : approuvé directement
    // - Agent normal : pending si requires_approval, sinon approuvé
    let status, approved_by, approved_at;
    if (req.agent.role !== 'agent') {
      // Manager ou admin : approuvé directement
      status = 'approved';
      approved_by = req.agent.id;
      approved_at = new Date();
    } else if (autoApprove) {
      // Agent autorisé pour les présences site : approuvé directement
      status = 'approved';
      approved_by = target_agent_id;
      approved_at = new Date();
    } else if (leaveType.requires_approval) {
      // Agent normal avec type nécessitant validation
      status = 'pending';
      approved_by = null;
      approved_at = null;
    } else {
      // Agent normal avec type sans validation
      status = 'approved';
      approved_by = req.agent.id;
      approved_at = new Date();
    }

    const { rows } = await db.query(`
      INSERT INTO leave_requests
        (agent_id, leave_type_id, start_date, end_date, total_days, status, reason, approved_by, approved_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [target_agent_id, leaveType.id, start_date, end_date, total_days, status, reason || null, approved_by, approved_at]);

    res.status(201).json({
      leave: rows[0],
      message: status === 'pending' ? 'Demande envoyée pour validation.' : 'Congé enregistré.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── PATCH /api/leaves/:id/approve ─────────────────────────────────────────
router.patch('/:id/approve', requireRole('manager', 'admin'), [
  body('manager_comment').optional().trim(),
], async (req, res) => {
  try {
    const { rows } = await db.query(`
      UPDATE leave_requests
      SET status = 'approved', approved_by = $1, approved_at = NOW(),
          manager_comment = $2, updated_at = NOW()
      WHERE id = $3 AND status = 'pending'
      RETURNING *
    `, [req.agent.id, req.body.manager_comment || null, req.params.id]);

    if (!rows.length) return res.status(404).json({ error: 'Demande introuvable ou déjà traitée.' });
    res.json({ leave: rows[0], message: 'Demande approuvée.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── PATCH /api/leaves/:id/reject ──────────────────────────────────────────
router.patch('/:id/reject', requireRole('manager', 'admin'), [
  body('manager_comment').trim().notEmpty().withMessage('Un motif de refus est requis.'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { rows } = await db.query(`
      UPDATE leave_requests
      SET status = 'rejected', approved_by = $1, approved_at = NOW(),
          manager_comment = $2, updated_at = NOW()
      WHERE id = $3 AND status = 'pending'
      RETURNING *
    `, [req.agent.id, req.body.manager_comment, req.params.id]);

    if (!rows.length) return res.status(404).json({ error: 'Demande introuvable ou déjà traitée.' });
    res.json({ leave: rows[0], message: 'Demande refusée.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── DELETE /api/leaves/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { rows: existing } = await db.query(
      'SELECT * FROM leave_requests WHERE id = $1',
      [req.params.id]
    );
    if (!existing.length) return res.status(404).json({ error: 'Demande introuvable.' });

    const leave = existing[0];

    // ✅ CORRECTION : Les agents autorisés peuvent supprimer leurs présences approuvées
    const agentResult = await db.query(
      'SELECT can_book_presence_sites FROM agents WHERE id = $1',
      [req.agent.id]
    );
    const canBookPresence = agentResult.rows.length && agentResult.rows[0].can_book_presence_sites;

    const canCancel =
      req.agent.role !== 'agent' ||
      (leave.agent_id === req.agent.id && leave.status === 'pending') ||
      (leave.agent_id === req.agent.id && leave.status === 'approved' && canBookPresence);

    if (!canCancel) return res.status(403).json({ error: 'Vous ne pouvez pas annuler cette demande.' });

    await db.query(
      `UPDATE leave_requests SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [req.params.id]
    );

    res.json({ message: 'Demande annulée.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;

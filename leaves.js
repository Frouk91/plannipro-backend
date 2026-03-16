const express = require('express');
const db = require('./pool');
const { authenticate } = require('./auth-middleware');

// ── Email notifications (Brevo) ──
async function sendEmail(toList, subject, html) {
  if (!process.env.BREVO_API_KEY) return;
  try {
    const to = Array.isArray(toList) ? toList : [toList];
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'Mon Planning', email: process.env.NOTIF_FROM_EMAIL || 'noreply@monplanning.fr' },
        to: to.map(email => ({ email })),
        subject,
        htmlContent: html
      })
    });
  } catch (e) {
    console.error('Email error:', e.message);
  }
}

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

    const autoApprove = !leaveType.requires_approval || req.agent.role === 'manager' || req.agent.role === 'admin';
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

    const responsePayload = {
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
    };
    res.status(201).json(responsePayload);

    // ── Notifier les managers par email (si demande en attente) ──
    if (status === 'pending') {
      try {
        const managersResult = await db.query(
          `SELECT email FROM agents WHERE role IN ('manager', 'admin') AND email IS NOT NULL`
        );
        const managerEmails = managersResult.rows.map(r => r.email).filter(Boolean);
        if (managerEmails.length > 0) {
          const agentName = `${agent.first_name} ${agent.last_name}`;
          const startFr = new Date(start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
          const endFr   = new Date(end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
          const period  = start_date === end_date ? startFr : `${startFr} → ${endFr}`;
          const subject = `🔔 Nouvelle demande de congé — ${agentName}`;
          const html = `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:12px;">
              <div style="background:linear-gradient(135deg,#6366f1,#818cf8);padding:20px 24px;border-radius:10px;margin-bottom:20px;">
                <h2 style="color:#fff;margin:0;font-size:18px;">🔔 Nouvelle demande de congé</h2>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">En attente de validation</p>
              </div>
              <div style="background:#fff;padding:20px 24px;border-radius:10px;border:1px solid #e2e8f0;">
                <table style="width:100%;font-size:14px;border-collapse:collapse;">
                  <tr><td style="padding:8px 0;color:#64748b;width:130px;">👤 Agent</td><td style="padding:8px 0;font-weight:600;color:#1e293b;">${agentName}</td></tr>
                  <tr><td style="padding:8px 0;color:#64748b;">🏷 Équipe</td><td style="padding:8px 0;color:#1e293b;">${agent.team_name || '—'}</td></tr>
                  <tr><td style="padding:8px 0;color:#64748b;">📋 Type</td><td style="padding:8px 0;color:#1e293b;">${leaveType.label}</td></tr>
                  <tr><td style="padding:8px 0;color:#64748b;">📅 Période</td><td style="padding:8px 0;font-weight:600;color:#1e293b;">${period}</td></tr>
                  ${reason ? `<tr><td style="padding:8px 0;color:#64748b;">💬 Raison</td><td style="padding:8px 0;color:#1e293b;">${reason}</td></tr>` : ''}
                </table>
              </div>
              <div style="text-align:center;margin-top:20px;">
                <a href="https://plannipro-frontend.vercel.app" style="background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">Voir dans Mon Planning</a>
              </div>
              <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px;">Mon Planning · Notification automatique</p>
            </div>
          `;
          await sendEmail(managerEmails, subject, html);
        }
      } catch (emailErr) {
        console.error('Erreur envoi email:', emailErr.message);
      }
    }
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

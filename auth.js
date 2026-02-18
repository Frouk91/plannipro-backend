const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('./pool');
const { authenticate, requireRole } = require('./auth-middleware');

const router = express.Router();

// ── Helpers ────────────────────────────────────────────────────────────────
function generateTokens(agentId) {
  const accessToken = jwt.sign(
    { sub: agentId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { sub: agentId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
}

// ── POST /api/auth/register ────────────────────────────────────────────────
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Mot de passe min 8 caractères'),
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, first_name, last_name, job_title, team_id } = req.body;

  try {
    // Vérifier si email déjà utilisé
    const exists = await db.query('SELECT id FROM agents WHERE email = $1', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email déjà utilisé.' });

    const password_hash = await bcrypt.hash(password, 12);
    const avatar_initials = (first_name[0] + last_name[0]).toUpperCase();

    const { rows } = await db.query(
      `INSERT INTO agents (email, password_hash, first_name, last_name, job_title, team_id, avatar_initials)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, first_name, last_name, role`,
      [email, password_hash, first_name, last_name, job_title || null, team_id || null, avatar_initials]
    );

    const agent = rows[0];
    const { accessToken, refreshToken } = generateTokens(agent.id);

    // Sauvegarder le refresh token
    await db.query(
      `INSERT INTO refresh_tokens (agent_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [agent.id, refreshToken]
    );

    res.status(201).json({ agent, accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const { rows } = await db.query(
      `SELECT a.*, t.name AS team_name
       FROM agents a
       LEFT JOIN teams t ON t.id = a.team_id
       WHERE a.email = $1 AND a.is_active = TRUE`,
      [email]
    );

    const agent = rows[0];
    if (!agent) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });

    const valid = await bcrypt.compare(password, agent.password_hash);
    if (!valid) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });

    const { accessToken, refreshToken } = generateTokens(agent.id);

    await db.query(
      `INSERT INTO refresh_tokens (agent_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [agent.id, refreshToken]
    );

    const { password_hash, ...safeAgent } = agent;
    res.json({ agent: safeAgent, accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── POST /api/auth/refresh ─────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token manquant.' });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Vérifier en DB que le token est encore valide
    const { rows } = await db.query(
      'SELECT id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );
    if (!rows.length) return res.status(401).json({ error: 'Refresh token invalide ou expiré.' });

    // Rotation du refresh token
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    const { accessToken, refreshToken: newRefresh } = generateTokens(payload.sub);
    await db.query(
      `INSERT INTO refresh_tokens (agent_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [payload.sub, newRefresh]
    );

    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    res.status(401).json({ error: 'Refresh token invalide.' });
  }
});

// ── POST /api/auth/logout ──────────────────────────────────────────────────
router.post('/logout', authenticate, async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  }
  res.json({ message: 'Déconnexion réussie.' });
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  res.json({ agent: req.agent });
});

module.exports = router;

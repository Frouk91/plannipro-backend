require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDB() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Base de données initialisée !');
  } catch (err) {
    console.log('DB déjà initialisée ou erreur:', err.message);
  }
}
initDB();
const express = require('express');
const cors = require('cors');

const authRouter = require('./auth');
const leavesRouter = require('./leaves');
const agentsRouter = require('./agents');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globaux ────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logging basique ────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/leaves', leavesRouter);
app.use('/api/agents', agentsRouter);

// ── Santé du serveur ───────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Route 404 ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable.' });
});

// ── Erreur globale ─────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 API PlanniPro démarrée sur http://localhost:${PORT}`);
  console.log(`   ↳ Documentation : voir README.md\n`);
});

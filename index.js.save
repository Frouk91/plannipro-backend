require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./pool');

async function initDB() {
  const pool = db;

  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Schema initialisé !');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        level VARCHAR(10) DEFAULT 'info',
        author_name TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Table announcements OK');
  } catch (err) {
    console.log('Schema:', err.message);
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

console.log('API PlanniPro démarrée sur port ' + PORT);

app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'https://plannipro-frontend.vercel.app',
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS non autorisé'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/leaves', leavesRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/teams', require('./routes/teams'));
app.use('/api/leave-types', require('./routes/leave-types'));
app.use('/api/astreintes', require('./astreintes'));
app.use('/api/announcement', require('./announcement'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route temporaire d'import 2026 - À SUPPRIMER après usage

app.get('/drop-announcements', async (req, res) => {
  try {
    await db.query('DROP TABLE IF EXISTS announcements;');
    res.json({ success: true, message: 'Table announcements supprimée.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/run-migration', async (req, res) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        level VARCHAR(10) DEFAULT 'info',
        author_name TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    res.json({ success: true, message: 'Table announcements créée ou déjà existante.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable.' });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

app.get('/run-import', async (req, res) => {
  try {
    const sql = require('fs').readFileSync(require('path').join(__dirname, 'import_data.sql'), 'utf8');
    await db.query(sql);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => { });

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDB() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Schema initialisé !');
  } catch (err) {
    console.log('Schema:', err.message);
  }

  await pool.end();
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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route temporaire export congés Railway — supprimer après
app.get('/export-leaves', async (req, res) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const { rows } = await pool.query(`
      SELECT l.*, a.first_name, a.last_name, a.avatar_initials,
             t.name AS team_name,
             lt.code AS leave_type_code, lt.label AS leave_type_label, lt.color
      FROM leaves l
      JOIN agents a ON a.id = l.agent_id
      LEFT JOIN teams t ON t.id = a.team_id
      LEFT JOIN leave_types lt ON lt.id = l.leave_type_id
      ORDER BY l.created_at DESC
    `);
    res.json(rows);
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

app.listen(PORT, () => {});

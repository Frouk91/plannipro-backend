require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDB() {
  const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: { rejectUnauthorized: false }
  });

  // Initialiser le schema (ignore les erreurs si tables existent déjà)
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Schema initialise !');
  } catch (err) {
    console.log('Schema deja existant:', err.message);
  }

  // ✅ MIGRATION : ajouter la colonne can_book_presence_sites si elle n'existe pas
  try {
    await pool.query(`
      ALTER TABLE agents 
      ADD COLUMN IF NOT EXISTS can_book_presence_sites BOOLEAN DEFAULT false
    `);
    console.log('Migration can_book_presence_sites OK !');
  } catch (err) {
    console.log('Migration can_book_presence_sites:', err.message);
  }

  // Mettre à jour les rôles (toujours exécuté)
  try {
    await pool.query("UPDATE agents SET role = 'admin' WHERE email = 'redouane@entreprise.fr'");
    await pool.query("UPDATE agents SET role = 'manager' WHERE email = 'sophie@entreprise.fr'");
    console.log('Roles mis a jour !');
  } catch (err) {
    console.log('Erreur mise a jour roles:', err.message);
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

console.log('API PlanniPro demarree sur http://localhost:' + PORT);
console.log('PGHOST:', process.env.PGHOST);
console.log('PGPORT:', process.env.PGPORT);

app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      process.env.FRONTEND_URL,
      process.env.FRONTEND_URL + '/',
      'http://localhost:5173',
      'https://plannipro-frontend.vercel.app',
      'https://plannipro-frontend.vercel.app/'
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

app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable.' });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

app.listen(PORT, () => { });
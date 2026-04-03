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

    // ========== MIGRATIONS AUTO ==========
    console.log('🔄 Vérification des migrations...');

    // Ajouter colonne agent_display_order si elle n'existe pas
    await db.query(`
      ALTER TABLE agents 
      ADD COLUMN IF NOT EXISTS agent_display_order INTEGER DEFAULT 999;
    `);
    console.log('✅ Colonne agent_display_order OK');

    // Initialiser l'ordre pour les agents existants
    await db.query(`
      UPDATE agents 
      SET agent_display_order = ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC)
      WHERE agent_display_order = 999;
    `);
    console.log('✅ Ordre des agents initialisé');
    // ========== FIN MIGRATIONS ==========

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
const { authenticate } = require('./auth-middleware');

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

// ========== ROUTE REORDER AGENTS (AVANT app.use('/api/agents')) ==========
app.patch('/api/agents/reorder', authenticate, async (req, res) => {
  try {
    console.log('🔍 DEBUG - role de l\'utilisateur:', req.agent.role);
    console.log('🔍 DEBUG - email:', req.agent.email);

    if (req.agent.role !== 'manager' && req.agent.role !== 'admin') {
      return res.status(403).json({ error: 'Seuls les managers et admins peuvent réorganiser.' });
    }
    const { agentIds } = req.body;
    if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      return res.status(400).json({ error: 'agentIds invalide.' });
    }
    for (let i = 0; i < agentIds.length; i++) {
      await db.query('UPDATE agents SET agent_display_order = $1 WHERE id = $2', [i + 1, agentIds[i]]);
    }
    const { rows } = await db.query('SELECT * FROM agents ORDER BY agent_display_order');
    console.log('✅ Ordre réorganisé');
    res.json({ success: true, agents: rows });
  } catch (err) {
    console.error('❌ Erreur reorder:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});
// ========== FIN REORDER ==========

app.use('/api/agents', agentsRouter);
app.use('/api/teams', require('./routes/teams'));
app.use('/api/leave-types', require('./routes/leave-types'));
app.use('/api/astreintes', require('./astreintes'));
app.use('/api/announcement', require('./announcement'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== ROUTE REORDER AGENTS ==========
app.patch('/api/agents/reorder', authenticate, async (req, res) => {
  try {
    // Seuls les managers
    if (req.agent.role !== 'manager' && req.agent.role !== 'admin') {
      return res.status(403).json({ error: 'Seuls les managers et admins peuvent réorganiser.' });
    }

    const { agentIds } = req.body;
    if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      return res.status(400).json({ error: 'agentIds doit être un array non-vide.' });
    }

    // Mettre à jour l'ordre pour chaque agent
    for (let i = 0; i < agentIds.length; i++) {
      await db.query(
        'UPDATE agents SET agent_display_order = $1 WHERE id = $2',
        [i + 1, agentIds[i]]
      );
    }

    // Retourner les agents triés
    const { rows } = await db.query(
      'SELECT * FROM agents ORDER BY agent_display_order'
    );

    console.log(`✅ Ordre des agents réorganisé par ${req.agent.email}`);
    res.json({ success: true, agents: rows });
  } catch (err) {
    console.error('❌ Erreur PATCH /api/agents/reorder:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});
// ========== FIN ROUTE REORDER ==========

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

app.get('/run-import', async (req, res) => {
  try {
    const sql = require('fs').readFileSync(require('path').join(__dirname, 'import_data.sql'), 'utf8');
    await db.query(sql);
    res.json({ success: true });
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

app.listen(PORT, () => { });

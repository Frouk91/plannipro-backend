require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');

// ========== INIT DB ==========
async function initDB() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });
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
  await pool.end();
}
initDB();

// ========== EXPRESS SETUP ==========
const app = express();
const server = http.createServer(app);

// ========== SOCKET.IO SETUP ==========
const io = new SocketIOServer(server, {
  cors: {
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
  },
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3001;
console.log('API PlanniPro démarrée sur port ' + PORT);

// ========== MIDDLEWARE ==========
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

// ========== SOCKET.IO HANDLERS ==========
io.on('connection', (socket) => {
  console.log(`✅ Client connecté: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Client déconnecté: ${socket.id}`);
  });

  // Broadcast custom event si nécessaire
  socket.on('message', (data) => {
    console.log('Message reçu:', data);
    io.emit('message', data);
  });
});

// ========== MIDDLEWARE POUR ROUTES ==========
// Injecter io dans req pour l'utiliser dans les routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ========== ROUTES ==========
app.use('/api/auth', require('./auth'));
app.use('/api/leaves', require('./leaves'));
app.use('/api/agents', require('./agents'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/leave-types', require('./routes/leave-types'));
app.use('/api/announcement', require('./announcement'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== ROUTES TEMPORAIRES ==========
app.get('/drop-announcements', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await pool.query('DROP TABLE IF EXISTS announcements;');
    res.json({ success: true, message: 'Table announcements supprimée.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await pool.end();
  }
});

app.get('/run-migration', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await pool.query(`
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
  } finally {
    await pool.end();
  }
});

app.get('/run-import', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const sql = require('fs').readFileSync(require('path').join(__dirname, 'import_data.sql'), 'utf8');
    await pool.query(sql);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ERROR HANDLING ==========
app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable.' });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

// ========== START SERVER ==========
server.listen(PORT, () => {
  console.log(`🚀 Server avec Socket.io actif sur http://localhost:${PORT}`);
});

// ========== EXPORT POUR MODIFYING ROUTES ==========
module.exports = { io };
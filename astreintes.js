const express = require('express');
const db = require('./pool');
const { authenticate } = require('./auth-middleware');

const router = express.Router();
router.use(authenticate);

// GET /api/astreintes - Récupérer toutes les astreintes
router.get('/', async (req, res) => {
  try {
    const { team_name, start_date, end_date } = req.query;
    let query = 'SELECT * FROM astreintes WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (team_name) {
      query += ` AND team_name = $${paramIndex++}`;
      params.push(team_name);
    }

    if (start_date) {
      query += ` AND date_key >= $${paramIndex++}`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND date_key <= $${paramIndex++}`;
      params.push(end_date);
    }

    query += ' ORDER BY date_key, team_name, row_type';

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur GET /api/astreintes:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/astreintes - Créer une astreinte
router.post('/', async (req, res) => {
  try {
    const { team_name, row_type, date_key, agent_id } = req.body;

    if (!team_name || !row_type || !date_key) {
      return res.status(400).json({ error: 'Paramètres manquants: team_name, row_type, date_key' });
    }

    const validRowTypes = ['astreinte', 'action_serveur', 'mail', 'es'];
    if (!validRowTypes.includes(row_type)) {
      return res.status(400).json({ error: `row_type doit être parmi: ${validRowTypes.join(', ')}` });
    }

    if (agent_id) {
      const agentCheck = await db.query('SELECT id FROM agents WHERE id = $1', [agent_id]);
      if (!agentCheck.rows.length) {
        return res.status(400).json({ error: 'Agent introuvable.' });
      }
    }

    const { rows } = await db.query(`
      INSERT INTO astreintes (team_name, row_type, date_key, agent_id, created_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (team_name, row_type, date_key) 
      DO UPDATE SET agent_id = $4, updated_at = NOW()
      RETURNING 
        astreintes.id,
        astreintes.team_name,
        astreintes.row_type,
        astreintes.date_key,
        astreintes.agent_id,
        COALESCE(agents.first_name || ' ' || agents.last_name, '') as agent_name,
        astreintes.created_at,
        astreintes.updated_at
    `, [team_name, row_type, date_key, agent_id || null, req.agent.id]);

    // ⚠️ ATTENTION: Le RETURNING ne retourne que astreintes, pas le JOIN!
    // Il faut faire un SELECT après pour avoir le nom!

    const { rows: finalRows } = await db.query(`
      SELECT 
        a.id,
        a.team_name,
        a.row_type,
        a.date_key,
        a.agent_id,
        COALESCE(ag.first_name || ' ' || ag.last_name, '') as agent_name,
        a.created_at,
        a.updated_at
      FROM astreintes a
      LEFT JOIN agents ag ON a.agent_id = ag.id
      WHERE a.id = $1
    `, [rows[0].id]);

    console.log('✅ Astreinte créée/mise à jour:', finalRows[0].id);
    res.status(201).json(finalRows[0]);
  } catch (err) {
    console.error('❌ Erreur POST /api/astreintes:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PATCH /api/astreintes/:id - Modifier une astreinte
router.patch('/:id', async (req, res) => {
  try {
    const { agent_id } = req.body;

    // Vérifier que l'astreinte existe
    const existingCheck = await db.query('SELECT id FROM astreintes WHERE id = $1', [req.params.id]);
    if (!existingCheck.rows.length) {
      return res.status(404).json({ error: 'Astreinte introuvable.' });
    }

    // Vérifier que l'agent existe (si fourni)
    if (agent_id) {
      const agentCheck = await db.query('SELECT id FROM agents WHERE id = $1', [agent_id]);
      if (!agentCheck.rows.length) {
        return res.status(400).json({ error: 'Agent introuvable.' });
      }
    }

    const { rows } = await db.query(`
      UPDATE astreintes 
      SET agent_id = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [agent_id || null, req.params.id]);

    console.log('✏️ Astreinte modifiée:', req.params.id);
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Erreur PATCH /api/astreintes/:id:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/astreintes/:id - Supprimer une astreinte
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id FROM astreintes WHERE id = $1', [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Astreinte introuvable.' });
    }

    await db.query('DELETE FROM astreintes WHERE id = $1', [req.params.id]);

    console.log('🗑️ Astreinte supprimée:', req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Erreur DELETE /api/astreintes/:id:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/astreintes/range - Supprimer une plage d'astreintes
router.delete('/range/delete', async (req, res) => {
  try {
    const { team_name, row_type, start_date, end_date } = req.body;

    if (!team_name || !row_type || !start_date || !end_date) {
      return res.status(400).json({ error: 'Paramètres manquants: team_name, row_type, start_date, end_date' });
    }

    const { rows } = await db.query(`
      DELETE FROM astreintes 
      WHERE team_name = $1 
        AND row_type = $2 
        AND date_key >= $3 
        AND date_key <= $4
      RETURNING id
    `, [team_name, row_type, start_date, end_date]);

    console.log(`🗑️ ${rows.length} astreintes supprimées dans la plage`);
    res.json({ success: true, deleted: rows.length });
  } catch (err) {
    console.error('❌ Erreur DELETE /api/astreintes/range:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;

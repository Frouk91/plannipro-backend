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

    // Validation
    if (!team_name || !row_type || !date_key) {
      return res.status(400).json({ error: 'Paramètres manquants: team_name, row_type, date_key' });
    }

    const validRowTypes = ['astreinte', 'action_serveur', 'mail', 'es'];
    if (!validRowTypes.includes(row_type)) {
      return res.status(400).json({ error: `row_type doit être parmi: ${validRowTypes.join(', ')}` });
    }

    // Vérifier que l'agent existe (si fourni)
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
      RETURNING *
    `, [team_name, row_type, date_key, agent_id || null, req.agent.id]);

    console.log('✅ Astreinte créée/mise à jour:', rows[0].id);
    res.status(201).json(rows[0]);
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

// GET /api/astreintes/suggest-next - Suggérer le prochain agent (load balancing)
router.get('/suggest-next', async (req, res) => {
  try {
    const { team_name, date_key } = req.query;

    if (!team_name || !date_key) {
      return res.status(400).json({ error: 'Paramètres manquants: team_name, date_key' });
    }

    // Récupérer tous les agents de l'équipe
    const { rows: teamAgents } = await db.query(
      'SELECT id, first_name, last_name, team FROM agents WHERE team = $1 AND role != $2 ORDER BY first_name',
      [team_name, 'admin']
    );

    if (teamAgents.length === 0) {
      return res.status(400).json({ error: 'Aucun agent trouvé dans cette équipe.' });
    }

    // Compter les astreintes par agent sur les 3 derniers mois
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];

    const { rows: astreinteStats } = await db.query(`
      SELECT 
        agent_id,
        COUNT(*) as count
      FROM astreintes
      WHERE team_name = $1 
        AND row_type = 'astreinte'
        AND date_key >= $2
      GROUP BY agent_id
    `, [team_name, threeMonthsAgoStr]);

    const astreinteMap = {};
    astreinteStats.forEach(stat => {
      astreinteMap[stat.agent_id] = parseInt(stat.count);
    });

    // Récupérer l'agent qui a fait l'astreinte LA SEMAINE PRÉCÉDENTE (pour éviter 2 fois d'affilée)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
    
    const { rows: lastWeekAstreinte } = await db.query(`
      SELECT agent_id
      FROM astreintes
      WHERE team_name = $1 
        AND row_type = 'astreinte'
        AND date_key >= $2
        AND date_key <= $3
      LIMIT 1
    `, [team_name, oneWeekAgoStr, oneWeekAgo.toISOString().split('T')[0]]);

    const lastWeekAgentId = lastWeekAstreinte[0]?.agent_id;

    // Récupérer les congés de cette semaine
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    
    const { rows: leaves } = await db.query(`
      SELECT DISTINCT agent_id
      FROM leaves
      WHERE start_date <= $2 AND end_date >= $1 AND status = 'approved'
    `, [date_key, weekEndStr]);

    const onLeaveIds = new Set(leaves.map(l => l.agent_id));

    // Trouver le meilleur candidat
    let bestAgent = null;
    let minCount = Infinity;

    teamAgents.forEach(agent => {
      // Exclure les agents en congés
      if (onLeaveIds.has(agent.id)) return;
      
      // Exclure l'agent de la semaine dernière (contrainte: pas 2 fois d'affilée)
      if (agent.id === lastWeekAgentId) return;
      
      const count = astreinteMap[agent.id] || 0;
      if (count < minCount) {
        minCount = count;
        bestAgent = agent;
      }
    });

    // Si tous les autres sont en congés ou ont fait la semaine dernière, prendre le suivant
    if (!bestAgent) {
      bestAgent = teamAgents.find(a => a.id !== lastWeekAgentId && !onLeaveIds.has(a.id));
    }

    // Stats pour tous les agents
    const stats = teamAgents.map(a => ({
      agent_id: a.id,
      name: `${a.first_name} ${a.last_name}`,
      astreinte_count: astreinteMap[a.id] || 0,
      on_leave: onLeaveIds.has(a.id),
      did_last_week: a.id === lastWeekAgentId,
      is_suggested: bestAgent?.id === a.id
    }));

    console.log('💡 Suggestion auto:', bestAgent?.first_name, bestAgent?.last_name);
    res.json({
      suggested_agent: bestAgent,
      stats: stats
    });
  } catch (err) {
    console.error('❌ Erreur GET /api/astreintes/suggest-next:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;

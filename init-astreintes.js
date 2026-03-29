const db = require('./pool');

async function initAstreintes() {
    try {
        console.log('🔨 Création de la table astreintes...');

        await db.query(`
      CREATE TABLE IF NOT EXISTS astreintes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        team_name VARCHAR(100) NOT NULL,
        row_type VARCHAR(50) NOT NULL CHECK (row_type IN ('astreinte', 'action_serveur', 'mail', 'es')),
        date_key DATE NOT NULL,
        agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
        created_by UUID REFERENCES agents(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(team_name, row_type, date_key)
      );

      CREATE INDEX IF NOT EXISTS idx_astreintes_team ON astreintes(team_name);
      CREATE INDEX IF NOT EXISTS idx_astreintes_date ON astreintes(date_key);
      CREATE INDEX IF NOT EXISTS idx_astreintes_agent ON astreintes(agent_id);
    `);

        console.log('✅ Table astreintes créée avec succès!');
        process.exit(0);

    } catch (err) {
        console.error('❌ ERREUR:', err.message);
        process.exit(1);
    }
}

initAstreintes();
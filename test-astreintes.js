// C:\plannipro\backend\test-astreintes.js
const db = require('./pool');

async function testAstreintes() {
    try {
        console.log('🔍 TEST: Vérification de la table astreintes...\n');

        // 1. Vérifier que la table existe
        const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'astreintes'
      );
    `);

        const tableExists = tableCheck.rows[0].exists;
        console.log('1️⃣ Table existe?', tableExists ? '✅ OUI' : '❌ NON');

        if (!tableExists) {
            console.log('❌ LA TABLE N\'EXISTE PAS! Il faut créer le schéma!');
            process.exit(1);
        }

        // 2. Vérifier les colonnes
        const columnsCheck = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'astreintes'
      ORDER BY ordinal_position;
    `);

        console.log('\n2️⃣ Colonnes de la table:');
        columnsCheck.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type}`);
        });

        // 3. Compter les astreintes existantes
        const countCheck = await db.query('SELECT COUNT(*) as count FROM astreintes');
        const count = countCheck.rows[0].count;
        console.log(`\n3️⃣ Astreintes dans la BD: ${count}`);

        // 4. Tester un INSERT
        console.log('\n4️⃣ Test INSERT...');
        const testInsert = await db.query(`
      INSERT INTO astreintes (team_name, row_type, date_key, agent_id)
      VALUES ('TEST_TEAM', 'astreinte', '2026-03-27', NULL)
      RETURNING *
    `);

        console.log('✅ INSERT OK:', testInsert.rows[0]);

        // 5. Supprimer le test
        await db.query(`DELETE FROM astreintes WHERE team_name = 'TEST_TEAM'`);
        console.log('\n✅ Données de test supprimées');

        console.log('\n✅✅✅ TOUS LES TESTS RÉUSSIS! ✅✅✅');
        process.exit(0);

    } catch (err) {
        console.error('❌ ERREUR:', err.message);
        console.error(err);
        process.exit(1);
    }
}

testAstreintes();
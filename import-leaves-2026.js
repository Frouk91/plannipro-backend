/**
 * Import congés avril+mai 2026 depuis Planning_CS_2026.xlsx
 * Usage: DATABASE_URL="postgres://..." node import-leaves-2026.js
 */
const db = require('./pool');

const LEAVES = [
  // BONA José
  { agent: "BONA José", db_code: "rtt", start: "2026-04-04", end: "2026-04-04" },
  { agent: "BONA José", db_code: "cp", start: "2026-04-10", end: "2026-04-10" },
  { agent: "BONA José", db_code: "cp", start: "2026-04-14", end: "2026-04-15" },
  { agent: "BONA José", db_code: "pont", start: "2026-05-02", end: "2026-05-02" },
  { agent: "BONA José", db_code: "cp", start: "2026-05-12", end: "2026-05-14" },
  // Berquier Patricia
  { agent: "Berquier Patricia", db_code: "rtt", start: "2026-04-14", end: "2026-04-14" },
  { agent: "Berquier Patricia", db_code: "cp", start: "2026-04-22", end: "2026-04-25" },
  { agent: "Berquier Patricia", db_code: "pont", start: "2026-05-09", end: "2026-05-09" },
  { agent: "Berquier Patricia", db_code: "cp", start: "2026-05-12", end: "2026-05-12" },
  { agent: "Berquier Patricia", db_code: "rtt", start: "2026-05-28", end: "2026-05-28" },
  // DA SILVA Kevin
  { agent: "DA SILVA Kevin", db_code: "rtt", start: "2026-04-28", end: "2026-04-28" },
  // DAHILI Omer
  { agent: "DAHILI Omer", db_code: "cp", start: "2026-04-15", end: "2026-04-15" },
  { agent: "DAHILI Omer", db_code: "rtt", start: "2026-04-25", end: "2026-04-25" },
  { agent: "DAHILI Omer", db_code: "cp", start: "2026-05-12", end: "2026-05-12" },
  { agent: "DAHILI Omer", db_code: "cp", start: "2026-05-23", end: "2026-05-23" },
  { agent: "DAHILI Omer", db_code: "cp", start: "2026-05-28", end: "2026-05-28" },
  { agent: "DAHILI Omer", db_code: "pont", start: "2026-05-30", end: "2026-05-30" },
  // DELINCE David
  { agent: "DELINCE David", db_code: "rtt", start: "2026-04-22", end: "2026-04-22" },
  { agent: "DELINCE David", db_code: "rtt", start: "2026-05-19", end: "2026-05-19" },
  { agent: "DELINCE David", db_code: "pont", start: "2026-05-30", end: "2026-05-30" },
  // HORLAVILLE Carole
  { agent: "HORLAVILLE Carole", db_code: "rtt", start: "2026-04-04", end: "2026-04-04" },
  { agent: "HORLAVILLE Carole", db_code: "cp", start: "2026-04-22", end: "2026-04-30" },
  { agent: "HORLAVILLE Carole", db_code: "pont", start: "2026-05-02", end: "2026-05-02" },
  { agent: "HORLAVILLE Carole", db_code: "rtt", start: "2026-05-30", end: "2026-05-30" },
  // JANKOVIC Philippe
  { agent: "JANKOVIC Philippe", db_code: "rtt", start: "2026-04-22", end: "2026-04-22" },
  { agent: "JANKOVIC Philippe", db_code: "cp", start: "2026-05-21", end: "2026-05-28" },
  { agent: "JANKOVIC Philippe", db_code: "pont", start: "2026-05-30", end: "2026-05-30" },
  // KARKABA Camil
  { agent: "KARKABA Camil", db_code: "rtt", start: "2026-04-18", end: "2026-04-18" },
  { agent: "KARKABA Camil", db_code: "cp", start: "2026-05-07", end: "2026-05-07" },
  { agent: "KARKABA Camil", db_code: "pont", start: "2026-05-09", end: "2026-05-09" },
  { agent: "KARKABA Camil", db_code: "rtt", start: "2026-05-26", end: "2026-05-26" },
  // LOYNET Annie
  { agent: "LOYNET Annie", db_code: "cp", start: "2026-04-16", end: "2026-04-18" },
  { agent: "LOYNET Annie", db_code: "rtt", start: "2026-04-30", end: "2026-04-30" },
  { agent: "LOYNET Annie", db_code: "pont", start: "2026-05-02", end: "2026-05-02" },
  { agent: "LOYNET Annie", db_code: "rtt", start: "2026-05-26", end: "2026-05-26" },
  // MANSILLA Yasmina
  { agent: "MANSILLA Yasmina", db_code: "cp", start: "2026-04-22", end: "2026-04-25" },
  { agent: "MANSILLA Yasmina", db_code: "rtt", start: "2026-05-28", end: "2026-05-28" },
  { agent: "MANSILLA Yasmina", db_code: "pont", start: "2026-05-30", end: "2026-05-30" },
  // MIMOUNA Toufik
  { agent: "MIMOUNA Toufik", db_code: "rtt", start: "2026-04-11", end: "2026-04-11" },
  { agent: "MIMOUNA Toufik", db_code: "rtt", start: "2026-04-25", end: "2026-04-25" },
  { agent: "MIMOUNA Toufik", db_code: "cp", start: "2026-04-28", end: "2026-05-07" },
  { agent: "MIMOUNA Toufik", db_code: "pont", start: "2026-05-09", end: "2026-05-09" },
  { agent: "MIMOUNA Toufik", db_code: "cp", start: "2026-05-12", end: "2026-05-12" },
  { agent: "MIMOUNA Toufik", db_code: "rtt", start: "2026-05-13", end: "2026-05-13" },
  // NADOUR Katia
  { agent: "NADOUR Katia", db_code: "rtt", start: "2026-04-04", end: "2026-04-04" },
  { agent: "NADOUR Katia", db_code: "pont", start: "2026-05-09", end: "2026-05-09" },
  { agent: "NADOUR Katia", db_code: "rtt", start: "2026-05-30", end: "2026-05-30" },
  // REDOUANE Farouk
  { agent: "REDOUANE Farouk", db_code: "cp", start: "2026-04-17", end: "2026-04-18" },
  { agent: "REDOUANE Farouk", db_code: "cp", start: "2026-04-22", end: "2026-04-25" },
  { agent: "REDOUANE Farouk", db_code: "rtt", start: "2026-05-23", end: "2026-05-23" },
  { agent: "REDOUANE Farouk", db_code: "cp", start: "2026-05-26", end: "2026-05-28" },
  { agent: "REDOUANE Farouk", db_code: "pont", start: "2026-05-30", end: "2026-05-30" },
  // ROUILLE Gaël
  { agent: "ROUILLE Gaël", db_code: "rtt", start: "2026-04-07", end: "2026-04-07" },
  { agent: "ROUILLE Gaël", db_code: "cp", start: "2026-05-02", end: "2026-05-02" },
  { agent: "ROUILLE Gaël", db_code: "rtt", start: "2026-05-05", end: "2026-05-05" },
  { agent: "ROUILLE Gaël", db_code: "cp", start: "2026-05-06", end: "2026-05-07" },
  { agent: "ROUILLE Gaël", db_code: "pont", start: "2026-05-09", end: "2026-05-09" },
  // SARHAN Adel
  { agent: "SARHAN Adel", db_code: "cp", start: "2026-04-15", end: "2026-04-15" },
  { agent: "SARHAN Adel", db_code: "cp", start: "2026-04-24", end: "2026-04-24" },
  { agent: "SARHAN Adel", db_code: "rtt", start: "2026-04-30", end: "2026-04-30" },
  { agent: "SARHAN Adel", db_code: "cp", start: "2026-05-26", end: "2026-05-28" },
  { agent: "SARHAN Adel", db_code: "pont", start: "2026-05-30", end: "2026-05-30" },
  // Stéphanie Able
  { agent: "Stéphanie Able", db_code: "rtt", start: "2026-04-29", end: "2026-04-29" },
  { agent: "Stéphanie Able", db_code: "pont", start: "2026-05-09", end: "2026-05-09" },
  { agent: "Stéphanie Able", db_code: "rtt", start: "2026-05-21", end: "2026-05-21" },
];

async function run() {
  try {
    console.log('🔌 Connecté\n');

    // 1. Créer le type "pont" s'il n'existe pas
    const { rows: pontCheck } = await db.query(`SELECT id FROM leave_types WHERE code = 'pont'`);
    let pontId;
    if (pontCheck.length === 0) {
      const { rows } = await db.query(`
        INSERT INTO leave_types (code, label, color, requires_approval)
        VALUES ('pont', 'Pont', '#f59e0b', FALSE)
        RETURNING id
      `);
      pontId = rows[0].id;
      console.log('✅ Type "Pont" créé en base\n');
    } else {
      pontId = pontCheck[0].id;
      console.log('ℹ️  Type "Pont" déjà existant\n');
    }

    // 2. Charger agents et leave_types
    const { rows: agentRows } = await db.query(`SELECT id, first_name, last_name FROM agents`);
    const { rows: ltRows } = await db.query(`SELECT id, code FROM leave_types`);

    const agentIndex = {};
    for (const a of agentRows) {
      agentIndex[`${a.last_name} ${a.first_name}`.toUpperCase()] = a.id;
      agentIndex[`${a.first_name} ${a.last_name}`.toUpperCase()] = a.id;
    }

    const ltIndex = {};
    for (const lt of ltRows) ltIndex[lt.code] = lt.id;

    let imported = 0, skipped = 0, notFound = [];

    for (const leave of LEAVES) {
      const key = leave.agent.toUpperCase();
      let agentId = agentIndex[key];

      // Correspondance partielle si nom exact non trouvé
      if (!agentId) {
        const lastName = key.split(' ')[0];
        const match = Object.keys(agentIndex).find(k => k.startsWith(lastName));
        if (match) agentId = agentIndex[match];
      }

      const ltId = ltIndex[leave.db_code];

      if (!agentId) { notFound.push(`Agent: "${leave.agent}"`); skipped++; continue; }
      if (!ltId) { notFound.push(`Type: "${leave.db_code}"`); skipped++; continue; }

      // Anti-doublon
      const { rows: existing } = await db.query(
        `SELECT id FROM leaves WHERE agent_id=$1 AND start_date=$2 AND end_date=$3 AND leave_type_id=$4`,
        [agentId, leave.start, leave.end, ltId]
      );
      if (existing.length > 0) { skipped++; continue; }

      await db.query(
        `INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
         VALUES ($1, $2, $3, $4, 'approved', 'Import Excel Planning 2026')`,
        [agentId, ltId, leave.start, leave.end]
      );
      imported++;
    }

    console.log(`✅ ${imported} congés importés`);
    console.log(`⏭  ${skipped} ignorés (doublons ou non trouvés)`);
    if (notFound.length > 0) {
      console.log('\n⚠️  Non trouvés :');
      [...new Set(notFound)].forEach(e => console.log('  ', e));
    }

  } catch (err) {
    console.error('Erreur:', err);
    process.exit(1);
  }
}

run().catch(err => { console.error('Erreur:', err); process.exit(1); });

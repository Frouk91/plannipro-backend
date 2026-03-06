const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const db = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false }
});

router.get('/', async (req, res) => {
  try {
    await db.query(`
      INSERT INTO leave_types (code, label, color, requires_approval)
      SELECT 'pont', 'Pont', '#f59e0b', FALSE
      WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE code = 'pont')
    `);

  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-15', '2026-04-15', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('SARHAN Adel')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('SARHAN Adel'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-15' AND end_date = '2026-04-15' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-24', '2026-04-24', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('SARHAN Adel')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('SARHAN Adel'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-24' AND end_date = '2026-04-24' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-30', '2026-04-30', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('SARHAN Adel')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('SARHAN Adel'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-30' AND end_date = '2026-04-30' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-26', '2026-05-28', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('SARHAN Adel')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('SARHAN Adel'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-26' AND end_date = '2026-05-28' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-30', '2026-05-30', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('SARHAN Adel')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('SARHAN Adel'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-30' AND end_date = '2026-05-30' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-18', '2026-04-18', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('KARKABA Camil')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('KARKABA Camil'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-18' AND end_date = '2026-04-18' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-07', '2026-05-07', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('KARKABA Camil')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('KARKABA Camil'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-07' AND end_date = '2026-05-07' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-09', '2026-05-09', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('KARKABA Camil')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('KARKABA Camil'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-09' AND end_date = '2026-05-09' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-26', '2026-05-26', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('KARKABA Camil')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('KARKABA Camil'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-26' AND end_date = '2026-05-26' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-11', '2026-04-11', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('MIMOUNA Toufik')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('MIMOUNA Toufik'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-11' AND end_date = '2026-04-11' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-25', '2026-04-25', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('MIMOUNA Toufik')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('MIMOUNA Toufik'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-25' AND end_date = '2026-04-25' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-28', '2026-05-07', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('MIMOUNA Toufik')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('MIMOUNA Toufik'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-28' AND end_date = '2026-05-07' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-09', '2026-05-09', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('MIMOUNA Toufik')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('MIMOUNA Toufik'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-09' AND end_date = '2026-05-09' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-12', '2026-05-12', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('MIMOUNA Toufik')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('MIMOUNA Toufik'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-12' AND end_date = '2026-05-12' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-13', '2026-05-13', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('MIMOUNA Toufik')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('MIMOUNA Toufik'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-13' AND end_date = '2026-05-13' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-22', '2026-04-22', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('JANKOVIC Philippe')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('JANKOVIC Philippe'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-22' AND end_date = '2026-04-22' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-21', '2026-05-28', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('JANKOVIC Philippe')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('JANKOVIC Philippe'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-21' AND end_date = '2026-05-28' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-30', '2026-05-30', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('JANKOVIC Philippe')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('JANKOVIC Philippe'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-30' AND end_date = '2026-05-30' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-15', '2026-04-15', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('DAHILI Omer')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('DAHILI Omer'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-15' AND end_date = '2026-04-15' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-25', '2026-04-25', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('DAHILI Omer')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('DAHILI Omer'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-25' AND end_date = '2026-04-25' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-12', '2026-05-12', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('DAHILI Omer')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('DAHILI Omer'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-12' AND end_date = '2026-05-12' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-23', '2026-05-23', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('DAHILI Omer')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('DAHILI Omer'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-23' AND end_date = '2026-05-23' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-28', '2026-05-28', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('DAHILI Omer')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('DAHILI Omer'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-28' AND end_date = '2026-05-28' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-30', '2026-05-30', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('DAHILI Omer')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('DAHILI Omer'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-30' AND end_date = '2026-05-30' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-28', '2026-04-28', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('DA SILVA Kevin')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('DA SILVA Kevin'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-28' AND end_date = '2026-04-28' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-07', '2026-04-07', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('ROUILLE Gaël')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('ROUILLE Gaël'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-07' AND end_date = '2026-04-07' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-02', '2026-05-02', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('ROUILLE Gaël')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('ROUILLE Gaël'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-02' AND end_date = '2026-05-02' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-05', '2026-05-05', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('ROUILLE Gaël')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('ROUILLE Gaël'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-05' AND end_date = '2026-05-05' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-06', '2026-05-07', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('ROUILLE Gaël')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('ROUILLE Gaël'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-06' AND end_date = '2026-05-07' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-09', '2026-05-09', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('ROUILLE Gaël')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('ROUILLE Gaël'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-09' AND end_date = '2026-05-09' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-17', '2026-04-18', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('REDOUANE Farouk')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('REDOUANE Farouk'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-17' AND end_date = '2026-04-18' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-22', '2026-04-25', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('REDOUANE Farouk')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('REDOUANE Farouk'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-22' AND end_date = '2026-04-25' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-23', '2026-05-23', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('REDOUANE Farouk')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('REDOUANE Farouk'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-23' AND end_date = '2026-05-23' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-26', '2026-05-28', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('REDOUANE Farouk')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('REDOUANE Farouk'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-26' AND end_date = '2026-05-28' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-30', '2026-05-30', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('REDOUANE Farouk')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('REDOUANE Farouk'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-30' AND end_date = '2026-05-30' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-04', '2026-04-04', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('BONA José')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('BONA José'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-04' AND end_date = '2026-04-04' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-10', '2026-04-10', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('BONA José')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('BONA José'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-10' AND end_date = '2026-04-10' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-14', '2026-04-15', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('BONA José')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('BONA José'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-14' AND end_date = '2026-04-15' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-02', '2026-05-02', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('BONA José')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('BONA José'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-02' AND end_date = '2026-05-02' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-12', '2026-05-14', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('BONA José')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('BONA José'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-12' AND end_date = '2026-05-14' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-22', '2026-04-25', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('MANSILLA Yasmina')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('MANSILLA Yasmina'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-22' AND end_date = '2026-04-25' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-28', '2026-05-28', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('MANSILLA Yasmina')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('MANSILLA Yasmina'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-28' AND end_date = '2026-05-28' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-30', '2026-05-30', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('MANSILLA Yasmina')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('MANSILLA Yasmina'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-30' AND end_date = '2026-05-30' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-16', '2026-04-18', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('LOYNET Annie')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('LOYNET Annie'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-16' AND end_date = '2026-04-18' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-30', '2026-04-30', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('LOYNET Annie')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('LOYNET Annie'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-30' AND end_date = '2026-04-30' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-02', '2026-05-02', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('LOYNET Annie')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('LOYNET Annie'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-02' AND end_date = '2026-05-02' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-26', '2026-05-26', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('LOYNET Annie')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('LOYNET Annie'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-26' AND end_date = '2026-05-26' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-22', '2026-04-22', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('DELINCE David')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('DELINCE David'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-22' AND end_date = '2026-04-22' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-19', '2026-05-19', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('DELINCE David')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('DELINCE David'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-19' AND end_date = '2026-05-19' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-30', '2026-05-30', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('DELINCE David')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('DELINCE David'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-30' AND end_date = '2026-05-30' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-04', '2026-04-04', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('NADOUR Katia')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('NADOUR Katia'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-04' AND end_date = '2026-04-04' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-09', '2026-05-09', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('NADOUR Katia')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('NADOUR Katia'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-09' AND end_date = '2026-05-09' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-30', '2026-05-30', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('NADOUR Katia')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('NADOUR Katia'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-30' AND end_date = '2026-05-30' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-29', '2026-04-29', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('Stéphanie Able')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('Stéphanie Able'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-29' AND end_date = '2026-04-29' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-09', '2026-05-09', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('Stéphanie Able')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('Stéphanie Able'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-09' AND end_date = '2026-05-09' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-21', '2026-05-21', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('Stéphanie Able')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('Stéphanie Able'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-21' AND end_date = '2026-05-21' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-04', '2026-04-04', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('HORLAVILLE Carole')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('HORLAVILLE Carole'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-04' AND end_date = '2026-04-04' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-22', '2026-04-30', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('HORLAVILLE Carole')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('HORLAVILLE Carole'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-22' AND end_date = '2026-04-30' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-02', '2026-05-02', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('HORLAVILLE Carole')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('HORLAVILLE Carole'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-02' AND end_date = '2026-05-02' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-30', '2026-05-30', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('HORLAVILLE Carole')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('HORLAVILLE Carole'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-30' AND end_date = '2026-05-30' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-14', '2026-04-14', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('Berquier Patricia')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('Berquier Patricia'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-14' AND end_date = '2026-04-14' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-04-22', '2026-04-25', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('Berquier Patricia')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('Berquier Patricia'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-04-22' AND end_date = '2026-04-25' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-09', '2026-05-09', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'pont'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('Berquier Patricia')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('Berquier Patricia'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-09' AND end_date = '2026-05-09' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-12', '2026-05-12', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'cp'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('Berquier Patricia')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('Berquier Patricia'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-12' AND end_date = '2026-05-12' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);
  await db.query(`
    INSERT INTO leaves (agent_id, leave_type_id, start_date, end_date, status, reason)
    SELECT a.id, lt.id, '2026-05-28', '2026-05-28', 'approved', 'Import Excel Planning 2026'
    FROM agents a
    JOIN leave_types lt ON lt.code = 'rtt'
    WHERE (UPPER(CONCAT(a.last_name, ' ', a.first_name)) = UPPER('Berquier Patricia')
        OR UPPER(CONCAT(a.first_name, ' ', a.last_name)) = UPPER('Berquier Patricia'))
      AND NOT EXISTS (
        SELECT 1 FROM leaves WHERE agent_id = a.id AND start_date = '2026-05-28' AND end_date = '2026-05-28' AND leave_type_id = lt.id
      )
    LIMIT 1
  `);

    const { rows } = await db.query(`SELECT COUNT(*) as total FROM leaves WHERE reason = 'Import Excel Planning 2026'`);
    res.json({ success: true, imported: rows[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

-- ============================================
-- PLANNING PRÉSENCE - Schéma PostgreSQL
-- ============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────
-- ÉQUIPES
-- ──────────────────────────────────────────
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- AGENTS (utilisateurs)
-- ──────────────────────────────────────────
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'manager', 'admin')),
  job_title VARCHAR(100),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  avatar_initials VARCHAR(3),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- TYPES DE CONGÉS
-- ──────────────────────────────────────────
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) NOT NULL UNIQUE,  -- 'cp', 'rtt', 'maladie', etc.
  label VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,         -- Couleur hex
  requires_approval BOOLEAN DEFAULT TRUE,
  max_days_per_year INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Données de base
INSERT INTO leave_types (code, label, color, requires_approval, max_days_per_year) VALUES
  ('cp',         'Congé payé',   '#6366f1', TRUE,  25),
  ('rtt',        'RTT',          '#0ea5e9', TRUE,  12),
  ('maladie',    'Maladie',      '#f59e0b', FALSE, NULL),
  ('formation',  'Formation',    '#10b981', TRUE,  NULL),
  ('teletravail','Télétravail',  '#8b5cf6', FALSE, NULL);

-- ──────────────────────────────────────────
-- DEMANDES DE CONGÉS
-- ──────────────────────────────────────────
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INT NOT NULL,           -- Jours ouvrés calculés automatiquement
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reason TEXT,                       -- Motif optionnel
  manager_comment TEXT,              -- Commentaire du manager
  approved_by UUID REFERENCES agents(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- ──────────────────────────────────────────
-- JOURS FÉRIÉS
-- ──────────────────────────────────────────
CREATE TABLE public_holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  country_code VARCHAR(3) DEFAULT 'FR'
);

-- Jours fériés France 2025
INSERT INTO public_holidays (date, label) VALUES
  ('2025-01-01', 'Jour de l''An'),
  ('2025-04-21', 'Lundi de Pâques'),
  ('2025-05-01', 'Fête du Travail'),
  ('2025-05-08', 'Victoire 1945'),
  ('2025-05-29', 'Ascension'),
  ('2025-06-09', 'Lundi de Pentecôte'),
  ('2025-07-14', 'Fête Nationale'),
  ('2025-08-15', 'Assomption'),
  ('2025-11-01', 'Toussaint'),
  ('2025-11-11', 'Armistice'),
  ('2025-12-25', 'Noël'),
  ('2026-01-01', 'Jour de l''An'),
  ('2026-04-06', 'Lundi de Pâques'),
  ('2026-05-01', 'Fête du Travail'),
  ('2026-05-08', 'Victoire 1945'),
  ('2026-05-14', 'Ascension'),
  ('2026-05-25', 'Lundi de Pentecôte'),
  ('2026-07-14', 'Fête Nationale'),
  ('2026-08-15', 'Assomption'),
  ('2026-11-01', 'Toussaint'),
  ('2026-11-11', 'Armistice'),
  ('2026-12-25', 'Noël');

-- ──────────────────────────────────────────
-- SESSIONS / TOKENS
-- ──────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  token VARCHAR(512) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- INDEX pour la performance
-- ──────────────────────────────────────────
CREATE INDEX idx_leave_requests_agent ON leave_requests(agent_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_agents_team ON agents(team_id);
CREATE INDEX idx_agents_email ON agents(email);

-- ──────────────────────────────────────────
-- TRIGGER: mise à jour automatique updated_at
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER leave_requests_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────
-- VUE : Planning mensuel (pratique pour l'API)
-- ──────────────────────────────────────────
CREATE VIEW v_planning_monthly AS
SELECT
  lr.id,
  a.id AS agent_id,
  a.first_name || ' ' || a.last_name AS agent_name,
  a.avatar_initials,
  t.name AS team_name,
  lt.code AS leave_type_code,
  lt.label AS leave_type_label,
  lt.color,
  lr.start_date,
  lr.end_date,
  lr.total_days,
  lr.status
FROM leave_requests lr
JOIN agents a ON a.id = lr.agent_id
LEFT JOIN teams t ON t.id = a.team_id
JOIN leave_types lt ON lt.id = lr.leave_type_id
WHERE lr.status = 'approved';

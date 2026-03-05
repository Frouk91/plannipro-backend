-- ÉQUIPES
INSERT INTO teams (id, name) VALUES
  ('6e085769-3598-44b4-bda8-142f76b2f176', 'Css Digital'),
  ('c308ece2-63b4-4630-bf72-41be66511cd9', 'Mailing Solution'),
  ('15819cb4-51cc-475e-aba3-d1ebd95da2bf', 'Manager'),
  ('2528e8ad-c368-4cd7-9e89-23ece2bc56bd', 'Test')
ON CONFLICT (id) DO NOTHING;

-- TYPES DE CONGÉS
INSERT INTO leave_types (id, code, label, color, requires_approval) VALUES
  ('fe1dd6a9-3e0c-4bed-a5a8-6eb9f87f40ca', '_cp',        '½ CP',       '#84cc16', true),
  ('06e6f928-af39-4c12-8adf-dd1aa2b6d84a', '_rtt',       '½ RTT',      '#eab308', true),
  ('6150eece-5601-4b11-a102-2d5590064636', 'maladie',    'Absence',    '#f43f5e', false),
  ('967754c5-cfa1-4b4c-b1ea-69168e6b892a', 'cp',         'Congé payé', '#84cc16', true),
  ('b9ab8a99-00d6-40c8-8f3f-d93a4baa0c65', 'formation',  'Formation',  '#65a30d', true),
  ('9611cfcd-a10b-489f-b734-36db8a0e6233', 'paris',      'Paris',      '#ef4444', true),
  ('c96fb6a0-b5c8-470f-9648-575c9ea27ebb', 'teletravail','Pont',       '#92400e', true),
  ('79241084-708d-4510-85de-1af20e42f269', 'rtt',        'RTT',        '#eab308', true),
  ('4bc54ea2-9f26-45ea-82d5-6d28caeda214', 'rueil',      'Rueil',      '#10b981', true)
ON CONFLICT (id) DO NOTHING;

-- AGENTS (mot de passe temporaire : admin1234)
INSERT INTO agents (id, first_name, last_name, email, password_hash, role, avatar_initials, can_book_presence_sites, is_active, team_id) VALUES
  ('5fe803ef-bc05-4b96-8a22-18d2d5bd6f83', 'Adel',      'Sarhan',    'a.sarhan@quadient.com',     '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'AS', true,  true, '6e085769-3598-44b4-bda8-142f76b2f176'),
  ('353e147e-4a28-41d7-b719-cdbebaf9aae1', 'Farouk',    'Redouane',  'f.redouane@quadient.com',   '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'coordinator', 'FR', false, true, '15819cb4-51cc-475e-aba3-d1ebd95da2bf'),
  ('a40f37fe-90d3-4d96-8c83-abcd1b76c969', 'Gael',      'Rouille',   'g.rouille@quadient.com',    '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'GR', true,  true, '6e085769-3598-44b4-bda8-142f76b2f176'),
  ('8fe0f55a-0a97-4d0b-9102-6e3571a50784', 'José',      'Bona',      'j.bona@quadient.com',       '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'JB', false, true, 'c308ece2-63b4-4630-bf72-41be66511cd9'),
  ('cfd928f0-5f7e-40a8-aa1e-8a2df1abd251', 'Katia',     'Nadour',    'k.nadour@quadient.com',     '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'KN', false, true, 'c308ece2-63b4-4630-bf72-41be66511cd9'),
  ('8037e975-1620-429d-bf60-5b851ae0d211', 'Kevin',     'Da Silva',  'k.dasilva@quadient.com',    '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'KD', false, true, '6e085769-3598-44b4-bda8-142f76b2f176'),
  ('2613ba7a-7e9e-4a5d-8504-74114f2fd62e', 'Annie',     'Loynet',    'a.loynet@quadient.com',     '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'AL', false, true, 'c308ece2-63b4-4630-bf72-41be66511cd9'),
  ('5a8f3eee-6914-4b84-b133-cbbe51e4f574', 'Camil',     'Karkaba',   'c.karkaba@quadient.com',    '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'CK', false, true, '6e085769-3598-44b4-bda8-142f76b2f176'),
  ('219f5360-208f-40cd-ae9a-9ac967da8438', 'Carol',     'Horlaville','c.horlaville@quadient.com', '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'CH', false, true, 'c308ece2-63b4-4630-bf72-41be66511cd9'),
  ('682b849e-3cdd-4f8f-8916-a08d64750e9f', 'David',     'Delince',   'd.delince@quadient.com',    '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'DD', false, true, 'c308ece2-63b4-4630-bf72-41be66511cd9'),
  ('7c431295-1446-4060-86ac-6c42cfffffbe', 'Omer',      'Dahili',    'o.dahili@quadient.com',     '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'OD', true,  true, '6e085769-3598-44b4-bda8-142f76b2f176'),
  ('2db7b81c-62ae-4e07-8282-8786e0cb2a0d', 'Patricia',  'Berquier',  'p.berquier@quadient.com',   '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'coordinator', 'PB', false, true, '15819cb4-51cc-475e-aba3-d1ebd95da2bf'),
  ('27de4ae9-ce28-4d4d-bf6f-5c9ed8205808', 'Philippe',  'Jankovic',  'p.jankovic@quadient.com',   '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'PJ', false, true, '6e085769-3598-44b4-bda8-142f76b2f176'),
  ('862e532f-bafd-48d7-a151-e6c1c57c2784', 'Sophie',    'Martin',    'sophie@entreprise.fr',      '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'manager',     'SM', false, true, '15819cb4-51cc-475e-aba3-d1ebd95da2bf'),
  ('374ca5ca-a359-4c76-acea-7cdb025dac44', 'Stéphanie', 'Able',      's.able@quadient.com',       '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'SA', false, true, 'c308ece2-63b4-4630-bf72-41be66511cd9'),
  ('1d195c00-f1e1-4a28-a31c-52e133b9e3f8', 'Toufik',    'Mimouna',   't.mimouna@quadient.com',    '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'TM', true,  true, '6e085769-3598-44b4-bda8-142f76b2f176'),
  ('9ee61a59-bc01-4914-beb4-84595f10ce7b', 'Yannick',   'Loubery',   'y.loubery@quadient.com',    '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'YL', true,  true, '6e085769-3598-44b4-bda8-142f76b2f176'),
  ('f0a727e1-af87-458b-b0c5-d79217a7d832', 'Yasmina',   'Mansilla',  'y.mansilla@quadient.com',   '$2b$12$l7MirMlwpGch.ET8ikUVJOUQfrsA/2XCJW7TZYo6oQNPckIBaWIzy', 'agent',       'YM', false, true, 'c308ece2-63b4-4630-bf72-41be66511cd9')
ON CONFLICT (id) DO NOTHING;

-- Mettre à jour le compte admin existant
UPDATE agents SET
  team_id = '15819cb4-51cc-475e-aba3-d1ebd95da2bf',
  role = 'admin'
WHERE email = 'redouane@entreprise.fr';

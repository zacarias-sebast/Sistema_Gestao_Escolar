-- ============================================================
-- EDUFLOW — Script de Banco de Dados para Supabase
-- ============================================================
-- Como usar:
--   1. Acesse seu projeto no Supabase (supabase.com)
--   2. Vá em SQL Editor
--   3. Cole este script inteiro e clique em "Run"
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABELA: professores
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS professores (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          text        NOT NULL,
  email         text        NOT NULL UNIQUE,
  telefone      text,
  especialidade text        NOT NULL DEFAULT 'Não informada',
  status        text        NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  avatar_url    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. TABELA: turmas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS turmas (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         text        NOT NULL,
  serie        text        NOT NULL,
  ano          integer     NOT NULL DEFAULT 2025,
  sala         text,
  capacidade   integer     NOT NULL DEFAULT 30,
  professor_id uuid        REFERENCES professores(id) ON DELETE SET NULL,
  status       text        NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (nome, ano)
);

-- ------------------------------------------------------------
-- 3. TABELA: alunos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alunos (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            text        NOT NULL,
  email           text,
  matricula       text        NOT NULL UNIQUE,
  turma_id        uuid        REFERENCES turmas(id) ON DELETE SET NULL,
  telefone        text,
  endereco        text,
  data_nascimento date,
  responsavel     text,
  status          text        NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'formado')),
  avatar_url      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 4. TABELA: disciplinas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS disciplinas (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          text        NOT NULL,
  codigo        text        NOT NULL UNIQUE,
  professor_id  uuid        REFERENCES professores(id) ON DELETE SET NULL,
  turma_id      uuid        REFERENCES turmas(id)      ON DELETE SET NULL,
  carga_horaria integer     NOT NULL DEFAULT 4,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 5. TABELA: notas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notas (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id      uuid         NOT NULL REFERENCES alunos(id)       ON DELETE CASCADE,
  disciplina_id uuid         NOT NULL REFERENCES disciplinas(id)  ON DELETE CASCADE,
  turma_id      uuid         REFERENCES turmas(id)                ON DELETE SET NULL,
  tipo          text         NOT NULL CHECK (tipo IN ('av1', 'av2', 'av3', 'media')),
  valor         numeric(4,1) NOT NULL CHECK (valor >= 0 AND valor <= 20),
  semestre      integer      DEFAULT 1,
  data          date         NOT NULL DEFAULT CURRENT_DATE,
  created_at    timestamptz  NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 6. TABELA: frequencias
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS frequencias (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id      uuid        NOT NULL REFERENCES alunos(id)       ON DELETE CASCADE,
  turma_id      uuid        REFERENCES turmas(id)                ON DELETE SET NULL,
  disciplina_id uuid        REFERENCES disciplinas(id)           ON DELETE SET NULL,
  data          date        NOT NULL DEFAULT CURRENT_DATE,
  status        text        NOT NULL CHECK (status IN ('presente', 'ausente', 'justificado')),
  justificativa text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (aluno_id, data)
);

-- ------------------------------------------------------------
-- 7. TABELA: horarios
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS horarios (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id      uuid        NOT NULL REFERENCES turmas(id)       ON DELETE CASCADE,
  disciplina_id uuid        NOT NULL REFERENCES disciplinas(id)  ON DELETE CASCADE,
  professor_id  uuid        REFERENCES professores(id)           ON DELETE SET NULL,
  dia_semana    smallint    NOT NULL CHECK (dia_semana BETWEEN 1 AND 5),
  horario_inicio time       NOT NULL,
  horario_fim   time        NOT NULL,
  sala          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (turma_id, dia_semana, horario_inicio)
);

-- ------------------------------------------------------------
-- 8. TABELA: comunicados
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comunicados (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       text        NOT NULL,
  conteudo     text        NOT NULL,
  autor        text        DEFAULT 'Administrador',
  tipo         text        NOT NULL DEFAULT 'geral' CHECK (tipo IN ('geral', 'turma', 'importante')),
  turma_id     uuid        REFERENCES turmas(id) ON DELETE SET NULL,
  publicado_em date        NOT NULL DEFAULT CURRENT_DATE,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- ÍNDICES
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_alunos_turma      ON alunos(turma_id);
CREATE INDEX IF NOT EXISTS idx_alunos_status     ON alunos(status);
CREATE INDEX IF NOT EXISTS idx_notas_aluno       ON notas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_notas_disciplina  ON notas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_notas_data        ON notas(data);
CREATE INDEX IF NOT EXISTS idx_frequencias_aluno ON frequencias(aluno_id);
CREATE INDEX IF NOT EXISTS idx_frequencias_data  ON frequencias(data);
CREATE INDEX IF NOT EXISTS idx_frequencias_turma ON frequencias(turma_id);
CREATE INDEX IF NOT EXISTS idx_horarios_turma    ON horarios(turma_id);
CREATE INDEX IF NOT EXISTS idx_horarios_dia      ON horarios(dia_semana);
CREATE INDEX IF NOT EXISTS idx_comunicados_tipo  ON comunicados(tipo);
CREATE INDEX IF NOT EXISTS idx_disciplinas_turma ON disciplinas(turma_id);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- (ambiente de desenvolvimento — libera tudo via anon key)
-- ------------------------------------------------------------
ALTER TABLE professores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequencias  ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios     ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_professores"  ON professores  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "rls_turmas"       ON turmas       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "rls_alunos"       ON alunos       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "rls_disciplinas"  ON disciplinas  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "rls_notas"        ON notas        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "rls_frequencias"  ON frequencias  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "rls_horarios"     ON horarios     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "rls_comunicados"  ON comunicados  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED — dados iniciais
-- ============================================================

-- Professores
INSERT INTO professores (nome, email, telefone, especialidade, status) VALUES
  ('Maria da Silva',  'maria@escola.edu',  '(11) 98765-4321', 'Matemática', 'ativo'),
  ('Carlos Santos',   'carlos@escola.edu', '(11) 91234-5678', 'Português',  'ativo'),
  ('Ana Oliveira',    'ana@escola.edu',    '(11) 95555-1234', 'Ciências',   'ativo'),
  ('João Pereira',    'joao@escola.edu',   '(11) 96666-7890', 'História',   'ativo'),
  ('Lucia Ferreira',  'lucia@escola.edu',  '(11) 97777-0000', 'Física',     'ativo')
ON CONFLICT (email) DO NOTHING;

-- Turmas
INSERT INTO turmas (nome, serie, ano, sala, capacidade, professor_id, status)
  SELECT '6º Ano A', '6º Ano', 2025, 'Sala 101', 30, id, 'ativa' FROM professores WHERE email = 'maria@escola.edu'
ON CONFLICT (nome, ano) DO NOTHING;

INSERT INTO turmas (nome, serie, ano, sala, capacidade, professor_id, status)
  SELECT '6º Ano B', '6º Ano', 2025, 'Sala 102', 30, id, 'ativa' FROM professores WHERE email = 'carlos@escola.edu'
ON CONFLICT (nome, ano) DO NOTHING;

INSERT INTO turmas (nome, serie, ano, sala, capacidade, professor_id, status)
  SELECT '7º Ano A', '7º Ano', 2025, 'Sala 201', 32, id, 'ativa' FROM professores WHERE email = 'maria@escola.edu'
ON CONFLICT (nome, ano) DO NOTHING;

INSERT INTO turmas (nome, serie, ano, sala, capacidade, professor_id, status)
  SELECT '8º Ano A', '8º Ano', 2025, 'Sala 301', 28, id, 'ativa' FROM professores WHERE email = 'ana@escola.edu'
ON CONFLICT (nome, ano) DO NOTHING;

INSERT INTO turmas (nome, serie, ano, sala, capacidade, professor_id, status)
  SELECT '9º Ano A', '9º Ano', 2025, 'Sala 401', 35, id, 'ativa' FROM professores WHERE email = 'joao@escola.edu'
ON CONFLICT (nome, ano) DO NOTHING;

-- Alunos
INSERT INTO alunos (nome, matricula, turma_id, telefone, data_nascimento, responsavel, status)
  SELECT 'Lucas Oliveira',   'MTR-2025-001', id, '(11) 91111-0001', '2013-03-15', 'Fábio Oliveira',    'ativo'  FROM turmas WHERE nome = '6º Ano A'
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO alunos (nome, matricula, turma_id, telefone, data_nascimento, responsavel, status)
  SELECT 'Ana Carolina',     'MTR-2025-002', id, '(11) 91111-0002', '2013-06-22', 'Fernanda Lima',     'ativo'  FROM turmas WHERE nome = '6º Ano A'
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO alunos (nome, matricula, turma_id, telefone, data_nascimento, responsavel, status)
  SELECT 'Pedro Souza',      'MTR-2025-003', id, '(11) 91111-0003', '2013-01-08', 'Roberto Souza',     'ativo'  FROM turmas WHERE nome = '6º Ano B'
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO alunos (nome, matricula, turma_id, telefone, data_nascimento, responsavel, status)
  SELECT 'Julia Martins',    'MTR-2025-004', id, '(11) 91111-0004', '2013-09-14', 'Paula Martins',     'ativo'  FROM turmas WHERE nome = '6º Ano B'
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO alunos (nome, matricula, turma_id, telefone, data_nascimento, responsavel, status)
  SELECT 'Mateus Costa',     'MTR-2025-005', id, '(11) 91111-0005', '2012-11-30', 'Marcos Costa',      'ativo'  FROM turmas WHERE nome = '7º Ano A'
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO alunos (nome, matricula, turma_id, telefone, data_nascimento, responsavel, status)
  SELECT 'Camila Rodrigues', 'MTR-2025-006', id, '(11) 91111-0006', '2012-04-19', 'Leticia Rodrigues', 'ativo'  FROM turmas WHERE nome = '7º Ano A'
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO alunos (nome, matricula, turma_id, telefone, data_nascimento, responsavel, status)
  SELECT 'Gabriel Pereira',  'MTR-2025-007', id, '(11) 91111-0007', '2011-07-05', 'Eduardo Pereira',   'ativo'  FROM turmas WHERE nome = '8º Ano A'
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO alunos (nome, matricula, turma_id, telefone, data_nascimento, responsavel, status)
  SELECT 'Fernanda Lima',    'MTR-2025-008', id, '(11) 91111-0008', '2011-12-25', 'Sandra Lima',       'ativo'  FROM turmas WHERE nome = '8º Ano A'
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO alunos (nome, matricula, turma_id, telefone, data_nascimento, responsavel, status)
  SELECT 'Diego Santos',     'MTR-2025-009', id, '(11) 91111-0009', '2010-02-14', 'Ricardo Santos',    'ativo'  FROM turmas WHERE nome = '9º Ano A'
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO alunos (nome, matricula, turma_id, telefone, data_nascimento, responsavel, status)
  SELECT 'Isabela Ferreira', 'MTR-2025-010', id, '(11) 91111-0010', '2010-08-18', 'Claudia Ferreira',  'ativo'  FROM turmas WHERE nome = '9º Ano A'
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO alunos (nome, matricula, turma_id, telefone, data_nascimento, responsavel, status)
  SELECT 'Thiago Almeida',   'MTR-2025-011', id, '(11) 91111-0011', '2013-05-10', 'Sergio Almeida',    'ativo'  FROM turmas WHERE nome = '6º Ano A'
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO alunos (nome, matricula, turma_id, telefone, data_nascimento, responsavel, status)
  SELECT 'Larissa Gomes',    'MTR-2025-012', id, '(11) 91111-0012', '2013-10-02', 'Adriana Gomes',     'inativo' FROM turmas WHERE nome = '6º Ano B'
ON CONFLICT (matricula) DO NOTHING;

-- Disciplinas
INSERT INTO disciplinas (nome, codigo, professor_id, turma_id, carga_horaria)
  SELECT 'Matemática', 'MAT-6A', p.id, t.id, 4 FROM professores p, turmas t WHERE p.email='maria@escola.edu'  AND t.nome='6º Ano A'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO disciplinas (nome, codigo, professor_id, turma_id, carga_horaria)
  SELECT 'Português',  'POR-6A', p.id, t.id, 4 FROM professores p, turmas t WHERE p.email='carlos@escola.edu' AND t.nome='6º Ano A'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO disciplinas (nome, codigo, professor_id, turma_id, carga_horaria)
  SELECT 'Ciências',   'CIE-6A', p.id, t.id, 3 FROM professores p, turmas t WHERE p.email='ana@escola.edu'    AND t.nome='6º Ano A'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO disciplinas (nome, codigo, professor_id, turma_id, carga_horaria)
  SELECT 'Português',  'POR-6B', p.id, t.id, 4 FROM professores p, turmas t WHERE p.email='carlos@escola.edu' AND t.nome='6º Ano B'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO disciplinas (nome, codigo, professor_id, turma_id, carga_horaria)
  SELECT 'Matemática', 'MAT-6B', p.id, t.id, 4 FROM professores p, turmas t WHERE p.email='maria@escola.edu'  AND t.nome='6º Ano B'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO disciplinas (nome, codigo, professor_id, turma_id, carga_horaria)
  SELECT 'Ciências',   'CIE-7A', p.id, t.id, 3 FROM professores p, turmas t WHERE p.email='ana@escola.edu'    AND t.nome='7º Ano A'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO disciplinas (nome, codigo, professor_id, turma_id, carga_horaria)
  SELECT 'História',   'HIS-7A', p.id, t.id, 3 FROM professores p, turmas t WHERE p.email='joao@escola.edu'   AND t.nome='7º Ano A'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO disciplinas (nome, codigo, professor_id, turma_id, carga_horaria)
  SELECT 'História',   'HIS-8A', p.id, t.id, 3 FROM professores p, turmas t WHERE p.email='joao@escola.edu'   AND t.nome='8º Ano A'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO disciplinas (nome, codigo, professor_id, turma_id, carga_horaria)
  SELECT 'Física',     'FIS-9A', p.id, t.id, 3 FROM professores p, turmas t WHERE p.email='lucia@escola.edu'  AND t.nome='9º Ano A'
ON CONFLICT (codigo) DO NOTHING;

-- Notas
INSERT INTO notas (aluno_id, disciplina_id, turma_id, tipo, valor, data)
  SELECT a.id, d.id, t.id, 'av1', 8.5, '2025-01-15'
  FROM alunos a, disciplinas d, turmas t WHERE a.matricula='MTR-2025-001' AND d.codigo='MAT-6A' AND t.nome='6º Ano A';

INSERT INTO notas (aluno_id, disciplina_id, turma_id, tipo, valor, data)
  SELECT a.id, d.id, t.id, 'av2', 9.0, '2025-01-22'
  FROM alunos a, disciplinas d, turmas t WHERE a.matricula='MTR-2025-001' AND d.codigo='MAT-6A' AND t.nome='6º Ano A';

INSERT INTO notas (aluno_id, disciplina_id, turma_id, tipo, valor, data)
  SELECT a.id, d.id, t.id, 'av1', 9.5, '2025-01-15'
  FROM alunos a, disciplinas d, turmas t WHERE a.matricula='MTR-2025-002' AND d.codigo='MAT-6A' AND t.nome='6º Ano A';

INSERT INTO notas (aluno_id, disciplina_id, turma_id, tipo, valor, data)
  SELECT a.id, d.id, t.id, 'av2', 8.8, '2025-01-22'
  FROM alunos a, disciplinas d, turmas t WHERE a.matricula='MTR-2025-002' AND d.codigo='MAT-6A' AND t.nome='6º Ano A';

INSERT INTO notas (aluno_id, disciplina_id, turma_id, tipo, valor, data)
  SELECT a.id, d.id, t.id, 'av1', 6.0, '2025-01-15'
  FROM alunos a, disciplinas d, turmas t WHERE a.matricula='MTR-2025-003' AND d.codigo='POR-6B' AND t.nome='6º Ano B';

INSERT INTO notas (aluno_id, disciplina_id, turma_id, tipo, valor, data)
  SELECT a.id, d.id, t.id, 'av2', 7.5, '2025-01-22'
  FROM alunos a, disciplinas d, turmas t WHERE a.matricula='MTR-2025-003' AND d.codigo='POR-6B' AND t.nome='6º Ano B';

INSERT INTO notas (aluno_id, disciplina_id, turma_id, tipo, valor, data)
  SELECT a.id, d.id, t.id, 'av1', 5.0, '2025-01-15'
  FROM alunos a, disciplinas d, turmas t WHERE a.matricula='MTR-2025-005' AND d.codigo='CIE-7A' AND t.nome='7º Ano A';

INSERT INTO notas (aluno_id, disciplina_id, turma_id, tipo, valor, data)
  SELECT a.id, d.id, t.id, 'av2', 5.8, '2025-01-22'
  FROM alunos a, disciplinas d, turmas t WHERE a.matricula='MTR-2025-005' AND d.codigo='CIE-7A' AND t.nome='7º Ano A';

INSERT INTO notas (aluno_id, disciplina_id, turma_id, tipo, valor, data)
  SELECT a.id, d.id, t.id, 'av1', 4.0, '2025-01-15'
  FROM alunos a, disciplinas d, turmas t WHERE a.matricula='MTR-2025-007' AND d.codigo='HIS-8A' AND t.nome='8º Ano A';

INSERT INTO notas (aluno_id, disciplina_id, turma_id, tipo, valor, data)
  SELECT a.id, d.id, t.id, 'av2', 4.5, '2025-01-22'
  FROM alunos a, disciplinas d, turmas t WHERE a.matricula='MTR-2025-007' AND d.codigo='HIS-8A' AND t.nome='8º Ano A';

INSERT INTO notas (aluno_id, disciplina_id, turma_id, tipo, valor, data)
  SELECT a.id, d.id, t.id, 'av1', 9.8, '2025-01-15'
  FROM alunos a, disciplinas d, turmas t WHERE a.matricula='MTR-2025-008' AND d.codigo='HIS-8A' AND t.nome='8º Ano A';

INSERT INTO notas (aluno_id, disciplina_id, turma_id, tipo, valor, data)
  SELECT a.id, d.id, t.id, 'av2', 9.2, '2025-01-22'
  FROM alunos a, disciplinas d, turmas t WHERE a.matricula='MTR-2025-008' AND d.codigo='HIS-8A' AND t.nome='8º Ano A';

INSERT INTO notas (aluno_id, disciplina_id, turma_id, tipo, valor, data)
  SELECT a.id, d.id, t.id, 'av1', 3.5, '2025-01-15'
  FROM alunos a, disciplinas d, turmas t WHERE a.matricula='MTR-2025-011' AND d.codigo='MAT-6A' AND t.nome='6º Ano A';

INSERT INTO notas (aluno_id, disciplina_id, turma_id, tipo, valor, data)
  SELECT a.id, d.id, t.id, 'av2', 4.2, '2025-01-22'
  FROM alunos a, disciplinas d, turmas t WHERE a.matricula='MTR-2025-011' AND d.codigo='MAT-6A' AND t.nome='6º Ano A';

-- Frequências (hoje)
INSERT INTO frequencias (aluno_id, turma_id, data, status)
  SELECT a.id, a.turma_id, CURRENT_DATE, 'presente'
  FROM alunos a WHERE a.matricula IN ('MTR-2025-001','MTR-2025-002','MTR-2025-004','MTR-2025-006','MTR-2025-008','MTR-2025-009','MTR-2025-011')
ON CONFLICT (aluno_id, data) DO NOTHING;

INSERT INTO frequencias (aluno_id, turma_id, data, status)
  SELECT a.id, a.turma_id, CURRENT_DATE, 'ausente'
  FROM alunos a WHERE a.matricula IN ('MTR-2025-003','MTR-2025-010')
ON CONFLICT (aluno_id, data) DO NOTHING;

INSERT INTO frequencias (aluno_id, turma_id, data, status, justificativa)
  SELECT a.id, a.turma_id, CURRENT_DATE, 'justificado', 'Atendimento médico'
  FROM alunos a WHERE a.matricula IN ('MTR-2025-005','MTR-2025-007')
ON CONFLICT (aluno_id, data) DO NOTHING;

-- Horários
INSERT INTO horarios (turma_id, disciplina_id, professor_id, dia_semana, horario_inicio, horario_fim, sala)
  SELECT t.id, d.id, p.id, 1, '07:00', '08:00', 'Sala 101'
  FROM turmas t, disciplinas d, professores p WHERE t.nome='6º Ano A' AND d.codigo='MAT-6A' AND p.email='maria@escola.edu'
ON CONFLICT (turma_id, dia_semana, horario_inicio) DO NOTHING;

INSERT INTO horarios (turma_id, disciplina_id, professor_id, dia_semana, horario_inicio, horario_fim, sala)
  SELECT t.id, d.id, p.id, 1, '08:00', '09:00', 'Sala 101'
  FROM turmas t, disciplinas d, professores p WHERE t.nome='6º Ano A' AND d.codigo='POR-6A' AND p.email='carlos@escola.edu'
ON CONFLICT (turma_id, dia_semana, horario_inicio) DO NOTHING;

INSERT INTO horarios (turma_id, disciplina_id, professor_id, dia_semana, horario_inicio, horario_fim, sala)
  SELECT t.id, d.id, p.id, 2, '07:00', '08:00', 'Sala 101'
  FROM turmas t, disciplinas d, professores p WHERE t.nome='6º Ano A' AND d.codigo='CIE-6A' AND p.email='ana@escola.edu'
ON CONFLICT (turma_id, dia_semana, horario_inicio) DO NOTHING;

INSERT INTO horarios (turma_id, disciplina_id, professor_id, dia_semana, horario_inicio, horario_fim, sala)
  SELECT t.id, d.id, p.id, 3, '07:00', '08:00', 'Sala 101'
  FROM turmas t, disciplinas d, professores p WHERE t.nome='6º Ano A' AND d.codigo='MAT-6A' AND p.email='maria@escola.edu'
ON CONFLICT (turma_id, dia_semana, horario_inicio) DO NOTHING;

INSERT INTO horarios (turma_id, disciplina_id, professor_id, dia_semana, horario_inicio, horario_fim, sala)
  SELECT t.id, d.id, p.id, 1, '09:00', '10:00', 'Sala 102'
  FROM turmas t, disciplinas d, professores p WHERE t.nome='6º Ano B' AND d.codigo='POR-6B' AND p.email='carlos@escola.edu'
ON CONFLICT (turma_id, dia_semana, horario_inicio) DO NOTHING;

INSERT INTO horarios (turma_id, disciplina_id, professor_id, dia_semana, horario_inicio, horario_fim, sala)
  SELECT t.id, d.id, p.id, 2, '07:00', '08:00', 'Sala 102'
  FROM turmas t, disciplinas d, professores p WHERE t.nome='6º Ano B' AND d.codigo='MAT-6B' AND p.email='maria@escola.edu'
ON CONFLICT (turma_id, dia_semana, horario_inicio) DO NOTHING;

INSERT INTO horarios (turma_id, disciplina_id, professor_id, dia_semana, horario_inicio, horario_fim, sala)
  SELECT t.id, d.id, p.id, 3, '07:00', '08:00', 'Sala 201'
  FROM turmas t, disciplinas d, professores p WHERE t.nome='7º Ano A' AND d.codigo='CIE-7A' AND p.email='ana@escola.edu'
ON CONFLICT (turma_id, dia_semana, horario_inicio) DO NOTHING;

INSERT INTO horarios (turma_id, disciplina_id, professor_id, dia_semana, horario_inicio, horario_fim, sala)
  SELECT t.id, d.id, p.id, 3, '08:00', '09:00', 'Sala 201'
  FROM turmas t, disciplinas d, professores p WHERE t.nome='7º Ano A' AND d.codigo='HIS-7A' AND p.email='joao@escola.edu'
ON CONFLICT (turma_id, dia_semana, horario_inicio) DO NOTHING;

INSERT INTO horarios (turma_id, disciplina_id, professor_id, dia_semana, horario_inicio, horario_fim, sala)
  SELECT t.id, d.id, p.id, 4, '07:00', '08:00', 'Sala 301'
  FROM turmas t, disciplinas d, professores p WHERE t.nome='8º Ano A' AND d.codigo='HIS-8A' AND p.email='joao@escola.edu'
ON CONFLICT (turma_id, dia_semana, horario_inicio) DO NOTHING;

INSERT INTO horarios (turma_id, disciplina_id, professor_id, dia_semana, horario_inicio, horario_fim, sala)
  SELECT t.id, d.id, p.id, 5, '07:00', '08:00', 'Sala 401'
  FROM turmas t, disciplinas d, professores p WHERE t.nome='9º Ano A' AND d.codigo='FIS-9A' AND p.email='lucia@escola.edu'
ON CONFLICT (turma_id, dia_semana, horario_inicio) DO NOTHING;

-- Comunicados
INSERT INTO comunicados (titulo, conteudo, autor, tipo, publicado_em) VALUES
  ('Recesso Escolar — Fevereiro',
   'Informamos que o recesso escolar será de 10 a 21 de fevereiro de 2025. Durante este período não haverá aulas presenciais. Aproveite para descansar e se atualizar com as atividades complementares disponíveis no portal.',
   'Administrador', 'importante', '2025-01-28'),
  ('Entrega de Boletins — 1º Bimestre',
   'Os boletins de notas do 1º bimestre estarão disponíveis a partir de 30 de janeiro. Os responsáveis podem acessar pelo sistema ou retirar presencialmente na secretaria.',
   'Administrador', 'geral', '2025-01-27'),
  ('Reunião de Pais — 6º Ano',
   'Convocamos os responsáveis dos alunos da 6ª série para reunião no dia 05 de fevereiro às 19h na sala do diretor. Pauta: adaptação ao novo ano escolar e programação do bimestre.',
   'Administrador', 'turma', '2025-01-25'),
  ('Olimpíada de Matemática 2025',
   'As inscrições para a Olimpíada Brasileira de Matemática estão abertas até 15 de fevereiro. Todos os alunos são incentivados a participar. Inscreva-se pela secretaria.',
   'Administrador', 'geral', '2025-01-24'),
  ('Manutenção no Sistema',
   'O sistema estará em manutenção programada no sábado, 1º de fevereiro, das 22h às 06h de domingo. Todos os serviços serão retomados normalmente.',
   'Administrador', 'geral', '2025-01-23');

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================

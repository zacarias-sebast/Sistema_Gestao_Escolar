// Perfis de usuário
export type UserRole = 'admin' | 'professor' | 'aluno';

export interface User {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  avatar?: string;
  created_at?: string;
}

// Alunos
export interface Aluno {
  id: string;
  nome: string;
  email?: string;
  matricula: string;
  turma_id?: string;
  turma?: string;
  telefone?: string;
  endereco?: string;
  data_nascimento?: string;
  responsavel?: string;
  status: 'ativo' | 'inativo' | 'formado';
  media_geral?: number;
  avatar?: string;
  created_at?: string;
}

// Professores
export interface Professor {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  especialidade: string;
  turmas: string[];
  status: 'ativo' | 'inativo';
  avatar?: string;
  created_at?: string;
}

// Turmas
export interface Turma {
  id: string;
  nome: string;
  ano: number;
  serie: string;
  professor_id?: string;
  professor?: string;
  capacidade: number;
  alunos_count: number;
  sala?: string;
  status: 'ativa' | 'inativa';
  created_at?: string;
}

// Disciplinas
export interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
  professor_id?: string;
  turma_id?: string;
  carga_horaria: number;
}

// Notas
export interface Nota {
  id: string;
  aluno_id: string;
  aluno_nome?: string;
  disciplina_id: string;
  disciplina_nome?: string;
  turma_id?: string;
  tipo: 'av1' | 'av2' | 'av3' | 'media';
  valor: number;
  data?: string;
  created_at?: string;
}

// Frequência
export interface Frequencia {
  id: string;
  aluno_id: string;
  aluno_nome?: string;
  turma_id?: string;
  disciplina_id?: string;
  data: string;
  status: 'presente' | 'ausente' | 'justificado';
  justificativa?: string;
  created_at?: string;
}

// Horário
export interface HorarioAula {
  id: string;
  turma_id: string;
  turma_nome?: string;
  disciplina_id: string;
  disciplina_nome?: string;
  professor_id?: string;
  professor_nome?: string;
  dia_semana: number; // 1=segunda ... 5=sexta
  horario_inicio: string;
  horario_fim: string;
  sala?: string;
}

// Comunicados
export interface Comunicado {
  id: string;
  titulo: string;
  conteudo: string;
  autor?: string;
  tipo: 'geral' | 'turma' | 'importante';
  turma_id?: string;
  publicado_em: string;
  criado_em?: string;
}

// Dashboard stats
export interface DashboardStats {
  total_alunos: number;
  total_professores: number;
  total_turmas: number;
  media_geral: number;
  presencas_hoje: number;
  ausencias_hoje: number;
  alunos_risco: number;
}

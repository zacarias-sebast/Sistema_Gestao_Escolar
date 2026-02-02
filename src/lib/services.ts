// v3.1 - explicit typing for all services
import { supabase } from './supabase';

// Tipos base para as tabelas do banco de dados
export interface Professor {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  especialidade: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Turma {
  id: string;
  nome: string;
  serie: string;
  sala?: string;
  capacidade: number;
  professor_id?: string;
  ano: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  turma_id?: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  responsavel?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Nota {
  id: string;
  aluno_id: string;
  disciplina_id: string;
  turma_id?: string;
  tipo: string;
  valor: number;
  data: string;
  semestre?: number;
  created_at?: string;
}

export interface Frequencia {
  id: string;
  aluno_id: string;
  turma_id?: string;
  data: string;
  status: string;
  justificativa?: string;
  created_at?: string;
}

export interface Comunicado {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: string;
  turma_id?: string;
  autor: string;
  publicado_em: string;
  created_at?: string;
}

export interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
  professor_id?: string;
  turma_id?: string;
  carga_horaria: number;
  created_at?: string;
}

// Interfaces para os serviços
export interface IDisciplinaService {
  getAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  create(disciplina: Omit<Disciplina, 'id' | 'created_at'>): Promise<any>;
  update(id: string, updates: Partial<Disciplina>): Promise<any>;
  delete(id: string): Promise<void>;
  getByTurma(turmaId: string): Promise<any[]>;
}
export interface IProfessorService {
  getAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  create(professor: Omit<Professor, 'id' | 'created_at' | 'updated_at'>): Promise<any>;
  update(id: string, updates: Partial<Professor>): Promise<any>;
  delete(id: string): Promise<void>;
}

export interface ITurmaService {
  getAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  create(turma: Omit<Turma, 'id' | 'created_at' | 'updated_at' | 'ano' | 'status'>): Promise<any>;
  update(id: string, updates: Partial<Turma>): Promise<any>;
  delete(id: string): Promise<void>;
}

export interface IAlunoService {
  getAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  create(aluno: Omit<Aluno, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<any>;
  update(id: string, updates: Partial<Aluno>): Promise<any>;
  delete(id: string): Promise<void>;
}

export interface INotaService {
  getAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  create(nota: Omit<Nota, 'id' | 'created_at'>): Promise<any>;
  update(id: string, updates: Partial<Nota>): Promise<any>;
  delete(id: string): Promise<void>;
  getMediaPorAluno(): Promise<any[]>;
}

export interface IFrequenciaService {
  getByDate(date: string): Promise<any[]>;
  getById(id: string): Promise<any>;
  create(freq: Omit<Frequencia, 'id' | 'created_at'>): Promise<any>;
  update(id: string, updates: Partial<Frequencia>): Promise<any>;
  delete(id: string): Promise<void>;
  getTodayStats(): Promise<any>;
}

export interface IComunicadoService {
  getAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  create(comunicado: Omit<Comunicado, 'id' | 'created_at' | 'autor' | 'publicado_em'>): Promise<any>;
  update(id: string, updates: Partial<Comunicado>): Promise<any>;
  delete(id: string): Promise<void>;
}

export const professorService: IProfessorService = {
  async getAll() {
    const { data, error } = await supabase
      .from('professores')
      .select(`*, turmas_leciona: turmas(nome)`)
      .order('nome', { ascending: true });
    if (error) throw error;
    return data;
  },
  async getById(id: string) {
    const { data, error } = await supabase
      .from('professores')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  async create(professor) {
    const { data, error } = await supabase
      .from('professores')
      .insert(professor)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  async update(id, updates) {
    const { data, error } = await supabase
      .from('professores')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await supabase.from('professores').delete().eq('id', id);
    if (error) throw error;
  },
};

export const turmaService: ITurmaService = {
  async getAll() {
    const { data, error } = await supabase
      .from('turmas')
      .select(`*, professor: professores(nome), alunos_count: alunos(count)`)
      .order('nome', { ascending: true });
    if (error) throw error;
    return (data as any[]).map(t => ({
      ...t,
      professor_nome: t.professor?.nome ?? null,
      alunos_count: (t.alunos_count as any[])?.[0]?.count ?? 0,
    }));
  },
  async getById(id: string) {
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  async create(turma) {
    const { data, error } = await supabase
      .from('turmas')
      .insert({ ...turma, ano: 2025, status: 'ativa' })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  async update(id, updates) {
    const { data, error } = await supabase
      .from('turmas')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await supabase.from('turmas').delete().eq('id', id);
    if (error) throw error;
  },
};

export const alunoService: IAlunoService = {
  async getAll() {
    const { data, error } = await supabase
      .from('alunos')
      .select(`*, turma: turmas(nome)`)
      .order('nome', { ascending: true });
    if (error) throw error;
    return (data as any[]).map(a => ({
      ...a,
      turma_nome: a.turma?.nome ?? null,
    }));
  },
  async getById(id: string) {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  async create(aluno) {
    const { data, error } = await supabase
      .from('alunos')
      .insert({ ...aluno, status: 'ativo' })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  async update(id, updates) {
    const { data, error } = await supabase
      .from('alunos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await supabase.from('alunos').delete().eq('id', id);
    if (error) throw error;
  },
};

export const disciplinaService: IDisciplinaService = {
  async getAll() {
    const { data, error } = await supabase
      .from('disciplinas')
      .select(`*, professor: professores(nome), turma: turmas(nome)`)
      .order('nome', { ascending: true });
    if (error) throw error;
    return (data as any[]).map(d => ({
      ...d,
      professor_nome: d.professor?.nome ?? null,
      turma_nome: d.turma?.nome ?? null,
    }));
  },
  async getById(id: string) {
    const { data, error } = await supabase
      .from('disciplinas')
      .select(`*, professor: professores(nome), turma: turmas(nome)`)
      .eq('id', id)
      .single();
    if (error) throw error;
    return {
      ...data,
      professor_nome: (data as any).professor?.nome ?? null,
      turma_nome: (data as any).turma?.nome ?? null,
    };
  },
  async create(disciplina) {
    const { data, error } = await supabase
      .from('disciplinas')
      .insert(disciplina)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  async update(id, updates) {
    const { data, error } = await supabase
      .from('disciplinas')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await supabase.from('disciplinas').delete().eq('id', id);
    if (error) throw error;
  },
  async getByTurma(turmaId: string) {
    const { data, error } = await supabase
      .from('disciplinas')
      .select('*, professor: professores(nome)')
      .eq('turma_id', turmaId);
    if (error) throw error;
    return data;
  },
};

export const notaService: INotaService = {
  async getAll() {
    const { data, error } = await supabase
      .from('notas')
      .select(`*, aluno: alunos(nome), disciplina: disciplinas(nome)`)
      .order('data', { ascending: false });
    if (error) throw error;
    return (data as any[]).map(n => ({
      ...n,
      aluno_nome: n.aluno?.nome ?? null,
      disciplina_nome: n.disciplina?.nome ?? null,
    }));
  },
  async getById(id: string) {
    const { data, error } = await supabase
      .from('notas')
      .select(`*, aluno: alunos(nome), disciplina: disciplinas(nome)`)
      .eq('id', id)
      .single();
    if (error) throw error;
    return {
      ...data,
      aluno_nome: (data as any).aluno?.nome ?? null,
      disciplina_nome: (data as any).disciplina?.nome ?? null,
    };
  },
  async create(nota) {
    const { data, error } = await supabase
      .from('notas')
      .insert({ 
        ...nota, 
        data: nota.data || new Date().toISOString().split('T')[0] 
      })
      .select('*, aluno: alunos(nome), disciplina: disciplinas(nome)')
      .single();
    if (error) throw error;
    return {
      ...data,
      aluno_nome: (data as any).aluno?.nome ?? null,
      disciplina_nome: (data as any).disciplina?.nome ?? null,
    };
  },
  async update(id, updates) {
    const { data, error } = await supabase
      .from('notas')
      .update(updates)
      .eq('id', id)
      .select('*, aluno: alunos(nome), disciplina: disciplinas(nome)')
      .single();
    if (error) throw error;
    return {
      ...data,
      aluno_nome: (data as any).aluno?.nome ?? null,
      disciplina_nome: (data as any).disciplina?.nome ?? null,
    };
  },
  async delete(id) {
    const { error } = await supabase.from('notas').delete().eq('id', id);
    if (error) throw error;
  },
  async getMediaPorAluno() {
    const { data, error } = await supabase.from('notas').select('aluno_id, valor');
    if (error) throw error;
    const map = new Map<string, number[]>();
    (data as any[]).forEach(n => {
      if (!map.has(n.aluno_id)) map.set(n.aluno_id, []);
      map.get(n.aluno_id)!.push(Number(n.valor));
    });
    return [...map.entries()].map(([aluno_id, valores]) => ({
      aluno_id,
      media: valores.reduce((a, b) => a + b, 0) / valores.length,
    }));
  },
};

export const frequenciaService: IFrequenciaService = {
  async getByDate(date: string) {
    const { data, error } = await supabase
      .from('frequencias')
      .select(`*, aluno: alunos(nome), turma: turmas(nome)`)
      .eq('data', date)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as any[]).map(f => ({
      ...f,
      aluno_nome: f.aluno?.nome ?? null,
      turma_nome: f.turma?.nome ?? null,
    }));
  },
  async getById(id: string) {
    const { data, error } = await supabase
      .from('frequencias')
      .select(`*, aluno: alunos(nome), turma: turmas(nome)`)
      .eq('id', id)
      .single();
    if (error) throw error;
    return {
      ...data,
      aluno_nome: (data as any).aluno?.nome ?? null,
      turma_nome: (data as any).turma?.nome ?? null,
    };
  },
  async create(freq) {
    const { data, error } = await supabase
      .from('frequencias')
      .insert(freq)
      .select('*, aluno: alunos(nome), turma: turmas(nome)')
      .single();
    if (error) throw error;
    return {
      ...data,
      aluno_nome: (data as any).aluno?.nome ?? null,
      turma_nome: (data as any).turma?.nome ?? null,
    };
  },
  async update(id, updates) {
    const { data, error } = await supabase
      .from('frequencias')
      .update(updates)
      .eq('id', id)
      .select('*, aluno: alunos(nome), turma: turmas(nome)')
      .single();
    if (error) throw error;
    return {
      ...data,
      aluno_nome: (data as any).aluno?.nome ?? null,
      turma_nome: (data as any).turma?.nome ?? null,
    };
  },
  async delete(id) {
    const { error } = await supabase.from('frequencias').delete().eq('id', id);
    if (error) throw error;
  },
  async getTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.from('frequencias').select('status').eq('data', today);
    if (error) throw error;
    const stats = { presente: 0, ausente: 0, justificado: 0 };
    (data as any[]).forEach(f => { if (f.status in stats) stats[f.status as keyof typeof stats]++; });
    return stats;
  },
};

export const comunicadoService: IComunicadoService = {
  async getAll() {
    const { data, error } = await supabase
      .from('comunicados')
      .select('*')
      .order('publicado_em', { ascending: false });
    if (error) throw error;
    return data;
  },
  async getById(id: string) {
    const { data, error } = await supabase
      .from('comunicados')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  async create(comunicado) {
    const { data, error } = await supabase
      .from('comunicados')
      .insert({ ...comunicado, autor: 'Administrador', publicado_em: new Date().toISOString().split('T')[0] })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  async update(id, updates) {
    const { data, error } = await supabase
      .from('comunicados')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await supabase.from('comunicados').delete().eq('id', id);
    if (error) throw error;
  },
};

export const dashboardService = {
  async getStats() {
    const [alunos, professores, turmas, freqStats, notas] = await Promise.all([
      supabase.from('alunos').select('id', { count: 'exact', head: true }),
      supabase.from('professores').select('id', { count: 'exact', head: true }),
      supabase.from('turmas').select('id', { count: 'exact', head: true }),
      frequenciaService.getTodayStats(),
      supabase.from('notas').select('valor'),
    ]);
    const totalAlunos = alunos.count ?? 0;
    const totalProfessores = professores.count ?? 0;
    const totalTurmas = turmas.count ?? 0;
    const valores = (notas.data as any[])?.map(n => Number(n.valor)) ?? [];
    const mediaGeral = valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
    return {
      total_alunos: totalAlunos,
      total_professores: totalProfessores,
      total_turmas: totalTurmas,
      media_geral: mediaGeral,
      presencas_hoje: freqStats.presente,
      ausencias_hoje: freqStats.ausente + freqStats.justificado,
      alunos_risco: 0,
    };
  },
};

export const horarioService = {
  async getByTurma(turmaId: string) {
    const { data, error } = await supabase
      .from('horarios')
      .select(`*, disciplina: disciplinas(nome), professor: professores(nome), turma: turmas(nome)`)
      .eq('turma_id', turmaId)
      .order('dia_semana', { ascending: true })
      .order('horario_inicio', { ascending: true });
    if (error) throw error;
    return (data as any[]).map(h => ({
      ...h,
      disciplina_nome: h.disciplina?.nome ?? null,
      professor_nome: h.professor?.nome ?? null,
      turma_nome: h.turma?.nome ?? null,
      horario_inicio: (h.horario_inicio as string).slice(0, 5),
      horario_fim: (h.horario_fim as string).slice(0, 5),
    }));
  },
  async getAll() {
    const { data, error } = await supabase
      .from('horarios')
      .select(`*, disciplina: disciplinas(nome), professor: professores(nome), turma: turmas(nome)`)
      .order('dia_semana', { ascending: true });
    if (error) throw error;
    return (data as any[]).map(h => ({
      ...h,
      disciplina_nome: h.disciplina?.nome ?? null,
      professor_nome: h.professor?.nome ?? null,
      turma_nome: h.turma?.nome ?? null,
      horario_inicio: (h.horario_inicio as string).slice(0, 5),
      horario_fim: (h.horario_fim as string).slice(0, 5),
    }));
  },
};

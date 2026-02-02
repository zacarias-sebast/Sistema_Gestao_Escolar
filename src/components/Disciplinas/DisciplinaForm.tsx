import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import { disciplinaService, professorService, turmaService } from '@/lib/services';

export function DisciplinaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(!!id);
  const [erro, setErro] = useState('');
  const [professores, setProfessores] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [form, setForm] = useState({
    nome: '',
    codigo: '',
    professor_id: '',
    turma_id: '',
    carga_horaria: '30'
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [listaProfessores, listaTurmas, disciplina] = await Promise.all([
          professorService.getAll(),
          turmaService.getAll(),
          id ? disciplinaService.getById(id) : Promise.resolve(null)
        ]);
        
        setProfessores(listaProfessores);
        setTurmas(listaTurmas);
        
        if (disciplina) {
          setForm({
            nome: disciplina.nome || '',
            codigo: disciplina.codigo || '',
            professor_id: disciplina.professor_id || '',
            turma_id: disciplina.turma_id || '',
            carga_horaria: String(disciplina.carga_horaria || '30')
          });
        }
      } catch (e) {
        setErro('Erro ao carregar dados.');
      } finally {
        setCarregando(false);
      }
    }
    loadData();
  }, [id]);

  const handleSalvar = async () => {
    if (!form.nome.trim() || !form.codigo.trim()) {
      setErro('Nome e Código são obrigatórios.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      const payload = {
        nome: form.nome,
        codigo: form.codigo,
        professor_id: form.professor_id || undefined,
        turma_id: form.turma_id || undefined,
        carga_horaria: parseInt(form.carga_horaria) || 30
      };

      if (id) {
        await disciplinaService.update(id, payload);
      } else {
        await disciplinaService.create(payload);
      }
      navigate('/disciplinas');
    } catch (e: any) {
      setErro('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <div className="flex items-center justify-center h-full text-white">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          isIconOnly 
          variant="flat" 
          onPress={() => navigate('/disciplinas')}
          className="bg-[#1a1d2e] border border-[#2a2d3e] text-[#9ca3af]"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {id ? 'Editar Disciplina' : 'Nova Disciplina'}
          </h1>
          <p className="text-[#9ca3af]">
            Configure os detalhes da disciplina abaixo
          </p>
        </div>
      </div>

      <Card className="bg-[#1a1d2e] border border-[#2a2d3e]">
        <CardHeader className="px-8 pt-8 border-b border-[#2a2d3e]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#22c55e]/10 rounded-lg">
              <Icon icon="lucide:book-open" className="w-5 h-5 text-[#22c55e]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Informações da Disciplina</h2>
          </div>
        </CardHeader>
        <CardBody className="p-8">
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Nome da Disciplina
                </label>
                <input
                  type="text"
                  placeholder="Ex: Matemática"
                  value={form.nome}
                  onChange={e => setForm(p => ({...p, nome: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Código
                </label>
                <input
                  type="text"
                  placeholder="Ex: MAT-101"
                  value={form.codigo}
                  onChange={e => setForm(p => ({...p, codigo: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Professor
                </label>
                <select
                  value={form.professor_id}
                  onChange={e => setForm(p => ({...p, professor_id: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e] appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a1d2e]">Selecione um professor</option>
                  {professores.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#1a1d2e]">
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Turma
                </label>
                <select
                  value={form.turma_id}
                  onChange={e => setForm(p => ({...p, turma_id: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e] appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a1d2e]">Selecione uma turma</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#1a1d2e]">
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Carga Horária (horas)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 60"
                  value={form.carga_horaria}
                  onChange={e => setForm(p => ({...p, carga_horaria: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            {erro && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                {erro}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2d3e]">
              <Button 
                variant="flat" 
                onPress={() => navigate('/disciplinas')}
                className="bg-[#1a1d2e] text-white hover:bg-[#2a2d3e]"
              >
                Cancelar
              </Button>
              <Button 
                color="success"
                onPress={handleSalvar}
                isLoading={salvando}
                className="bg-[#22c55e] text-white font-semibold px-8"
              >
                {id ? 'Atualizar Disciplina' : 'Salvar Disciplina'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

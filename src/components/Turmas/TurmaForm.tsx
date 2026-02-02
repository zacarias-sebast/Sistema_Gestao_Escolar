import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import { turmaService, professorService } from '@/lib/services';

export function TurmaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(!!id);
  const [erro, setErro] = useState('');
  const [professores, setProfessores] = useState<any[]>([]);
  const [form, setForm] = useState({
    nome: '',
    serie: '',
    sala: '',
    capacidade: '30',
    professor_id: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [listaProfessores, turma] = await Promise.all([
          professorService.getAll(),
          id ? turmaService.getById(id) : Promise.resolve(null)
        ]);
        setProfessores(listaProfessores);
        if (turma) {
          setForm({
            nome: turma.nome || '',
            serie: turma.serie || '',
            sala: turma.sala || '',
            capacidade: String(turma.capacidade || '30'),
            professor_id: turma.professor_id || ''
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
    if (!form.nome.trim()) {
      setErro('Nome da turma é obrigatório.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      const payload = {
        nome: form.nome,
        serie: form.serie,
        sala: form.sala,
        capacidade: parseInt(form.capacidade) || 30,
        professor_id: form.professor_id || undefined
      };

      if (id) {
        await turmaService.update(id, payload);
      } else {
        await turmaService.create(payload);
      }
      navigate('/turmas');
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
          onPress={() => navigate('/turmas')}
          className="bg-[#1a1d2e] border border-[#2a2d3e] text-[#9ca3af]"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {id ? 'Editar Turma' : 'Nova Turma'}
          </h1>
          <p className="text-[#9ca3af]">
            Configure os detalhes da turma abaixo
          </p>
        </div>
      </div>

      <Card className="bg-[#1a1d2e] border border-[#2a2d3e]">
        <CardHeader className="px-8 pt-8 border-b border-[#2a2d3e]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#22c55e]/10 rounded-lg">
              <Icon icon="lucide:users" className="w-5 h-5 text-[#22c55e]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Informações da Turma</h2>
          </div>
        </CardHeader>
        <CardBody className="p-8">
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Nome da Turma
                </label>
                <input
                  type="text"
                  placeholder="Ex: 6º Ano A"
                  value={form.nome}
                  onChange={e => setForm(p => ({...p, nome: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Série
                </label>
                <input
                  type="text"
                  placeholder="Ex: 6º Ano"
                  value={form.serie}
                  onChange={e => setForm(p => ({...p, serie: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Sala
                </label>
                <input
                  type="text"
                  placeholder="Ex: 102"
                  value={form.sala}
                  onChange={e => setForm(p => ({...p, sala: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Capacidade
                </label>
                <input
                  type="number"
                  placeholder="Ex: 30"
                  value={form.capacidade}
                  onChange={e => setForm(p => ({...p, capacidade: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Professor Responsável
                </label>
                <select
                  value={form.professor_id}
                  onChange={e => setForm(p => ({...p, professor_id: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e] appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a1d2e]">Selecione um professor</option>
                  {professores.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#1a1d2e]">
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {erro && (
              <div className="flex items-center gap-2 text-[#f87171] text-xs bg-[#3b1a1a] rounded-xl px-4 py-3 border border-[#ef4444]/20 mt-4">
                <Icon icon="lucide:alert-circle" className="w-4 h-4 flex-shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-[#2a2d3e]">
              <Button 
                variant="flat" 
                onPress={() => navigate('/turmas')}
                className="px-8 text-[#9ca3af] bg-[#12141f] hover:bg-[#1a1d2e] border border-[#2a2d3e] h-12 font-medium"
              >
                Cancelar
              </Button>
              <Button 
                onPress={handleSalvar} 
                isLoading={salvando}
                className="px-8 bg-[#22c55e] text-white font-bold hover:bg-[#16a34a] h-12 shadow-lg shadow-[#22c55e]/20"
              >
                {id ? 'Atualizar Turma' : 'Cadastrar Turma'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

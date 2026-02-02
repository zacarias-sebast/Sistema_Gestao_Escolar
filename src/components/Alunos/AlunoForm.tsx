import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import { alunoService, turmaService } from '@/lib/services';

export function AlunoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(!!id);
  const [erro, setErro] = useState('');
  const [turmas, setTurmas] = useState<any[]>([]);
  const [form, setForm] = useState({
    nome: '',
    matricula: '',
    turma_id: '',
    email: '',
    telefone: '',
    responsavel: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [listaTurmas, aluno] = await Promise.all([
          turmaService.getAll(),
          id ? alunoService.getById(id) : Promise.resolve(null)
        ]);
        setTurmas(listaTurmas);
        if (aluno) {
          setForm({
            nome: aluno.nome || '',
            matricula: aluno.matricula || '',
            turma_id: aluno.turma_id || '',
            email: aluno.email || '',
            telefone: aluno.telefone || '',
            responsavel: aluno.responsavel || ''
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
    if (!form.nome.trim() || !form.matricula.trim()) {
      setErro('Nome e Matrícula são obrigatórios.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      const payload = {
        nome: form.nome,
        matricula: form.matricula,
        turma_id: form.turma_id || undefined,
        email: form.email,
        telefone: form.telefone,
        responsavel: form.responsavel
      };

      if (id) {
        await alunoService.update(id, payload);
      } else {
        await alunoService.create(payload);
      }
      navigate('/alunos');
    } catch (e: any) {
      setErro(e.message?.includes('unique') || e.message?.includes('duplicate') ? 'Matrícula já existe.' : 'Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          isIconOnly 
          variant="flat" 
          onPress={() => navigate('/alunos')}
          className="bg-[#1a1d2e] border border-[#2a2d3e] text-[#9ca3af]"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {id ? 'Editar Aluno' : 'Novo Aluno'}
          </h1>
          <p className="text-[#9ca3af]">
            Preencha os dados do estudante abaixo
          </p>
        </div>
      </div>

      <Card className="bg-[#1a1d2e] border border-[#2a2d3e]">
        <CardHeader className="px-8 pt-8 border-b border-[#2a2d3e]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#22c55e]/10 rounded-lg">
              <Icon icon="lucide:user" className="w-5 h-5 text-[#22c55e]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Informações Pessoais</h2>
          </div>
        </CardHeader>
        <CardBody className="p-8">
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  value={form.nome}
                  onChange={e => setForm(p => ({...p, nome: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Matrícula
                </label>
                <input
                  type="text"
                  placeholder="Ex: 2024001"
                  value={form.matricula}
                  onChange={e => setForm(p => ({...p, matricula: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
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
                  {turmas.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#1a1d2e]">
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="joao@email.com"
                  value={form.email}
                  onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Telefone
                </label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={e => setForm(p => ({...p, telefone: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Responsável
                </label>
                <input
                  type="text"
                  placeholder="Nome do responsável"
                  value={form.responsavel}
                  onChange={e => setForm(p => ({...p, responsavel: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
                />
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
                onPress={() => navigate('/alunos')}
                className="px-8 text-[#9ca3af] bg-[#12141f] hover:bg-[#1a1d2e] border border-[#2a2d3e] h-12 font-medium"
              >
                Cancelar
              </Button>
              <Button 
                onPress={handleSalvar} 
                isLoading={salvando}
                className="px-8 bg-[#22c55e] text-white font-bold hover:bg-[#16a34a] h-12 shadow-lg shadow-[#22c55e]/20"
              >
                {id ? 'Atualizar Aluno' : 'Cadastrar Aluno'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

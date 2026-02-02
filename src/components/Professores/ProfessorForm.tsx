import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import { professorService } from '@/lib/services';

export function ProfessorForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(!!id);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    especialidade: ''
  });

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const professor = await professorService.getById(id);
        if (professor) {
          setForm({
            nome: professor.nome || '',
            email: professor.email || '',
            telefone: professor.telefone || '',
            especialidade: professor.especialidade || ''
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
    if (!form.nome.trim() || !form.email.trim()) {
      setErro('Nome e Email são obrigatórios.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      if (id) {
        await professorService.update(id, form);
      } else {
        await professorService.create(form);
      }
      navigate('/professores');
    } catch (e: any) {
      setErro(e.message?.includes('unique') || e.message?.includes('duplicate') ? 'Email já existe.' : 'Erro ao salvar. Tente novamente.');
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
          onPress={() => navigate('/professores')}
          className="bg-[#1a1d2e] border border-[#2a2d3e] text-[#9ca3af]"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {id ? 'Editar Professor' : 'Novo Professor'}
          </h1>
          <p className="text-[#9ca3af]">
            Preencha os dados do docente abaixo
          </p>
        </div>
      </div>

      <Card className="bg-[#1a1d2e] border border-[#2a2d3e]">
        <CardHeader className="px-8 pt-8 border-b border-[#2a2d3e]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#22c55e]/10 rounded-lg">
              <Icon icon="lucide:user-check" className="w-5 h-5 text-[#22c55e]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Informações do Professor</h2>
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
                  placeholder="Ex: Carlos Oliveira"
                  value={form.nome}
                  onChange={e => setForm(p => ({...p, nome: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="carlos@email.com"
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
                  Especialidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: Matemática"
                  value={form.especialidade}
                  onChange={e => setForm(p => ({...p, especialidade: e.target.value}))}
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
                onPress={() => navigate('/professores')}
                className="px-8 text-[#9ca3af] bg-[#12141f] hover:bg-[#1a1d2e] border border-[#2a2d3e] h-12 font-medium"
              >
                Cancelar
              </Button>
              <Button 
                onPress={handleSalvar} 
                isLoading={salvando}
                className="px-8 bg-[#22c55e] text-white font-bold hover:bg-[#16a34a] h-12 shadow-lg shadow-[#22c55e]/20"
              >
                {id ? 'Atualizar Professor' : 'Cadastrar Professor'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

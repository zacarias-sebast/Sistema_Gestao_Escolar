import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { frequenciaService, alunoService } from '@/lib/services';

export function FrequenciaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('data');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [alunos, setAlunos] = useState<any[]>([]);
  
  const [form, setForm] = useState({ 
    aluno_id: '', 
    turma_id: '', 
    status: 'presente', 
    justificativa: '' 
  });

  const [data, setData] = useState(dateParam || new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadData() {
      try {
        const [listaAlunos, freqExistente] = await Promise.all([
          alunoService.getAll(),
          id ? frequenciaService.getById(id) : Promise.resolve(null)
        ]);
        
        setAlunos(listaAlunos);
        
        if (freqExistente) {
          setForm({
            aluno_id: freqExistente.aluno_id,
            turma_id: freqExistente.turma_id || '',
            status: freqExistente.status,
            justificativa: freqExistente.justificativa || ''
          });
          setData(freqExistente.data);
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
    if (!form.aluno_id) {
      setErro('Selecione um aluno.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      const aluno = alunos.find((a: any) => a.id === form.aluno_id);
      const payload = { 
        aluno_id: form.aluno_id, 
        turma_id: aluno?.turma_id || form.turma_id, 
        data, 
        status: form.status, 
        justificativa: form.justificativa || undefined 
      };

      if (id) {
        await frequenciaService.update(id, payload);
      } else {
        await frequenciaService.create(payload);
      }
      navigate('/frequencia');
    } catch (e: any) {
      setErro(e.message?.includes('unique') ? 'Frequência já registrada para este aluno nesta data.' : 'Erro ao registrar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          isIconOnly 
          variant="flat" 
          onPress={() => navigate('/frequencia')}
          className="bg-[#1a1d2e] text-[#9ca3af] hover:text-white border border-[#2a2d3e]"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Registrar Frequência</h1>
          <p className="text-[#9ca3af]">Data: {new Date(data).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <Card className="bg-[#1a1d2e] border border-[#2a2d3e] shadow-2xl">
        <CardBody className="p-8">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <label className="text-[#9ca3af] text-sm font-medium">
                Aluno
              </label>
              <select
                value={form.aluno_id}
                onChange={e => setForm(p => ({...p, aluno_id: e.target.value}))}
                className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e] appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a1d2e]">Selecione o aluno</option>
                {alunos.map((a: any) => (
                  <option key={a.id} value={a.id} className="bg-[#1a1d2e]">
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#9ca3af] text-sm font-medium">
                Status
              </label>
              <select
                value={form.status}
                onChange={e => setForm(p => ({...p, status: e.target.value}))}
                className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e] appearance-none cursor-pointer"
              >
                <option value="presente" className="bg-[#1a1d2e]">Presente</option>
                <option value="ausente" className="bg-[#1a1d2e]">Ausente</option>
                <option value="justificado" className="bg-[#1a1d2e]">Justificado</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#9ca3af] text-sm font-medium">
                Justificativa (opcional)
              </label>
              <textarea
                placeholder="Descreva o motivo da ausência..."
                value={form.justificativa}
                onChange={e => setForm(p => ({...p, justificativa: e.target.value}))}
                rows={4}
                className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e] resize-none"
              />
            </div>

            {erro && (
              <div className="flex items-center gap-2 bg-[#3b1a1a] border border-[#5c2d2d] rounded-xl px-4 py-3">
                <Icon icon="lucide:alert-circle" className="text-[#f87171] w-4 h-4" />
                <p className="text-[#f87171] text-xs font-medium">{erro}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <Button 
                variant="flat" 
                onPress={() => navigate('/frequencia')}
                className="text-[#9ca3af] bg-[#12141f] hover:bg-[#1a1d2e] border border-[#2a2d3e] h-12 px-8 rounded-xl"
              >
                Cancelar
              </Button>
              <Button 
                onPress={handleSalvar} 
                isLoading={salvando}
                className="bg-[#22c55e] text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-[#22c55e]/20"
              >
                Registrar Frequência
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

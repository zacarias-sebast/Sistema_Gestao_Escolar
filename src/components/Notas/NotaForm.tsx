import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import { notaService, alunoService, disciplinaService } from '@/lib/services';

export function NotaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [alunos, setAlunos] = useState<any[]>([]);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [form, setForm] = useState({ 
    aluno_id: '', 
    disciplina_id: '', 
    tipo: 'av1', 
    valor: '', 
    semestre: 1,
    data: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [listaAlunos, listaDisciplinas, notaExistente] = await Promise.all([
          alunoService.getAll(),
          disciplinaService.getAll(),
          id ? notaService.getById(id) : Promise.resolve(null)
        ]);
        
        setAlunos(listaAlunos);
        setDisciplinas(listaDisciplinas);
        
        if (notaExistente) {
          setForm({
            aluno_id: notaExistente.aluno_id,
            disciplina_id: notaExistente.disciplina_id,
            tipo: notaExistente.tipo,
            valor: String(notaExistente.valor),
            semestre: notaExistente.semestre || 1,
            data: notaExistente.data
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
    // Limpar erro anterior
    setErro('');

    // Validações detalhadas
    if (!form.aluno_id) {
      setErro('Por favor, selecione um aluno.');
      return;
    }
    if (!form.disciplina_id) {
      setErro('Por favor, selecione uma disciplina.');
      return;
    }

    // Tratar vírgula como ponto para o parseFloat
    const valorLimpo = String(form.valor).replace(',', '.');
    const valor = parseFloat(valorLimpo);

    if (form.valor === '' || isNaN(valor)) {
      setErro('Por favor, insira um valor numérico para a nota.');
      return;
    }

    if (valor < 0 || valor > 20) {
      setErro('A nota deve estar entre 0 e 20.');
      return;
    }

    setSalvando(true);
    try {
      const aluno = alunos.find((a: any) => a.id === form.aluno_id);
      
      if (!aluno?.turma_id) {
        setErro('Este aluno não está vinculado a nenhuma turma. Vincule o aluno a uma turma antes de lançar notas.');
        setSalvando(false);
        return;
      }

      if (isNaN(form.semestre)) {
        setErro('Selecione um semestre válido.');
        setSalvando(false);
        return;
      }

      const payload = { 
        aluno_id: form.aluno_id, 
        disciplina_id: form.disciplina_id, 
        turma_id: aluno.turma_id, 
        tipo: form.tipo, 
        valor,
        semestre: form.semestre,
        data: form.data
      };

      if (id) {
        await notaService.update(id, payload);
      } else {
        await notaService.create(payload);
      }
      navigate('/notas');
    } catch (e: any) {
      console.error('Erro ao salvar nota:', e);
      setErro(e.message || 'Erro ao salvar nota. Tente novamente.');
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
          onPress={() => navigate('/notas')}
          className="bg-[#1a1d2e] border border-[#2a2d3e] text-[#9ca3af]"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{id ? 'Editar Nota' : 'Lançar Nota'}</h1>
          <p className="text-[#9ca3af]">{id ? 'Atualize o desempenho acadêmico' : 'Registre o desempenho acadêmico do aluno'}</p>
        </div>
      </div>

      <Card className="bg-[#1a1d2e] border border-[#2a2d3e]">
        <CardHeader className="px-8 pt-8 border-b border-[#2a2d3e]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#22c55e]/10 rounded-lg">
              <Icon icon="lucide:graduation-cap" className="w-5 h-5 text-[#22c55e]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Dados da Avaliação</h2>
          </div>
        </CardHeader>
        <CardBody className="p-8">
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
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
                  Disciplina
                </label>
                <select
                  value={form.disciplina_id}
                  onChange={e => setForm(p => ({...p, disciplina_id: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e] appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a1d2e]">Selecione a disciplina</option>
                  {disciplinas.map((d: any) => (
                    <option key={d.id} value={d.id} className="bg-[#1a1d2e]">
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Semestre
                </label>
                <select
                  value={form.semestre}
                  onChange={e => setForm(p => ({...p, semestre: parseInt(e.target.value)}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e] appearance-none cursor-pointer"
                >
                  <option value="1" className="bg-[#1a1d2e]">1º Semestre</option>
                  <option value="2" className="bg-[#1a1d2e]">2º Semestre</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Nota
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  placeholder="0.0"
                  value={form.valor}
                  onChange={e => setForm(p => ({...p, valor: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Tipo de Avaliação
                </label>
                <select
                  value={form.tipo}
                  onChange={e => setForm(p => ({...p, tipo: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e] appearance-none cursor-pointer"
                >
                  <option value="av1" className="bg-[#1a1d2e]">1ª Avaliação</option>
                  <option value="av2" className="bg-[#1a1d2e]">2ª Avaliação</option>
                  <option value="av3" className="bg-[#1a1d2e]">3ª Avaliação</option>
                  <option value="media" className="bg-[#1a1d2e]">Média</option>
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
                onPress={() => navigate('/notas')}
                className="px-8 text-[#9ca3af] bg-[#12141f] hover:bg-[#1a1d2e] border border-[#2a2d3e] h-12 font-medium"
              >
                Cancelar
              </Button>
              <Button 
                onPress={handleSalvar} 
                isLoading={salvando}
                className="px-8 bg-[#22c55e] text-white font-bold hover:bg-[#16a34a] h-12 shadow-lg shadow-[#22c55e]/20"
              >
                Lançar Nota
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { disciplinaService } from '@/lib/services';

export function Disciplinas() {
  const navigate = useNavigate();
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await disciplinaService.getAll();
      setDisciplinas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtrados = useMemo(() =>
    disciplinas.filter((d: any) =>
      d.nome.toLowerCase().includes(busca.toLowerCase()) ||
      d.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      (d.professor_nome || '').toLowerCase().includes(busca.toLowerCase()) ||
      (d.turma_nome || '').toLowerCase().includes(busca.toLowerCase())
    ), [disciplinas, busca]);

  const handleExcluir = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta disciplina?')) return;
    try {
      await disciplinaService.delete(id);
      await fetchData();
    } catch (e) {
      console.error(e);
      alert('Erro ao excluir disciplina.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#4b5563] text-sm">Carregando disciplinas...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Disciplinas</h2>
          <p className="text-[#4b5563] text-sm">{disciplinas.length} disciplinas cadastradas</p>
        </div>
        <Button 
          color="success"
          onPress={() => navigate('/disciplinas/novo')}
          startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
          className="bg-[#22c55e] text-white font-semibold rounded-xl shadow-lg shadow-[#22c55e]/20"
        >
          Nova Disciplina
        </Button>
      </div>

      <div className="bg-[#12141f] border border-[#1e2035] rounded-2xl p-4">
        <div className="max-w-md relative group">
          <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563] w-4 h-4 group-focus-within:text-[#22c55e] transition-colors" />
          <input
            type="text"
            placeholder="Buscar por nome, código, professor ou turma..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl pl-10 pr-4 py-2 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map((d: any) => (
          <Card key={d.id} className="bg-[#12141f] border border-[#1e2035] hover:border-[#22c55e]/30 transition-all group">
            <CardBody className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#22c55e]/10 rounded-xl group-hover:bg-[#22c55e]/20 transition-colors">
                    <Icon icon="lucide:book-open" className="w-5 h-5 text-[#22c55e]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{d.nome}</h3>
                    <span className="text-[#4b5563] text-xs font-mono uppercase">{d.codigo}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip content="Editar">
                    <Button 
                      isIconOnly 
                      size="sm" 
                      variant="flat" 
                      onPress={() => navigate(`/disciplinas/editar/${d.id}`)}
                      className="bg-[#1a1d2e] text-[#9ca3af] hover:text-white"
                    >
                      <Icon icon="lucide:edit-2" className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Excluir" color="danger">
                    <Button 
                      isIconOnly 
                      size="sm" 
                      variant="flat" 
                      onPress={() => handleExcluir(d.id)}
                      className="bg-[#1a1d2e] text-[#9ca3af] hover:text-danger"
                    >
                      <Icon icon="lucide:trash-2" className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#9ca3af]">
                  <Icon icon="lucide:user" className="w-4 h-4 text-[#4b5563]" />
                  <span className="text-sm truncate">
                    {d.professor_nome || 'Sem professor'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#9ca3af]">
                  <Icon icon="lucide:users" className="w-4 h-4 text-[#4b5563]" />
                  <span className="text-sm">
                    {d.turma_nome || 'Sem turma'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#9ca3af]">
                  <Icon icon="lucide:clock" className="w-4 h-4 text-[#4b5563]" />
                  <span className="text-sm">
                    {d.carga_horaria} horas/ano
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {filtrados.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-[#4b5563] bg-[#12141f] border border-[#1e2035] border-dashed rounded-3xl">
          <Icon icon="lucide:search-x" className="w-12 h-12 mb-3 opacity-20" />
          <p>Nenhuma disciplina encontrada</p>
        </div>
      )}
    </div>
  );
}

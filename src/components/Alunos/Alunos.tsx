import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardBody, Chip, Avatar
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { alunoService, turmaService } from '@/lib/services';

export function Alunos() {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTurma, setFiltroTurma] = useState('todas');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [a, t] = await Promise.all([alunoService.getAll(), turmaService.getAll()]);
      setAlunos(a);
      setTurmas(t);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtrados = useMemo(() =>
    alunos.filter(a => {
      const matchB = a.nome.toLowerCase().includes(busca.toLowerCase()) || a.matricula.includes(busca);
      const matchS = filtroStatus === 'todos' || a.status === filtroStatus;
      const matchT = filtroTurma === 'todas' || a.turma_id === filtroTurma;
      return matchB && matchS && matchT;
    }), [alunos, busca, filtroStatus, filtroTurma]);

  const statusColor: Record<string,string> = { ativo:'#22c55e', inativo:'#6b7280', formado:'#06b6d4' };

  const openCadastro = () => { 
    navigate('/alunos/novo');
  };
  
  const openEditar = (a: any) => { 
    navigate(`/alunos/editar/${a.id}`);
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir este aluno?')) return;
    try { 
      await alunoService.delete(id); 
      await fetchData(); 
    } catch(e){ 
      console.error(e); 
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin"/>
        <p className="text-[#4b5563] text-sm">Carregando alunos...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Cadastro de Alunos</h2>
          <p className="text-[#4b5563] text-xs">{alunos.length} alunos registrados</p>
        </div>
        <button 
          onClick={openCadastro} 
          className="bg-[#6366f1] text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-[#5558e3] shadow-md shadow-[#6366f1]/25 flex items-center"
        >
          <Icon icon="lucide:plus" className="w-4 h-4 mr-1.5"/>
          Novo Aluno
        </button>
      </div>

      <Card className="bg-[#12141f] border border-[#1e2035]">
        <CardBody className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563] w-4 h-4 group-focus-within:text-[#6366f1] transition-colors" />
            <input
              type="text"
              placeholder="Buscar por nome ou matrícula..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full bg-[#12141f] border border-[#2a2d3e] hover:border-[#6366f1] rounded-xl pl-10 pr-4 py-2 text-white text-sm transition-all focus:outline-none focus:border-[#6366f1]"
            />
          </div>

          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="w-full sm:w-44 bg-[#12141f] border border-[#2a2d3e] hover:border-[#6366f1] rounded-xl px-3 py-2 text-white text-sm transition-all focus:outline-none focus:border-[#6366f1] appearance-none cursor-pointer"
          >
            <option value="todos" className="bg-[#1a1d2e]">Todos Status</option>
            <option value="ativo" className="bg-[#1a1d2e]">Ativo</option>
            <option value="inativo" className="bg-[#1a1d2e]">Inativo</option>
            <option value="formado" className="bg-[#1a1d2e]">Formado</option>
          </select>

          <select
            value={filtroTurma}
            onChange={e => setFiltroTurma(e.target.value)}
            className="w-full sm:w-44 bg-[#12141f] border border-[#2a2d3e] hover:border-[#6366f1] rounded-xl px-3 py-2 text-white text-sm transition-all focus:outline-none focus:border-[#6366f1] appearance-none cursor-pointer"
          >
            <option value="todas" className="bg-[#1a1d2e]">Todas Turmas</option>
            {turmas.map((t: any) => (
              <option key={t.id} value={t.id} className="bg-[#1a1d2e]">
                {t.nome}
              </option>
            ))}
          </select>
        </CardBody>
      </Card>

      <div className="bg-[#12141f] border border-[#1e2035] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2035]">
                <th className="text-left px-5 py-3.5 text-[#4b5563] text-[11px] font-semibold uppercase tracking-wider">Aluno</th>
                <th className="text-left px-5 py-3.5 text-[#4b5563] text-[11px] font-semibold uppercase tracking-wider">Matrícula</th>
                <th className="text-left px-5 py-3.5 text-[#4b5563] text-[11px] font-semibold uppercase tracking-wider">Turma</th>
                <th className="text-left px-5 py-3.5 text-[#4b5563] text-[11px] font-semibold uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3.5 text-[#4b5563] text-[11px] font-semibold uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((a:any, i:number) => (
                <tr key={a.id} className={`border-b border-[#1e2035] hover:bg-[#1a1d2e] transition-colors ${i%2===0?'':'bg-[#0d0f18]'}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm" fallback={a.nome.charAt(0)} className="w-8 h-8 bg-[#6366f1]/20 text-[#a5b4fc]"/>
                      <div>
                        <p className="text-xs font-semibold text-white">{a.nome}</p>
                        <p className="text-[#4b5563] text-[10px]">{a.email||'—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[#9ca3af] text-xs font-mono">{a.matricula}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[#9ca3af] text-xs">{a.turma_nome||'—'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <Chip 
                      size="sm" 
                      className="border-0" 
                      style={{ 
                        backgroundColor:`${statusColor[a.status]}20`, 
                        color: statusColor[a.status] 
                      }}
                    >
                      {a.status.charAt(0).toUpperCase()+a.status.slice(1)}
                    </Chip>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={()=>openEditar(a)} 
                        className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#6366f1] hover:bg-[#6366f1]/10 transition-all"
                      >
                        <Icon icon="lucide:pencil" className="w-3.5 h-3.5"/>
                      </button>
                      <button 
                        onClick={()=>handleExcluir(a.id)} 
                        className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all"
                      >
                        <Icon icon="lucide:trash-2" className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length===0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <Icon icon="lucide:search" className="w-8 h-8 text-[#2a2d3e] mx-auto mb-2"/>
                    <p className="text-[#4b5563] text-sm">Nenhum aluno encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

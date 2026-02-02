import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { notaService, disciplinaService } from '@/lib/services';

const tipoLabels: Record<string,string> = { av1:'1ª Avaliação', av2:'2ª Avaliação', av3:'3ª Avaliação', media:'Média' };
const tipoColors: Record<string,string> = { av1:'#6366f1', av2:'#06b6d4', av3:'#8b5cf6', media:'#22c55e' };

export function Notas() {
  const navigate = useNavigate();
  const [notas, setNotas] = useState<any[]>([]);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroDisc, setFiltroDisc] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [loading, setLoading] = useState(true);

  const fetchData = async ()=>{
    try { setLoading(true);
      const [n, d] = await Promise.all([notaService.getAll(), disciplinaService.getAll()]);
      setNotas(n); setDisciplinas(d);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ fetchData(); }, []);

  const discNomes = [...new Set(disciplinas.map((d:any)=>d.nome))];

  const filtrados = useMemo(()=>
    notas.filter((n:any)=>{
      const mB = (n.aluno_nome||'').toLowerCase().includes(busca.toLowerCase()) || (n.disciplina_nome||'').toLowerCase().includes(busca.toLowerCase());
      const mD = filtroDisc==='todas' || n.disciplina_nome===filtroDisc;
      const mT = filtroTipo==='todos' || n.tipo===filtroTipo;
      return mB && mD && mT;
    }), [notas, busca, filtroDisc, filtroTipo]);

  // Agrupar por aluno
  const agrupadoPorAluno = useMemo(()=>{
    const map = new Map<string,{nome:string;notas:any[]}>();
    filtrados.forEach((n:any)=>{
      if(!map.has(n.aluno_id)) map.set(n.aluno_id,{nome:n.aluno_nome||'',notas:[]});
      map.get(n.aluno_id)!.notas.push(n);
    });
    return [...map.entries()].map(([id,data])=>({id,...data}));
  }, [filtrados]);

  const valorColor = (v:number) => v>=16?'#22c55e':v>=12?'#eab308':v>=8?'#f97316':'#ef4444';

  const openLancar = ()=>{ 
    navigate('/notas/novo');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin"/>
        <p className="text-[#4b5563] text-sm">Carregando notas...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold text-white">Lançamento de Notas</h2><p className="text-[#4b5563] text-xs">{notas.length} notas registradas</p></div>
        <button 
          onClick={openLancar} 
          className="bg-[#22c55e] text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-[#16a34a] shadow-md shadow-[#22c55e]/25 flex items-center"
        >
          <Icon icon="lucide:plus" className="w-4 h-4 mr-1.5"/>
          Lançar Nota
        </button>
      </div>

      <Card className="bg-[#12141f] border border-[#1e2035]">
        <CardBody className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563] w-4 h-4 group-focus-within:text-[#22c55e] transition-colors" />
            <input
              type="text"
              placeholder="Buscar por aluno ou disciplina..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl pl-10 pr-4 py-2 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
            />
          </div>

          <select
            value={filtroDisc}
            onChange={e => setFiltroDisc(e.target.value)}
            className="w-full sm:w-44 bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-3 py-2 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e] appearance-none cursor-pointer h-10"
          >
            <option value="todas" className="bg-[#1a1d2e]">Todas Disciplinas</option>
            {discNomes.map(nome => (
              <option key={nome} value={nome} className="bg-[#1a1d2e]">
                {nome}
              </option>
            ))}
          </select>

          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            className="w-full sm:w-44 bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-3 py-2 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e] appearance-none cursor-pointer h-10"
          >
            <option value="todos" className="bg-[#1a1d2e]">Todos Tipos</option>
            <option value="av1" className="bg-[#1a1d2e]">1ª Avaliação</option>
            <option value="av2" className="bg-[#1a1d2e]">2ª Avaliação</option>
            <option value="av3" className="bg-[#1a1d2e]">3ª Avaliação</option>
          </select>
        </CardBody>
      </Card>

      <div className="flex flex-col gap-3">
        {agrupadoPorAluno.map((grupo:any)=>(
          <div key={grupo.id} className="bg-[#12141f] border border-[#1e2035] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-[#0f1117] border-b border-[#1e2035]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#6366f1]/15 flex items-center justify-center"><Icon icon="lucide:user" className="w-4 h-4 text-[#6366f1]"/></div>
                <div><h3 className="text-xs font-bold text-white">{grupo.nome}</h3><p className="text-[#4b5563] text-[10px]">{grupo.notas.length} nota{grupo.notas.length>1?'s':''}</p></div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: valorColor(grupo.notas.reduce((s:number,n:any)=>s+Number(n.valor),0)/grupo.notas.length) }}>
                  {(grupo.notas.reduce((s:number,n:any)=>s+Number(n.valor),0)/grupo.notas.length).toFixed(1)}
                </p>
                <p className="text-[#4b5563] text-[9px]">média</p>
              </div>
            </div>
            <div className="divide-y divide-[#1e2035]">
              {grupo.notas.map((n:any,i:number)=>(
                <div key={n.id||i} className="flex items-center justify-between px-5 py-2.5 hover:bg-[#1a1d2e] transition-colors">
                  <div className="flex items-center gap-3">
                    <Chip size="sm" className="border-0 text-[10px] font-semibold" style={{ backgroundColor:`${tipoColors[n.tipo]}20`, color: tipoColors[n.tipo] }}>{tipoLabels[n.tipo]}</Chip>
                    <span className="text-[#9ca3af] text-xs">{n.disciplina_nome}</span>
                    {n.semestre && <span className="text-[#4b5563] text-[10px] bg-[#1a1d2e] px-1.5 py-0.5 rounded">{n.semestre}º Sem</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#4b5563] text-[10px]">{n.data}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: valorColor(Number(n.valor)) }}>{Number(n.valor).toFixed(1)}</span>
                      <div className="w-14 h-1.5 bg-[#1e2035] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width:`${(Number(n.valor)/20)*100}%`, backgroundColor: valorColor(Number(n.valor)) }}/>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/notas/editar/${n.id}`)}
                      className="p-1.5 text-[#4b5563] hover:text-[#6366f1] transition-colors"
                    >
                      <Icon icon="lucide:edit-2" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {agrupadoPorAluno.length===0 && (
          <div className="text-center py-10 bg-[#12141f] border border-[#1e2035] rounded-2xl">
            <Icon icon="lucide:search" className="w-8 h-8 text-[#2a2d3e] mx-auto mb-2"/>
            <p className="text-[#4b5563] text-sm">Nenhuma nota encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { frequenciaService, turmaService } from '@/lib/services';

const statusConfig: Record<string,{color:string;label:string;icon:string}> = {
  presente:{ color:'#22c55e', label:'Presente', icon:'lucide:check-circle' },
  ausente:{ color:'#ef4444', label:'Ausente', icon:'lucide:x-circle' },
  justificado:{ color:'#f97316', label:'Justificado', icon:'lucide:alert-circle' },
};

export function Frequencia() {
  const navigate = useNavigate();
  const [frequencias, setFrequencias] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [filtroTurma, setFiltroTurma] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [loading, setLoading] = useState(true);

  const fetchData = async ()=>{
    try { setLoading(true);
      const [f, t] = await Promise.all([frequenciaService.getByDate(data), turmaService.getAll()]);
      setFrequencias(f); setTurmas(t);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ fetchData(); }, [data]);

  const filtrados = frequencias.filter((f:any)=>{
    const mT = filtroTurma==='todas' || f.turma_id===filtroTurma;
    const mS = filtroStatus==='todos' || f.status===filtroStatus;
    return mT && mS;
  });

  const presentes = frequencias.filter((f:any)=>f.status==='presente').length;
  const ausentes = frequencias.filter((f:any)=>f.status==='ausente').length;
  const justificados = frequencias.filter((f:any)=>f.status==='justificado').length;

  const openLancar = () => { 
    navigate(`/frequencia/novo?data=${data}`);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin"/>
        <p className="text-[#4b5563] text-sm">Carregando frequências...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold text-white">Controle de Frequência</h2><p className="text-[#4b5563] text-xs">Presença e ausência diária</p></div>
        <button 
          onClick={openLancar} 
          className="bg-[#06b6d4] text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-[#0891b2] shadow-md shadow-[#06b6d4]/25 flex items-center"
        >
          <Icon icon="lucide:plus" className="w-4 h-4 mr-1.5"/>
          Registrar
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label:'Total', value: frequencias.length, color:'#6366f1', icon:'lucide:users' },
          { label:'Presente', value: presentes, color:'#22c55e', icon:'lucide:check-circle' },
          { label:'Ausente', value: ausentes, color:'#ef4444', icon:'lucide:x-circle' },
          { label:'Justificado', value: justificados, color:'#f97316', icon:'lucide:alert-circle' },
        ].map((s,i)=>(
          <div key={i} className="bg-[#12141f] border border-[#1e2035] rounded-xl p-3 flex items-center gap-2.5">
            <div className="rounded-lg p-2" style={{ backgroundColor:`${s.color}18` }}><Icon icon={s.icon} className="w-4 h-4" style={{ color: s.color }}/></div>
            <div><p className="text-lg font-bold text-white">{s.value}</p><p className="text-[#4b5563] text-[10px]">{s.label}</p></div>
          </div>
        ))}
      </div>

      <Card className="bg-[#12141f] border border-[#1e2035]">
        <CardBody className="p-4 flex flex-col sm:flex-row gap-3">
          <input 
            type="date" 
            value={data} 
            onChange={e => setData(e.target.value)}
            className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#06b6d4] focus:border-[#06b6d4] rounded-xl h-10 px-3 text-white text-sm w-48 outline-none transition-all cursor-pointer"
          />

          <select
            value={filtroTurma}
            onChange={e => setFiltroTurma(e.target.value)}
            className="w-full sm:w-44 bg-[#12141f] border border-[#2a2d3e] hover:border-[#06b6d4] rounded-xl px-3 py-2 text-white text-sm transition-all focus:outline-none focus:border-[#06b6d4] appearance-none cursor-pointer h-10"
          >
            <option value="todas" className="bg-[#1a1d2e]">Todas Turmas</option>
            {turmas.map((t: any) => (
              <option key={t.id} value={t.id} className="bg-[#1a1d2e]">
                {t.nome}
              </option>
            ))}
          </select>

          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="w-full sm:w-44 bg-[#12141f] border border-[#2a2d3e] hover:border-[#06b6d4] rounded-xl px-3 py-2 text-white text-sm transition-all focus:outline-none focus:border-[#06b6d4] appearance-none cursor-pointer h-10"
          >
            <option value="todos" className="bg-[#1a1d2e]">Todos Status</option>
            <option value="presente" className="bg-[#1a1d2e]">Presente</option>
            <option value="ausente" className="bg-[#1a1d2e]">Ausente</option>
            <option value="justificado" className="bg-[#1a1d2e]">Justificado</option>
          </select>
        </CardBody>
      </Card>

      <div className="bg-[#12141f] border border-[#1e2035] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2035]">
                <th className="text-left px-5 py-3 text-[#4b5563] text-[11px] font-semibold uppercase tracking-wider">Aluno</th>
                <th className="text-left px-5 py-3 text-[#4b5563] text-[11px] font-semibold uppercase tracking-wider">Turma</th>
                <th className="text-left px-5 py-3 text-[#4b5563] text-[11px] font-semibold uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[#4b5563] text-[11px] font-semibold uppercase tracking-wider">Justificativa</th>
                <th className="text-right px-5 py-3 text-[#4b5563] text-[11px] font-semibold uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((f:any,i:number)=>{
                const cfg = statusConfig[f.status];
                return (
                  <tr key={f.id} className={`border-b border-[#1e2035] ${i%2===0?'':'bg-[#0d0f18]'}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor:`${cfg.color}15` }}><Icon icon={cfg.icon} className="w-4 h-4" style={{ color: cfg.color }}/></div>
                        <span className="text-xs font-semibold text-white">{f.aluno_nome}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className="text-[#9ca3af] text-xs">{f.turma_nome||'—'}</span></td>
                    <td className="px-5 py-3"><Chip size="sm" className="border-0 text-[11px] font-semibold" style={{ backgroundColor:`${cfg.color}20`, color: cfg.color }}>{cfg.label}</Chip></td>
                    <td className="px-5 py-3"><span className="text-[#6b7280] text-[11px] italic">{f.justificativa||'—'}</span></td>
                    <td className="px-5 py-3 text-right">
                      <button 
                        onClick={() => navigate(`/frequencia/editar/${f.id}`)}
                        className="p-1.5 text-[#4b5563] hover:text-[#6366f1] transition-colors"
                      >
                        <Icon icon="lucide:edit-2" className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtrados.length===0 && (
                <tr><td colSpan={4} className="text-center py-10"><Icon icon="lucide:calendar" className="w-8 h-8 text-[#2a2d3e] mx-auto mb-2"/><p className="text-[#4b5563] text-sm">Sem registros para esta data</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


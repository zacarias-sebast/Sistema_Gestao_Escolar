import { useState, useEffect } from 'react';
import { Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { horarioService, turmaService } from '@/lib/services';

const diasSemana = ['Segunda','Terça','Quarta','Quinta','Sexta'];
const horas = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];
const disciplinaColors: Record<string,{bg:string;text:string;border:string}> = {
  'Matemática':{bg:'#6366f118',text:'#a5b4fc',border:'#6366f140'},
  'Português':{bg:'#06b6d418',text:'#67e8f9',border:'#06b6d440'},
  'Ciências':{bg:'#22c55e18',text:'#86efac',border:'#22c55e40'},
  'História':{bg:'#f9731618',text:'#fdba74',border:'#f9731640'},
  'Física':{bg:'#8b5cf618',text:'#c4b5fd',border:'#8b5cf640'},
};

export function Horario() {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [filtroTurma, setFiltroTurma] = useState('');
  const [loading, setLoading] = useState(true);
  const [hovering, setHovering] = useState<string|null>(null);

  useEffect(()=>{
    const load = async ()=>{
      try { setLoading(true);
        const t = await turmaService.getAll();
        setTurmas(t);
        if(t.length > 0) setFiltroTurma(t[0].id);
      } catch(e){ console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(()=>{
    const load = async ()=>{
      if(!filtroTurma) return;
      try { setHorarios(await horarioService.getByTurma(filtroTurma)); }
      catch(e){ console.error(e); }
    };
    load();
  }, [filtroTurma]);

  const turmaAtual = turmas.find((t:any)=>t.id===filtroTurma);
  const getAula = (dia:number, hora:string) => horarios.find((h:any)=>h.dia_semana===dia && h.horario_inicio===hora);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin"/>
        <p className="text-[#4b5563] text-sm">Carregando horário...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold text-white">Horário de Aulas</h2><p className="text-[#4b5563] text-xs">Grade semanal por turma</p></div>
        <select
          value={filtroTurma}
          onChange={e => setFiltroTurma(e.target.value)}
          className="w-full sm:w-44 bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-3 py-2 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e] appearance-none cursor-pointer h-10"
        >
          {turmas.map((t: any) => (
            <option key={t.id} value={t.id} className="bg-[#1a1d2e]">
              {t.nome}
            </option>
          ))}
        </select>
      </div>

      {turmaAtual && (
        <div className="flex items-center gap-3 bg-[#12141f] border border-[#1e2035] rounded-xl p-3.5">
          <div className="w-9 h-9 rounded-lg bg-[#6366f1]/15 flex items-center justify-center"><Icon icon="lucide:book-open" className="w-5 h-5 text-[#6366f1]"/></div>
          <div><p className="text-sm font-bold text-white">{turmaAtual.nome}</p><p className="text-[#4b5563] text-[11px]">Sala {turmaAtual.sala||'—'} · {turmaAtual.serie} · Prof. {turmaAtual.professor_nome||'—'}</p></div>
          <div className="ml-auto"><Chip size="sm" className="bg-[#6366f1]/15 text-[#a5b4fc] border-0">{horarios.length} aulas/semana</Chip></div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {Object.entries(disciplinaColors).map(([name, colors])=>(
          <div key={name} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.text }}/><span className="text-[#6b7280] text-[10px]">{name}</span></div>
        ))}
      </div>

      <Card className="bg-[#12141f] border border-[#1e2035] overflow-hidden">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[#1e2035]">
                  <th className="w-20 text-left px-4 py-3 text-[#4b5563] text-[10px] font-semibold uppercase tracking-wider">Hora</th>
                  {diasSemana.map((d,i)=><th key={i} className="text-left px-3 py-3 text-[#4b5563] text-[10px] font-semibold uppercase tracking-wider">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {horas.map((hora)=>(
                  <tr key={hora} className="border-b border-[#1e2035]/50">
                    <td className="px-4 py-2.5"><span className="text-[#4b5563] text-[11px] font-medium">{hora}</span></td>
                    {diasSemana.map((_,di)=>{
                      const aula = getAula(di+1, hora);
                      const colors = aula ? (disciplinaColors[aula.disciplina_nome]||disciplinaColors['Matemática']) : null;
                      const cellId = `${di}-${hora}`;
                      return (
                        <td key={di} className="px-1.5 py-1">
                          {aula && colors ? (
                            <div onMouseEnter={()=>setHovering(cellId)} onMouseLeave={()=>setHovering(null)}
                              className="relative rounded-lg p-2 cursor-pointer transition-all duration-200"
                              style={{ backgroundColor: colors.bg, border:`1px solid ${hovering===cellId?colors.text:colors.border}`, transform: hovering===cellId?'scale(1.02)':'scale(1)' }}>
                              <p className="text-xs font-bold truncate" style={{ color: colors.text }}>{aula.disciplina_nome}</p>
                              <p className="text-[9px] truncate" style={{ color: colors.text, opacity:0.7 }}>{aula.professor_nome?.split(' ')[0]}</p>
                              {hovering===cellId && (
                                <div className="absolute z-10 bottom-full left-0 mb-2 w-44 bg-[#1a1d2e] border border-[#2a2d3e] rounded-lg p-3 shadow-xl shadow-black/40">
                                  <p className="text-xs font-bold text-white mb-1">{aula.disciplina_nome}</p>
                                  <p className="text-[10px] text-[#9ca3af]">Prof. {aula.professor_nome}</p>
                                  <p className="text-[10px] text-[#9ca3af]">Sala: {aula.sala||'—'}</p>
                                  <p className="text-[10px] text-[#9ca3af]">{aula.horario_inicio} – {aula.horario_fim}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="rounded-lg p-2 h-[52px] border border-dashed border-[#1e2035]/60"/>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

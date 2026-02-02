import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { turmaService } from '@/lib/services';

const serieColors: Record<string,{bg:string;accent:string}> = {
  '6º Ano':{bg:'#6366f1',accent:'#a5b4fc'}, 
  '7º Ano':{bg:'#06b6d4',accent:'#67e8f9'},
  '8º Ano':{bg:'#8b5cf6',accent:'#c4b5fd'}, 
  '9º Ano':{bg:'#f97316',accent:'#fdba74'},
};

export function Turmas() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async ()=>{
    try { 
      setLoading(true);
      const [t] = await Promise.all([turmaService.getAll()]);
      setTurmas(t); 
    } catch(e){ 
      console.error(e); 
    }
    finally { 
      setLoading(false); 
    }
  };
  
  useEffect(()=>{ fetchData(); }, []);

  const filtrados = useMemo(()=>
    turmas.filter((t:any)=>
      t.nome.toLowerCase().includes(busca.toLowerCase()) ||
      t.serie.toLowerCase().includes(busca.toLowerCase()) ||
      (t.sala||'').toLowerCase().includes(busca.toLowerCase())
    ), [turmas, busca]);

  const openCadastro = ()=>{ 
    navigate('/turmas/novo');
  };
  
  const openEditar = (t:any)=>{ 
    navigate(`/turmas/editar/${t.id}`);
  };

  const handleExcluir = async (id:string)=>{
    if(!confirm('Excluir esta turma?')) return;
    try { 
      await turmaService.delete(id); 
      await fetchData(); 
    } catch(e){ 
      console.error(e); 
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin"/>
        <p className="text-[#4b5563] text-sm">Carregando turmas...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Gestão de Turmas</h2>
          <p className="text-[#4b5563] text-xs">{turmas.length} turmas registradas</p>
        </div>
        <button 
          onClick={openCadastro} 
          className="bg-[#8b5cf6] text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-[#7c3aed] shadow-md shadow-[#8b5cf6]/25 flex items-center"
        >
          <Icon icon="lucide:plus" className="w-4 h-4 mr-1.5"/>
          Nova Turma
        </button>
      </div>

      <div className="max-w-md relative group">
        <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563] w-4 h-4 group-focus-within:text-[#8b5cf6] transition-colors" />
        <input
          type="text"
          placeholder="Buscar por nome, série ou sala..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full bg-[#12141f] border border-[#2a2d3e] hover:border-[#8b5cf6] rounded-xl pl-10 pr-4 py-2 text-white text-sm transition-all focus:outline-none focus:border-[#8b5cf6]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map((t:any)=>{
          const colors = serieColors[t.serie]||{bg:'#6366f1',accent:'#a5b4fc'};
          const occ = t.capacidade > 0 ? (t.alunos_count/t.capacidade)*100 : 0;
          return (
            <Card key={t.id} className="bg-[#12141f] border border-[#1e2035] hover:border-[#2a2d3e] transition-all duration-300 overflow-hidden">
              <CardBody className="p-0">
                <div className="h-1.5 w-full" style={{ background:`linear-gradient(90deg,${colors.bg},${colors.accent})` }}/>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">{t.nome}</h3>
                      <p className="text-[#4b5563] text-[11px]">Sala {t.sala||'—'}</p>
                    </div>
                    <Chip 
                      size="sm" 
                      className="border-0" 
                      style={{ backgroundColor:`${colors.bg}20`, color: colors.accent }}
                    >
                      {t.serie}
                    </Chip>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-[#1a1d2e] rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-white">{t.alunos_count}</p>
                      <p className="text-[#4b5563] text-[9px] uppercase tracking-wide">Alunos</p>
                    </div>
                    <div className="bg-[#1a1d2e] rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-white">{t.capacidade}</p>
                      <p className="text-[#4b5563] text-[9px] uppercase tracking-wide">Vagas</p>
                    </div>
                    <div className="bg-[#1a1d2e] rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold" style={{ color: occ>85?'#f97316':'#22c55e' }}>
                        {Math.round(occ)}%
                      </p>
                      <p className="text-[#4b5563] text-[9px] uppercase tracking-wide">Ocup.</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-[#4b5563] mb-1">
                      <span>Ocupação</span>
                      <span>{t.alunos_count}/{t.capacidade}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1e2035] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width:`${occ}%`, 
                          background:`linear-gradient(90deg,${colors.bg},${colors.accent})` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3 pt-3 border-t border-[#1e2035]">
                    <Icon icon="lucide:user-check" className="w-3.5 h-3.5 text-[#4b5563]"/>
                    <span className="text-xs text-[#9ca3af]">{t.professor_nome||'Sem professor'}</span>
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button 
                      onClick={()=>openEditar(t)} 
                      className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#8b5cf6] hover:bg-[#8b5cf6]/10 transition-all"
                    >
                      <Icon icon="lucide:pencil" className="w-3.5 h-3.5"/>
                    </button>
                    <button 
                      onClick={()=>handleExcluir(t.id)} 
                      className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all"
                    >
                      <Icon icon="lucide:trash-2" className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

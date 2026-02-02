import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Chip, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { professorService } from '@/lib/services';

const especialidadeColors: Record<string,string> = { 
  'Matemática':'#6366f1',
  'Português':'#06b6d4',
  'Ciências':'#22c55e',
  'História':'#f97316',
  'Física':'#8b5cf6',
  'Química':'#ec4899' 
};

export function Professores() {
  const navigate = useNavigate();
  const [professores, setProfessores] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try { 
      setLoading(true); 
      setProfessores(await professorService.getAll()); 
    }
    catch(e){ 
      console.error(e); 
    }
    finally { 
      setLoading(false); 
    }
  };
  
  useEffect(()=>{ fetchData(); }, []);

  const filtrados = useMemo(()=>
    professores.filter((p:any)=>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.especialidade.toLowerCase().includes(busca.toLowerCase()) ||
      p.email.toLowerCase().includes(busca.toLowerCase())
    ), [professores, busca]);

  const openCadastro = ()=>{ 
    navigate('/professores/novo');
  };
  
  const openEditar = (p:any)=>{ 
    navigate(`/professores/editar/${p.id}`);
  };

  const handleExcluir = async (id:string)=>{
    if(!confirm('Excluir este professor?')) return;
    try { 
      await professorService.delete(id); 
      await fetchData(); 
    } catch(e){ 
      console.error(e); 
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin"/>
        <p className="text-[#4b5563] text-sm">Carregando professores...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Corpo Docente</h2>
          <p className="text-[#4b5563] text-xs">{professores.length} professores registrados</p>
        </div>
        <button 
          onClick={openCadastro} 
          className="bg-[#06b6d4] text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-[#0891b2] shadow-md shadow-[#06b6d4]/25 flex items-center"
        >
          <Icon icon="lucide:plus" className="w-4 h-4 mr-1.5"/>
          Novo Professor
        </button>
      </div>

      <div className="max-w-md relative group">
        <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563] w-4 h-4 group-focus-within:text-[#06b6d4] transition-colors" />
        <input
          type="text"
          placeholder="Buscar por nome, especialidade ou email..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full bg-[#12141f] border border-[#2a2d3e] hover:border-[#06b6d4] rounded-xl pl-10 pr-4 py-2 text-white text-sm transition-all focus:outline-none focus:border-[#06b6d4]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map((p:any)=>{
          const espColor = especialidadeColors[p.especialidade] || '#6366f1';
          const turmasNomes = (p.turmas_leciona||[]).map((t:any)=>t.nome);
          return (
            <Card key={p.id} className="bg-[#12141f] border border-[#1e2035] hover:border-[#2a2d3e] transition-all duration-300">
              <CardBody className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      size="lg" 
                      fallback={p.nome.charAt(0)} 
                      className="w-12 h-12 bg-[#06b6d4]/20 text-[#67e8f9] ring-2 ring-[#1e2035]"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">{p.nome}</h3>
                      <p className="text-[#4b5563] text-[11px]">{p.email}</p>
                    </div>
                  </div>
                  <Chip 
                    size="sm" 
                    className="border-0" 
                    style={{ 
                      backgroundColor:`${p.status==='ativo'?'#22c55e':'#6b7280'}20`, 
                      color: p.status==='ativo'?'#22c55e':'#6b7280' 
                    }}
                  >
                    {p.status==='ativo'?'Ativo':'Inativo'}
                  </Chip>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center" 
                      style={{ backgroundColor:`${espColor}18` }}
                    >
                      <Icon icon="lucide:book-open" className="w-3.5 h-3.5" style={{ color: espColor }}/>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#4b5563]">Especialidade</p>
                      <p className="text-xs font-semibold" style={{ color: espColor }}>{p.especialidade}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#1a1d2e] flex items-center justify-center">
                      <Icon icon="lucide:phone" className="w-3.5 h-3.5 text-[#4b5563]"/>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#4b5563]">Telefone</p>
                      <p className="text-xs text-[#9ca3af]">{p.telefone||'—'}</p>
                    </div>
                  </div>
                  {turmasNomes.length > 0 && (
                    <div>
                      <p className="text-[10px] text-[#4b5563] mb-1.5">Turmas</p>
                      <div className="flex flex-wrap gap-1.5">
                        {turmasNomes.map((t:string,i:number)=>
                          <Chip 
                            key={i} 
                            size="sm" 
                            className="bg-[#1a1d2e] text-[#9ca3af] border border-[#2a2d3e] text-[10px]"
                          >
                            {t}
                          </Chip>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-[#1e2035]">
                  <button 
                    onClick={()=>openEditar(p)} 
                    className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 transition-all"
                  >
                    <Icon icon="lucide:pencil" className="w-3.5 h-3.5"/>
                  </button>
                  <button 
                    onClick={()=>handleExcluir(p.id)} 
                    className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all"
                  >
                    <Icon icon="lucide:trash-2" className="w-3.5 h-3.5"/>
                  </button>
                </div>
              </CardBody>
            </Card>
          );
        })}
        {filtrados.length===0 && (
          <div className="col-span-3 text-center py-12">
            <Icon icon="lucide:search" className="w-10 h-10 text-[#2a2d3e] mx-auto mb-2"/>
            <p className="text-[#4b5563] text-sm">Nenhum professor encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}

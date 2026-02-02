import { useState, useEffect, useMemo } from 'react';
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from 'react-router-dom';
import { comunicadoService } from '@/lib/services';

const tipoConfig: Record<string,{ color:string; label:string; icon:string }> = {
  geral:     { color:'#6366f1', label:'Geral',      icon:'lucide:megaphone' },
  turma:     { color:'#06b6d4', label:'Turma',      icon:'lucide:users' },
  importante:{ color:'#ef4444', label:'Importante', icon:'lucide:alert-triangle' },
};

export function Comunicados() {
  const navigate = useNavigate();
  const [comunicados, setComunicados] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [c] = await Promise.all([comunicadoService.getAll()]);
      setComunicados(c);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const filtrados = useMemo(() =>
    comunicados.filter((c: any) => {
      const mB = c.titulo.toLowerCase().includes(busca.toLowerCase()) || c.conteudo.toLowerCase().includes(busca.toLowerCase());
      const mT = filtroTipo === 'todos' || c.tipo === filtroTipo;
      return mB && mT;
    }), [comunicados, busca, filtroTipo]);

  const openCriar = () => { navigate('/comunicados/novo'); };

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir este comunicado?')) return;
    try { await comunicadoService.delete(id); await fetchData(); } catch(e) { console.error(e); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin"/>
        <p className="text-[#4b5563] text-sm">Carregando comunicados...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Comunicados</h2>
          <p className="text-[#4b5563] text-xs">{comunicados.length} comunicados publicados</p>
        </div>
        <Button onPress={openCriar} className="bg-[#6366f1] text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-[#5558e3] shadow-md shadow-[#6366f1]/25">
          <Icon icon="lucide:plus" className="w-4 h-4 mr-1.5"/>Novo Comunicado
        </Button>
      </div>

      {/* Filtros */}
      <Card className="bg-[#12141f] border border-[#1e2035]">
        <CardBody className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563] w-4 h-4 group-focus-within:text-[#6366f1] transition-colors" />
            <input
              type="text"
              placeholder="Buscar por título ou conteúdo..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full bg-[#12141f] border border-[#2a2d3e] hover:border-[#6366f1] rounded-xl pl-10 pr-4 py-2 text-white text-sm transition-all focus:outline-none focus:border-[#6366f1]"
            />
          </div>
          {/* Filtro por tipo — pills */}
          <div className="flex gap-2">
            {['todos','geral','turma','importante'].map(t => (
              <button key={t} onClick={() => setFiltroTipo(t)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                  filtroTipo === t
                    ? 'bg-[#6366f1] text-white shadow-sm shadow-[#6366f1]/30'
                    : 'bg-[#1a1d2e] text-[#6b7280] hover:text-white hover:bg-[#2a2d3e]'
                }`}>
                {t === 'todos' ? 'Todos' : tipoConfig[t].label}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Lista de comunicados */}
      <div className="flex flex-col gap-3">
        {filtrados.map((c: any) => {
          const cfg = tipoConfig[c.tipo] || tipoConfig.geral;
          const pubDate = new Date(c.publicado_em + 'T00:00:00');
          const dateStr = pubDate.toLocaleDateString('pt-BR', { weekday:'short', day:'numeric', month:'short', year:'numeric' });

          return (
            <div key={c.id} className="bg-[#12141f] border border-[#1e2035] rounded-2xl overflow-hidden hover:border-[#2a2d3e] transition-all duration-200">
              {/* Barra colorida no topo */}
              <div className="h-0.5 w-full" style={{ backgroundColor: cfg.color }}/>

              <div className="p-5">
                {/* Cabeçalho */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor:`${cfg.color}18` }}>
                      <Icon icon={cfg.icon} className="w-4.5 h-4.5" style={{ color: cfg.color }}/>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{c.titulo}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Chip size="sm" className="border-0 text-[10px] font-semibold" style={{ backgroundColor:`${cfg.color}18`, color: cfg.color }}>{cfg.label}</Chip>
                        <span className="text-[#4b5563] text-[10px]">{dateStr}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => navigate(`/comunicados/editar/${c.id}`)}
                      className="p-1.5 rounded-lg text-[#4b5563] hover:text-[#6366f1] hover:bg-[#6366f1]/10 transition-all opacity-0 group-hover:opacity-100"
                      style={{ opacity: 1 }}>
                      <Icon icon="lucide:edit-2" className="w-3.5 h-3.5"/>
                    </button>
                    <button onClick={() => handleExcluir(c.id)}
                      className="p-1.5 rounded-lg text-[#4b5563] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all opacity-0 group-hover:opacity-100"
                      style={{ opacity: 1 }}>
                      <Icon icon="lucide:trash-2" className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>

                {/* Conteúdo */}
                <p className="text-[#9ca3af] text-[13px] leading-relaxed">{c.conteudo}</p>

                {/* Footer meta */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#1e2035]">
                  <div className="flex items-center gap-1.5">
                    <Icon icon="lucide:user" className="w-3 h-3 text-[#4b5563]"/>
                    <span className="text-[#4b5563] text-[10px]">{c.autor || 'Administrador'}</span>
                  </div>
                  {c.tipo === 'turma' && c.turma_id && (
                    <div className="flex items-center gap-1.5">
                      <Icon icon="lucide:book-open" className="w-3 h-3 text-[#4b5563]"/>
                      <span className="text-[#4b5563] text-[10px]">Dirigido a turma específica</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtrados.length === 0 && (
          <div className="text-center py-12 bg-[#12141f] border border-[#1e2035] rounded-2xl">
            <Icon icon="lucide:bell-off" className="w-10 h-10 text-[#2a2d3e] mx-auto mb-2"/>
            <p className="text-[#4b5563] text-sm">Nenhum comunicado encontrado</p>
            <p className="text-[#4b5563] text-[11px] mt-1">Tente ajustar os filtros ou criar um novo</p>
          </div>
        )}
      </div>
    </div>
  );
}

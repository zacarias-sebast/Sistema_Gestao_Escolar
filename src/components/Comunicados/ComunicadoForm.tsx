import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { comunicadoService, turmaService } from '@/lib/services';

const TIPO_CONFIG = {
  geral:     { color:'#6366f1', label:'Geral',      icon:'lucide:megaphone' },
  turma:     { color:'#06b6d4', label:'Turma',      icon:'lucide:users' },
  importante:{ color:'#ef4444', label:'Importante', icon:'lucide:alert-triangle' },
};

export function ComunicadoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [turmas, setTurmas] = useState<any[]>([]);
  const [form, setForm] = useState({ titulo: '', conteudo: '', tipo: 'geral' as keyof typeof TIPO_CONFIG, turma_id: '' });

  useEffect(() => {
    async function loadData() {
      try {
        const [listaTurmas, comunicado] = await Promise.all([
          turmaService.getAll(),
          id ? comunicadoService.getById(id) : Promise.resolve(null)
        ]);
        setTurmas(listaTurmas);
        if (comunicado) {
          setForm({
            titulo: comunicado.titulo,
            conteudo: comunicado.conteudo,
            tipo: comunicado.tipo as keyof typeof TIPO_CONFIG,
            turma_id: comunicado.turma_id || ''
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
    if (!form.titulo.trim() || !form.conteudo.trim()) {
      setErro('Título e conteúdo são obrigatórios.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      const payload = {
        titulo: form.titulo,
        conteudo: form.conteudo,
        tipo: form.tipo,
        turma_id: form.tipo === 'turma' && form.turma_id ? form.turma_id : undefined,
      };

      if (id) {
        await comunicadoService.update(id, payload);
      } else {
        await comunicadoService.create(payload);
      }
      navigate('/comunicados');
    } catch (e) {
      setErro('Erro ao salvar comunicado. Tente novamente.');
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
          onPress={() => navigate('/comunicados')}
          className="bg-[#1a1d2e] text-[#9ca3af] hover:text-white border border-[#2a2d3e]"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white">{id ? 'Editar Comunicado' : 'Novo Comunicado'}</h1>
      </div>

      <Card className="bg-[#1a1d2e] border border-[#2a2d3e] shadow-2xl">
        <CardBody className="p-8">
          <div className="flex flex-col gap-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#6366f1]/10 rounded-lg">
                <Icon icon="lucide:megaphone" className="w-5 h-5 text-[#6366f1]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Informações do Comunicado</h2>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#9ca3af] text-sm font-medium">
                Título do Comunicado
              </label>
              <input
                type="text"
                placeholder="Ex: Reunião de Pais"
                value={form.titulo}
                onChange={e => setForm(p => ({...p, titulo: e.target.value}))}
                className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e]"
              />
            </div>

            <div>
              <p className="text-[#9ca3af] text-sm font-medium mb-3">Tipo de Comunicado</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(Object.keys(TIPO_CONFIG) as Array<keyof typeof TIPO_CONFIG>).map(t => (
                  <button 
                    key={t} 
                    type="button"
                    onClick={() => setForm(p => ({...p, tipo: t}))}
                    className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-xs font-bold transition-all duration-200 border-2 ${
                      form.tipo === t
                        ? 'text-white border-transparent'
                        : 'bg-[#1a1d2e] text-[#6b7280] border-[#2a2d3e] hover:text-white hover:bg-[#2a2d3e]'
                    }`}
                    style={form.tipo === t ? { backgroundColor: TIPO_CONFIG[t].color, boxShadow:`0 4px 12px ${TIPO_CONFIG[t].color}40` } : {}}>
                    <Icon icon={TIPO_CONFIG[t].icon} className="w-5 h-5"/>
                    {TIPO_CONFIG[t].label}
                  </button>
                ))}
              </div>
            </div>

            {form.tipo === 'turma' && (
              <div className="flex flex-col gap-2">
                <label className="text-[#9ca3af] text-sm font-medium">
                  Turma Destinatária
                </label>
                <select
                  value={form.turma_id}
                  onChange={e => setForm(p => ({...p, turma_id: e.target.value}))}
                  className="bg-[#12141f] border border-[#2a2d3e] hover:border-[#22c55e] rounded-xl px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#22c55e] appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a1d2e]">Selecione a turma</option>
                  {turmas.map((t: any) => (
                    <option key={t.id} value={t.id} className="bg-[#1a1d2e]">
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[#9ca3af] text-sm font-medium">
                Conteúdo do Comunicado
              </label>
              <textarea
                placeholder="Digite a mensagem completa aqui..."
                value={form.conteudo}
                onChange={e => setForm(p => ({...p, conteudo: e.target.value}))}
                rows={8}
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
                onPress={() => navigate('/comunicados')}
                className="text-[#9ca3af] bg-[#12141f] hover:bg-[#1a1d2e] border border-[#2a2d3e] h-12 px-8 rounded-xl"
              >
                Cancelar
              </Button>
              <Button 
                onPress={handleSalvar} 
                isLoading={salvando}
                className="bg-[#22c55e] text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-[#22c55e]/20"
              >
                Publicar Comunicado
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

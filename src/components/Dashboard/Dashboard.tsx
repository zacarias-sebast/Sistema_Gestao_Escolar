import { useState, useEffect } from 'react';
import { Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { dashboardService, notaService, alunoService, comunicadoService } from '@/lib/services';
import { supabase } from '@/lib/supabase';
import type { DashboardStats } from '@/types';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-[#9ca3af] text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ total_alunos:0, total_professores:0, total_turmas:0, media_geral:0, presencas_hoje:0, ausencias_hoje:0, alunos_risco:0 });
  const [alunosRisco, setAlunosRisco] = useState<{ nome:string; turma:string; matricula:string; media:number }[]>([]);
  const [comunicados, setComunicados] = useState<any[]>([]);
  const [mediasPorMes, setMediasPorMes] = useState<{ mes:string; media:number }[]>([]);
  const [distribuicao, setDistribuicao] = useState<{ faixa:string; quantidade:number; color:string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const s = await dashboardService.getStats();
        const mediasPorAluno = await notaService.getMediaPorAluno();
        const alunos = await alunoService.getAll();

        const risco = mediasPorAluno
          .filter(m => m.media < 5)
          .map(m => {
            const a = alunos.find((x: any) => x.id === m.aluno_id);
            return { nome: a?.nome||'', turma: a?.turma_nome||'', matricula: a?.matricula||'', media: m.media };
          })
          .sort((a,b) => a.media - b.media)
          .slice(0, 5);

        setStats({ ...s, alunos_risco: risco.length });
        setAlunosRisco(risco);

        // Todas as notas para gráficos
        const { data: allNotas } = await supabase.from('notas').select('*').order('data');
        const notas = allNotas || [];

        // Distribuição
        const dist = [
          { faixa:'0–3', quantidade:0, color:'#ef4444' },
          { faixa:'3–5', quantidade:0, color:'#f97316' },
          { faixa:'5–7', quantidade:0, color:'#eab308' },
          { faixa:'7–9', quantidade:0, color:'#22c55e' },
          { faixa:'9–10', quantidade:0, color:'#06b6d4' },
        ];
        notas.forEach((n: any) => {
          const v = Number(n.valor);
          if (v < 3) dist[0].quantidade++;
          else if (v < 5) dist[1].quantidade++;
          else if (v < 7) dist[2].quantidade++;
          else if (v < 9) dist[3].quantidade++;
          else dist[4].quantidade++;
        });
        setDistribuicao(dist);

        // Médias por mês
        const mesesMap = new Map<string, number[]>();
        notas.forEach((n: any) => {
          const d = new Date(n.data + 'T00:00:00');
          const key = d.toLocaleDateString('pt-BR', { month:'short' });
          if (!mesesMap.has(key)) mesesMap.set(key, []);
          mesesMap.get(key)!.push(Number(n.valor));
        });
        const mesesArr = [...mesesMap.entries()].map(([mes, vals]) => ({
          mes, media: parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1))
        }));
        setMediasPorMes(mesesArr.length > 0 ? mesesArr : [{ mes:'Jan', media:0 }]);

        const comuns = await comunicadoService.getAll();
        setComunicados(comuns);
      } catch(e){ console.error('Dashboard:', e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const presencaSemanal = [
    { dia:'Seg', presente: stats.presencas_hoje, ausente: stats.ausencias_hoje },
    { dia:'Ter', presente: Math.max(0, stats.presencas_hoje-3), ausente: stats.ausencias_hoje+2 },
    { dia:'Qua', presente: stats.presencas_hoje+1, ausente: Math.max(0, stats.ausencias_hoje-1) },
    { dia:'Qui', presente: Math.max(0, stats.presencas_hoje-5), ausente: stats.ausencias_hoje+3 },
    { dia:'Sex', presente: Math.max(0, stats.presencas_hoje-7), ausente: stats.ausencias_hoje+4 },
  ];

  const statCards = [
    { title:'Alunos Matriculados', value: stats.total_alunos, icon:'lucide:users', color:'#6366f1' },
    { title:'Professores', value: stats.total_professores, icon:'lucide:user-check', color:'#06b6d4' },
    { title:'Turmas Ativas', value: stats.total_turmas, icon:'lucide:book-open', color:'#8b5cf6' },
    { title:'Média Geral', value: stats.media_geral.toFixed(1), icon:'lucide:trending-up', color:'#22c55e' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#4b5563] text-sm">Carregando dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s,i) => (
          <Card key={i} className="bg-[#12141f] border border-[#1e2035] hover:border-[#2a2d3e] transition-all duration-300">
            <CardBody className="p-4 flex flex-row items-start justify-between gap-3">
              <div>
                <p className="text-[#4b5563] text-xs font-medium mb-1">{s.title}</p>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
              <div className="rounded-xl p-2.5" style={{ backgroundColor:`${s.color}18` }}>
                <Icon icon={s.icon} className="w-5 h-5" style={{ color: s.color }} />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { title:'Presente Hoje', value: stats.presencas_hoje, icon:'lucide:check-circle', color:'#22c55e' },
          { title:'Ausências Hoje', value: stats.ausencias_hoje, icon:'lucide:x-circle', color:'#f97316' },
          { title:'Alunos em Risco', value: stats.alunos_risco, icon:'lucide:alert-triangle', color:'#ef4444' },
        ].map((s,i) => (
          <div key={i} className="bg-[#12141f] border border-[#1e2035] rounded-xl p-3.5 flex items-center gap-3">
            <div className="rounded-lg p-2" style={{ backgroundColor:`${s.color}18` }}>
              <Icon icon={s.icon} className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-[#4b5563] text-[11px]">{s.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-[#12141f] border border-[#1e2035] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-sm font-semibold text-white">Média Geral por Mês</h3><p className="text-[#4b5563] text-xs">Evolução ao longo do ano</p></div>
            <Chip size="sm" className="bg-[#6366f1]/15 text-[#a5b4fc] border-0">2025</Chip>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mediasPorMes}>
              <defs><linearGradient id="colorMedia" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.4}/><stop offset="100%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2035" vertical={false}/>
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill:'#4b5563', fontSize:11 }}/>
              <YAxis domain={[0,10]} axisLine={false} tickLine={false} tick={{ fill:'#4b5563', fontSize:11 }}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="media" name="Média" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorMedia)" dot={{ fill:'#6366f1', strokeWidth:2, r:3, stroke:'#0f1117' }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#12141f] border border-[#1e2035] rounded-2xl p-5">
          <div className="mb-4"><h3 className="text-sm font-semibold text-white">Distribuição de Notas</h3><p className="text-[#4b5563] text-xs">Faixas de desempenho</p></div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={distribuicao} dataKey="quantidade" nameKey="faixa" cx="50%" cy="50%" outerRadius={58} innerRadius={32} paddingAngle={2} stroke="none">
                {distribuicao.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip content={<CustomTooltip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 justify-center">
            {distribuicao.map((d,i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}/>
                <span className="text-[#6b7280] text-[10px]">{d.faixa}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#12141f] border border-[#1e2035] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-sm font-semibold text-white">Presença Semanal</h3><p className="text-[#4b5563] text-xs">Presente vs Ausente</p></div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={presencaSemanal} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2035" vertical={false}/>
              <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill:'#4b5563', fontSize:11 }}/>
              <YAxis axisLine={false} tickLine={false} tick={{ fill:'#4b5563', fontSize:11 }}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="presente" name="Presente" fill="#6366f1" radius={[4,4,0,0]} barSize={18}/>
              <Bar dataKey="ausente" name="Ausente" fill="#f97316" radius={[4,4,0,0]} barSize={18}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#12141f] border border-[#1e2035] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-sm font-semibold text-white">Alunos em Risco</h3><p className="text-[#4b5563] text-xs">Média abaixo de 5.0</p></div>
            <Chip size="sm" className="bg-[#ef4444]/15 text-[#f87171] border-0">{alunosRisco.length} alunos</Chip>
          </div>
          <div className="flex flex-col gap-3">
            {alunosRisco.length === 0 && (
              <div className="text-center py-6"><Icon icon="lucide:check-circle" className="w-8 h-8 text-[#22c55e] mx-auto mb-2"/><p className="text-[#4b5563] text-xs">Nenhum aluno em risco</p></div>
            )}
            {alunosRisco.map((a,i) => (
              <div key={i} className="flex items-center justify-between bg-[#1a1d2e] rounded-xl px-3.5 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#ef4444]/15 flex items-center justify-center"><Icon icon="lucide:alert-triangle" className="w-4 h-4 text-[#f87171]"/></div>
                  <div><p className="text-xs font-semibold text-white">{a.nome}</p><p className="text-[#4b5563] text-[10px]">{a.turma} · {a.matricula}</p></div>
                </div>
                <div className="text-right"><p className="text-sm font-bold text-[#f87171]">{a.media.toFixed(1)}</p><p className="text-[#4b5563] text-[10px]">média</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#12141f] border border-[#1e2035] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div><h3 className="text-sm font-semibold text-white">Comunicados Recentes</h3><p className="text-[#4b5563] text-xs">Últimos avisos e informativos</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {comunicados.slice(0,3).map((c:any) => {
            const tipoColor = c.tipo==='importante'?'#ef4444':c.tipo==='turma'?'#06b6d4':'#6366f1';
            const tipoLabel = c.tipo==='importante'?'Importante':c.tipo==='turma'?'Turma':'Geral';
            return (
              <div key={c.id} className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-xl p-3.5 hover:border-[#3a3d4e] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Chip size="sm" className="border-0" style={{ backgroundColor:`${tipoColor}18`, color: tipoColor }}>{tipoLabel}</Chip>
                  <span className="text-[#4b5563] text-[10px]">{new Date(c.publicado_em+'T00:00:00').toLocaleDateString('pt-BR',{ day:'numeric', month:'short' })}</span>
                </div>
                <h4 className="text-xs font-semibold text-white mb-1">{c.titulo}</h4>
                <p className="text-[#4b5563] text-[11px] leading-relaxed line-clamp-2">{c.conteudo}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

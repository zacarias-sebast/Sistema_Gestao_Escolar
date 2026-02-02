import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Spacer } from "@heroui/react";
import { Icon } from "@iconify/react";
import { supabase } from '@/lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setErro('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;

      if (data.user) {
        localStorage.setItem('eduflow_user', JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          nome: data.user.user_metadata?.nome || data.user.email?.split('@')[0] || 'Usuário',
          role: 'admin'
        }));
        navigate('/');
      }
    } catch (error: any) {
      console.error('Erro no login:', error.message);
      setErro(error.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#6366f1] opacity-10 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#06b6d4] opacity-8 blur-[100px]" />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-[#8b5cf6] opacity-6 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo & branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] shadow-lg shadow-[#6366f1]/25 mb-5">
            <Icon icon="lucide:graduation-cap" className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">EduFlow</h1>
          <p className="text-[#6b7280] text-sm mt-1">Sistema de Gestão Escolar</p>
        </div>

        <Card className="bg-[#1a1d2e] border border-[#2a2d3e] shadow-2xl shadow-black/30">
          <CardBody className="p-7 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[#9ca3af] text-sm font-medium">
                Email
              </label>
              <div className="relative group">
                <Icon icon="lucide:mail" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6366f1] w-4 h-4 group-focus-within:text-[#6366f1] transition-colors" />
                <input
                  type="email"
                  placeholder="admin@escola.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#12141f] border border-[#2a2d3e] hover:border-[#6366f1] rounded-xl pl-11 pr-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#6366f1]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#9ca3af] text-sm font-medium">
                Senha
              </label>
              <div className="relative group">
                <Icon icon="lucide:lock" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6366f1] w-4 h-4 group-focus-within:text-[#6366f1] transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  className="w-full bg-[#12141f] border border-[#2a2d3e] hover:border-[#6366f1] rounded-xl pl-11 pr-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-[#6366f1]"
                />
              </div>
            </div>
            {erro && (
              <div className="flex items-center gap-2 bg-[#3b1a1a] border border-[#5c2d2d] rounded-lg px-3 py-2">
                <Icon icon="lucide:alert-circle" className="text-[#f87171] w-4 h-4 flex-shrink-0" />
                <span className="text-[#f87171] text-xs">{erro}</span>
              </div>
            )}
            <Spacer y={1} />
            <Button
              onClick={handleLogin}
              isLoading={loading}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold rounded-xl h-11 shadow-lg shadow-[#6366f1]/30 hover:shadow-[#6366f1]/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Entrar
            </Button>
            <p className="text-center text-xs text-[#4b5563] mt-1">
              Use seu email e senha cadastrados no <span className="text-[#6366f1]">Supabase Auth</span>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

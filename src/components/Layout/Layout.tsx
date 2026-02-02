import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Avatar, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";

const navItems = [
  { path: '/', icon: 'lucide:layout-dashboard', label: 'Dashboard' },
  { path: '/alunos', icon: 'lucide:users', label: 'Alunos' },
  { path: '/professores', icon: 'lucide:user-check', label: 'Professores' },
  { path: '/turmas', icon: 'lucide:book-open', label: 'Turmas' },
  { path: '/disciplinas', icon: 'lucide:library', label: 'Disciplinas' },
  { path: '/notas', icon: 'lucide:file-text', label: 'Notas' },
  { path: '/frequencia', icon: 'lucide:check-square', label: 'Frequência' },
  { path: '/horario', icon: 'lucide:clock', label: 'Horário' },
  { path: '/comunicados', icon: 'lucide:bell', label: 'Comunicados' },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('eduflow_user');
    navigate('/login');
  };

  const currentPage = navItems.find(n => n.path === location.pathname);

  return (
    <div className="dark text-foreground bg-background min-h-screen flex h-screen overflow-hidden" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* SIDEBAR */}
      <aside
        className={`flex flex-col bg-[#12141f] border-r border-[#1e2035] transition-all duration-300 ease-in-out z-10 ${expanded ? 'w-64' : 'w-[72px]'}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 mt-2 mb-6">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-md shadow-[#6366f1]/30">
            <Icon icon="lucide:graduation-cap" className="w-5 h-5 text-white" />
          </div>
          {expanded && (
            <div className="overflow-hidden">
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">EduFlow</span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Tooltip key={item.path} content={item.label} placement="right" delay={expanded ? 99999 : 500}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-[#6366f1]/15 text-[#a5b4fc]'
                      : 'text-[#6b7280] hover:text-white hover:bg-[#1e2035]'
                    }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-[20%] bottom-[20%] w-0.5 bg-[#6366f1] rounded-r-full" />
                  )}
                  <Icon icon={item.icon} className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-[#6366f1]' : 'group-hover:text-[#a5b4fc]'}`} />
                  {expanded && (
                    <span className={`text-sm font-medium whitespace-nowrap overflow-hidden ${isActive ? 'text-[#a5b4fc]' : ''}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              </Tooltip>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-2 border-t border-[#1e2035] mt-auto">
          <Tooltip content="Sair" placement="right">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#6b7280] hover:text-[#f87171] hover:bg-[#3b1a1a]/50 transition-all duration-200 w-full group"
            >
              <div className="flex-shrink-0">
                <Avatar size="sm" src="https://i.pravatar.cc/150?img=32" className="w-7 h-7" />
              </div>
              {expanded && (
                <div className="flex items-center justify-between flex-1 overflow-hidden">
                  <div>
                    <p className="text-xs font-semibold text-white whitespace-nowrap">Administrador</p>
                    <p className="text-[10px] text-[#4b5563] whitespace-nowrap">admin@escola.edu</p>
                  </div>
                  <Icon icon="lucide:log-out" className="w-4 h-4 text-[#4b5563] group-hover:text-[#f87171] transition-colors" />
                </div>
              )}
            </button>
          </Tooltip>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#12141f] border-b border-[#1e2035] flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">{currentPage?.label || 'Dashboard'}</h2>
            <p className="text-[10px] text-[#4b5563]">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#1a1d2e] border border-[#2a2d3e] rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="text-xs text-[#6b7280]">Sistema Online</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0f1117]">
          <div className="animate-fade-in-up max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

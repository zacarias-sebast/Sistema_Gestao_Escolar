import { HeroUIProvider } from "@heroui/react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard/Dashboard';
import { Alunos } from '@/components/Alunos/Alunos';
import { AlunoForm } from '@/components/Alunos/AlunoForm';
import { Professores } from '@/components/Professores/Professores';
import { ProfessorForm } from '@/components/Professores/ProfessorForm';
import { Turmas } from '@/components/Turmas/Turmas';
import { TurmaForm } from '@/components/Turmas/TurmaForm';
import { Notas } from '@/components/Notas/Notas';
import { NotaForm } from '@/components/Notas/NotaForm';
import { Disciplinas } from '@/components/Disciplinas/Disciplinas';
import { DisciplinaForm } from '@/components/Disciplinas/DisciplinaForm';
import { Frequencia } from '@/components/Frequencia/Frequencia';
import { FrequenciaForm } from '@/components/Frequencia/FrequenciaForm';
import { Horario } from '@/components/Horario/Horario';
import { Comunicados } from '@/components/Comunicados/Comunicados';
import { ComunicadoForm } from '@/components/Comunicados/ComunicadoForm';
import { Login } from '@/components/Auth/Login';
import { Layout } from '@/components/Layout/Layout';

function App() {
  return (
    <HeroUIProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="alunos" element={<Alunos />} />
            <Route path="alunos/novo" element={<AlunoForm />} />
            <Route path="alunos/editar/:id" element={<AlunoForm />} />
            <Route path="professores" element={<Professores />} />
            <Route path="professores/novo" element={<ProfessorForm />} />
            <Route path="professores/editar/:id" element={<ProfessorForm />} />
            <Route path="turmas" element={<Turmas />} />
            <Route path="turmas/novo" element={<TurmaForm />} />
            <Route path="turmas/editar/:id" element={<TurmaForm />} />
            <Route path="notas" element={<Notas />} />
            <Route path="notas/novo" element={<NotaForm />} />
            <Route path="notas/editar/:id" element={<NotaForm />} />
            <Route path="disciplinas" element={<Disciplinas />} />
            <Route path="disciplinas/novo" element={<DisciplinaForm />} />
            <Route path="disciplinas/editar/:id" element={<DisciplinaForm />} />
            <Route path="frequencia" element={<Frequencia />} />
            <Route path="frequencia/novo" element={<FrequenciaForm />} />
            <Route path="frequencia/editar/:id" element={<FrequenciaForm />} />
            <Route path="horario" element={<Horario />} />
            <Route path="comunicados" element={<Comunicados />} />
            <Route path="comunicados/novo" element={<ComunicadoForm />} />
            <Route path="comunicados/editar/:id" element={<ComunicadoForm />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HeroUIProvider>
  );
}
export default App;
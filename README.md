<<<<<<< HEAD
# EduFlow — Sistema de Gestão Escolar

Sistema completo de gestão escolar com dados reais via **Supabase**.

---

## Configuração do Banco (Supabase)

**Faça isso antes de instalar o projeto:**

1. Acesse [supabase.com](https://supabase.com) e crie um projeto novo (pode ser gratuito).
2. Dentro do projeto, vá em **SQL Editor** (menu da esquerda).
3. Abra o arquivo **`supabase_schema.sql`** que está na raiz do projeto.
4. Cole todo o conteúdo no editor e clique **Run**.
   - Isso cria as 8 tabelas, índices, políticas RLS e insere os dados iniciais.
5. Vá em **Settings → API** e copie dois valores:
   - **Project URL** (exemplo: `https://abcdef123.supabase.co`)
   - **anon** key (chave pública)

---

## Instalação do Projeto

```bash
# 1. Entre na pasta do projeto
cd eduflow

# 2. Copie o arquivo de ambiente
cp .env.example .env

# 3. Abra o .env e coloque os valores do Supabase
#    VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
#    VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# 4. Instale as dependências
npm install

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:5173** no navegador.

**Login:** `admin@escola.edu` / `admin123`

---

## Estrutura do Projeto

```
eduflow/
├── supabase_schema.sql          ← Script SQL completo (tabelas + seed)
├── .env.example                 ← Template das variáveis de ambiente
├── src/
│   ├── lib/
│   │   ├── supabase.ts          ← Cliente Supabase configurado
│   │   └── services.ts          ← Todas as queries por entidade
│   ├── components/
│   │   ├── Auth/Login.tsx
│   │   ├── Layout/Layout.tsx
│   │   ├── Dashboard/Dashboard.tsx
│   │   ├── Alunos/Alunos.tsx
│   │   ├── Professores/Professores.tsx
│   │   ├── Turmas/Turmas.tsx
│   │   ├── Notas/Notas.tsx
│   │   ├── Frequencia/Frequencia.tsx
│   │   ├── Horario/Horario.tsx
│   │   └── Comunicados/Comunicados.tsx
│   ├── types/index.ts           ← Interfaces TypeScript
│   └── App.tsx                  ← Roteamento
└── package.json
```

---

## Módulos

| Módulo | O que faz |
|---|---|
| **Dashboard** | Visão geral: stats, gráficos de notas, presença semanal, alunos em risco |
| **Alunos** | CRUD completo de alunos com filtros por status e turma |
| **Professores** | CRUD de professores com especialidades e turmas lecionadas |
| **Turmas** | CRUD de turmas com ocupação e professor responsável |
| **Notas** | Lançamento e visualização de notas agrupadas por aluno |
| **Frequência** | Registro diário de presença com filtro por data e turma |
| **Horário** | Grade semanal de aulas por turma com tooltips |
| **Comunicados** | Criação e listagem de comunicados com tipos e filtros |

---

## Tecnologias

- React 18 + TypeScript
- Supabase (banco PostgreSQL + API REST)
- HeroUI (componentes)
- Recharts (gráficos)
- Tailwind CSS
- React Router v6
- Vite
=======
# Sistema_Gestao_Escolar
Sistema para gereciar uma escola
>>>>>>> 4bee21fe9f58f9ea67f1fa575c218b2b1033b446

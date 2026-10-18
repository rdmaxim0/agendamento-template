# Sistema de Agendamento Premium ✂️

Uma solução *full-stack* completa e escalável, desenhada para barbearias, salões e espaços de beleza que procuram oferecer uma experiência de excelência aos seus clientes.

O sistema automatiza todo o fluxo de reservas, garantindo que a matemática de horários respeita durações de serviços e períodos de pausa, evitando conflitos na agenda. Inclui uma interface com design premium (*Neumorphism* e *Glassmorphism*) e um painel de gestão exclusivo para o administrador.

## 🚀 Funcionalidades Principais

* **Checkout Dinâmico:** Suporte para Pix Automático (geração instantânea de QR Code via API do Mercado Pago com *polling*), Pix Manual (com envio de chave) e Pagamento em Dinheiro (com cálculo de troco).
* **Gestão Inteligente de Horários:** Algoritmo que bloqueia automaticamente horários sobrepostos e respeita a janela de expediente e hora de almoço.
* **Painel Administrativo:** Interface dedicada para gerir o catálogo de serviços, aprovar pagamentos manuais, cancelar reservas e ter a visão geral da agenda.
* **Notificações em Tempo Real:** Envio de e-mails transacionais automáticos para o cliente e para o administrador usando a API do Resend.
* **Design Responsivo & Temas:** Interface construída com SCSS, totalmente adaptada para dispositivos móveis, incluindo menus laterais fluidos e alternância nativa entre Tema Claro e Escuro.

## 🛠️ Stack Tecnológica

**Frontend:**
* React 18 + Vite
* TypeScript
* SCSS (Arquitetura BEM e Variáveis CSS)
* React Query (Gestão de estado assíncrono e Polling)
* React Router DOM
* Framer Motion (Animações fluidas)
* React Hook Form + Zod (Validação de formulários)
* Phosphor Icons

**Backend:**
* Node.js + Express
* TypeScript
* Prisma ORM
* PostgreSQL (via Supabase)
* Mercado Pago SDK
* Resend (Envio de e-mails)
* JSON Web Tokens (JWT) & bcrypt

## ⚙️ Instalação e Execução Local

### Pré-requisitos
* Node.js (v18 ou superior)
* Base de dados PostgreSQL (Ex: Supabase)
* Conta de Desenvolvedor no Mercado Pago
* Conta no Resend (para envio de e-mails)

### 1. Clonar o repositório
\`\`\`bash
git clone https://github.com/SEU-USUARIO/NOME-DO-REPO.git
cd NOME-DO-REPO
\`\`\`

### 2. Configurar o Backend
Abra o terminal na pasta `backend`:
\`\`\`bash
cd backend
npm install
\`\`\`

Crie um ficheiro `.env` na raiz da pasta `backend` com as seguintes variáveis:
\`\`\`env
# Base de Dados (Exemplo Supabase)
DATABASE_URL="postgresql://postgres.[PROJETO]:[SENHA]@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJETO]:[SENHA]@aws-0-us-east-2.pooler.supabase.com:5432/postgres"

# Segurança
PORT=3333
JWT_SECRET="sua_chave_secreta_super_segura"

# Mercado Pago
MP_ACCESS_TOKEN="TEST-sua-chave-aqui"

# E-mails (Resend)
RESEND_API_KEY="re_sua_chave_aqui"
ADMIN_EMAIL="seu_email@exemplo.com"
\`\`\`

Inicie a base de dados e povoe o catálogo de serviços:
\`\`\`bash
npx prisma generate
npx prisma db push
npx prisma db seed
\`\`\`

Inicie o servidor de desenvolvimento:
\`\`\`bash
npm run dev
\`\`\`

### 3. Configurar o Frontend
Abra um novo terminal na pasta `frontend`:
\`\`\`bash
cd frontend
npm install
\`\`\`

Crie um ficheiro `.env` na raiz da pasta `frontend`:
\`\`\`env
VITE_API_URL="http://localhost:3333"
\`\`\`

Inicie a aplicação React:
\`\`\`bash
npm run dev
\`\`\`

## 👨‍💼 Como testar o Painel de Administrador
1. Aceda a `http://localhost:5173/register` e crie uma conta.
2. No terminal do backend, execute `npx prisma studio`.
3. Na tabela `User`, encontre a conta que acabou de criar e altere a coluna `role` de `CUSTOMER` para `ADMIN`.
4. Feche o Prisma Studio, atualize a aplicação e o Painel de Administração estará disponível.

## 📄 Licença
Desenvolvido por Rodrigo Maximo.
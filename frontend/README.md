# ⚛️ AlumiGest - Frontend

Aplicação web e PWA do sistema **AlumiGest**, construída em **React 19**, **TypeScript** e **Vite** com estilização baseada no design system *Industrial Precision System* utilizando **Tailwind CSS**.

---

## 🛠️ Tecnologias & Frameworks
- **Linguagem:** TypeScript 5.x
- **Biblioteca:** React 19
- **Build Tool:** Vite 8
- **Estilização:** Tailwind CSS 3.4 & PostCSS
- **Roteamento:** React Router DOM 7
- **Ícones:** Material Symbols Outlined & Lucide React
- **Tipografia:** Hanken Grotesk, Inter, JetBrains Mono (Google Fonts)
- **Linter & Qualidade:** Oxlint & TypeScript compiler (`tsc`)

---

## 📂 Estrutura de Pastas e Componentes
```text
src/
├── components/         # Componentes reutilizáveis e modulares
│   ├── catalog/        # Componentes específicos do Catálogo (VidrosTab, PerfisTab, Modais)
│   ├── layout/         # Layout principal (DashboardLayout, Sidebar responsiva e TopNavBar)
│   └── ui/             # Componentes base da UI (Button, Input, Modal, Table, Tabs)
├── pages/              # Páginas e rotas da aplicação
│   ├── CatalogPage.tsx     # Gestão do Catálogo de Materiais
│   └── PlaceholderPage.tsx # Tela padrão para módulos em desenvolvimento
├── App.tsx             # Mapeamento e configuração de rotas (React Router)
├── main.tsx            # Ponto de entrada da aplicação
└── index.css           # CSS Global, tokens do Tailwind e fontes
```

---

## 🚀 Como Executar Localmente

### 1. Instalar as Dependências
Dentro da pasta `frontend/`:
```bash
npm install
```

### 2. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse no navegador: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Como Executar o Build de Produção e Validação

```bash
npm run build
```
Esse comando executa a verificação estática rigorosa do TypeScript (`tsc -b`) e gera o pacote otimizado para produção na pasta `dist/`.

---

## 📖 Padrões de UI/UX (Industrial Precision System)

1. **Cores Principais:**
   - **Primary:** Deep Midnight Navy (`#041632`) — Utilizado na Sidebar, cabeçalhos e botões primários.
   - **Secondary:** Steel Grey (`#505F76`) — Utilizado em bordas, subtítulos e elementos secundários.
   - **Success:** Emerald Green (`#10B981`) — Reservado para ações de conclusão e botões de destaque ("Novo Orçamento").
   - **Canvas:** Grey Tint (`#F1F5F9`) — Redução de fadiga ocular em relatórios e formulários de orçamento.

2. **Tipografia Técnica:**
   - **Headings & Títulos:** `Hanken Grotesk`
   - **Textos & Formulários:** `Inter`
   - **Códigos & Valores Monotemáticos:** `JetBrains Mono`

3. **Práticas de Componentização & Responsividade:**
   - **Sidebar Responsiva:** Drawer colapsável em dispositivos móveis.
   - **Tabelas Adaptativas:** Coluna de ações fixada à direita (`sticky right-0`) com sombra para acessibilidade em celulares.
   - **Suporte a Temas:** Suporte nativo a Modo Claro e Modo Escuro com persistência via `localStorage`.

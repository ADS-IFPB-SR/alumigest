# 📦 Pacote de Exemplo e Referência — Telas de Protótipo (Sprint 3)
> **Projeto:** AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias  
> **Objetivo:** Servir como referência de arquitetura de interface, fluxos de negócio, componentes gráficos vetoriais SVG e regras de cálculo para a equipe de desenvolvimento implementar as User Stories da **Sprint 3**.

---

## 📁 Estrutura de Arquivos do Pacote

```
prototipos_sprint3_exemplo/
├── README.md                                 # Este guia de orientação aos desenvolvedores
│
├── tipos/
│   └── index.ts                              # Interfaces TypeScript (Product, Budget, TemplateConfig, etc.)
│
├── telas/
│   ├── ProductsPage.tsx                      # Listagem de produtos e templates de esquadria
│   ├── ProductBuilderPage.tsx                # Construtor/Editor de template de esquadria
│   ├── BudgetsPage.tsx                       # Listagem de orçamentos com filtros de status
│   ├── BudgetBuilderPage.tsx                 # Wizard de criação de orçamento (medidas, insumos, SVG)
│   └── BudgetDetailPage.tsx                  # Relatório Comercial, Romaneio da Oficina e Impressão A4
│
├── componentes-templates-svg/
│   ├── DoorTemplateSvg.tsx                   # Motor vetorial SVG paramétrico (11 tipos, puxadores e furações)
│   ├── TemplateSelector.tsx                  # Seletor visual em grid dos modelos de esquadria
│   └── templateDefinitions.ts                # Definições técnicas, cores de alumínio e acabamentos de vidro
│
├── componentes-builder/
│   ├── ProductGeneralInfo.tsx                # Informações básicas e seleção de template do produto
│   ├── ProductTechSheet.tsx                  # Configuração de categorias de insumos requeridas
│   ├── ProductCostSummary.tsx                # Resumo visual de custos da esquadria
│   └── ProductCategoryPickerModal.tsx        # Modal de categorias
│
├── servicos-e-mocks/
│   ├── useBudgets.ts                         # Hook de gerenciamento de orçamentos e status
│   └── budgetStorage.ts                      # Simulação de persistência local (localStorage) e cálculo
│
└── estilos/
    └── index.css                             # Estilos globais e regras de impressão (@media print)
```

---

## 🔑 Principais Fluxos e Regras Implementadas

### 1. Construtor de Produtos / Templates (`ProductBuilderPage.tsx`)
- **Conceito:** O produto não fixa materiais específicos, mas sim um **Modelo de Esquadria (SVG)** e as **Categorias Obrigatórias de Insumos** (`GLASS`, `PROFILE`, `HARDWARE`, `FILM`).
- **11 Tipos Homologados:** Portas de correr 2F/4F, pivotante, giro 1F/2F, janelas 2F/4F/maxim-ar, box frontal/canto e fachada de vidro.
- **Componente SVG:** O `DoorTemplateSvg` renderiza proporcionalmente o desenho técnico baseado no tipo e configurações.

### 2. Wizard de Orçamentos (`BudgetBuilderPage.tsx`)
- **Passo 1 (Cliente):** Busca de cliente com autocomplete ou cadastro rápido inline via modal.
- **Passo 2 (Adicionar Esquadria):**
  - Definição de Largura $\times$ Altura em milímetros ($mm$).
  - Quantidade de unidades.
  - Sentido de abertura (`Direita` $\leftrightarrow$ `Esquerda` com inversão visual no SVG).
  - Seleção dinâmica de materiais para cada categoria requerida pelo template.
  - Configuração de puxador (tubular inox, fecho concha, maçaneta, lados e cobertura).
  - Configuração de furação (quantidade e divisão por igual ou com medida).
- **Passo 3 (Cálculos):**
  - Área em $m^2 = (\text{Largura} \times \text{Altura}) / 1.000.000 \times \text{Quantidade}$.
  - Subtotal do item atualizado em tempo real.
  - Desconto comercial percentual e total líquido.

### 3. Relatório Comercial e Proposta (`BudgetDetailPage.tsx`)
- **Aba 1 (Relatório Comercial):**
  - Cabeçalho timbrado com CNPJ e contatos da vidraçaria.
  - Dados do cliente e endereço da obra.
  - Tabela com miniaturas técnicas SVG, cotas em $mm$, especificações completas e valores.
  - Resumo financeiro e área para assinatura de aceite do cliente e do responsável técnico.
- **Aba 2 (Romaneio de Peças para Oficina):**
  - Gabarito técnico de corte ampliado.
  - Lista de corte de insumos com quantitativos multiplicados pelo número de peças.
- **Impressão / PDF (`window.print()`):**
  - Utiliza as regras de `@media print` definidas no `index.css`.
  - Oculta menus, sidebar, topbar e botões.
  - Aplica `break-inside: avoid` para **nunca cortar** desenhos SVG, tabelas ou dados entre páginas em folhas A4.

---

## 🔌 Relação com as Issues do Backlog (Sprint 3)

| Arquivo de Exemplo | Issue Relacionada no GitHub |
|---|---|
| `tipos/index.ts` | **#62** (US-03) e **#64** (US-05) |
| `telas/ProductsPage.tsx` e `ProductBuilderPage.tsx` | **#63** (US-04 - Tela de Produtos Frontend) |
| `telas/BudgetsPage.tsx` | **#66** (US-07 - Listagem de Orçamentos) |
| `telas/BudgetBuilderPage.tsx` | **#67** (US-08 - Wizard de Criação de Orçamento) |
| `telas/BudgetDetailPage.tsx` (Aba Comercial) | **#68** (US-09 - Relatório Comercial) |
| `telas/BudgetDetailPage.tsx` (Aba Romaneio) | **#69** (US-10 - Romaneio de Oficina) |
| `estilos/index.css` e impressão em `BudgetDetailPage.tsx` | **#70** (US-11 - Exportação PDF e Impressão) |
| `servicos-e-mocks/budgetStorage.ts` (Lógica de cálculo) | **#65** (US-06 - Motor de Cálculo Backend) |

---

## 💡 Recomendações para a Implementação Final
1. **Substituição de Mocks por API:** Nos arquivos de tela, substituir as chamadas ao `budgetStorage` / `localStorage` pelos hooks de mutação/queries (`useBudgets`, `useProducts`, etc.) apontando para os endpoints REST documentados em `docs/sistema/001-analise-projeto/API-Especificacao_API_REST.md`.
2. **Componente SVG:** O componente `DoorTemplateSvg.tsx` já é 100% puro e funcional, podendo ser copiado diretamente para a base de código oficial da feature.

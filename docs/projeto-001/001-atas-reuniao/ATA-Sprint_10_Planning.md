# 📝 ATA DE REUNIÃO DE PLANEJAMENTO (SPRINT 10 PLANNING)

**Projeto:** AlumiGest — Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Data:** 24 de Novembro de 2026 (Terça-feira) | **Horário:** 19:30 às 20:30  
**Local:** Reunião Virtual (Google Meet) / Sala de Projetos  
**Governança:** Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`)  

---

## 1. 👥 Participantes e Quórum

* **José Guylherme dos Santos Melo** — *Product Owner (PO) & Representante da Alumiportas*
* **Júlio Kennedy dos Santos Silva** — *Scrum Master & Desenvolvedor*
* **Italo Jefferson Lima dos Santos** — *Tech Lead & Desenvolvedor*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor*
* **Joseph Nichollas Abreu Cavalcante** — *Desenvolvedor*
* **Herbert Carvalho dos Santos** — *Desenvolvedor*
* **Maylson da Silva Rodrigues** — *Desenvolvedor*
* **Gabriel de Souza Nascimento** — *Desenvolvedor*

---

## 2. 🎯 Pauta da Reunião & Diretrizes Estratégicas do PO

1. Abertura da **Sprint 10** (Período Oficial: **24/11/2026 a 07/12/2026**), com foco estratégico em **Preparação, Segurança e Calibração para a Primeira Entrega Oficial (Release 2)** do AlumiGest.
2. Diretrizes e alinhamentos cruciais estabelecidos pelo Product Owner (Alumiportas):
   - **Autenticação de Usuário Único**: O sistema atende à oficina com **usuário único (administrador da oficina)**, sem necessidade de complexidade arquitetural com segregação em 3 categorias (`ADMIN`, `VENDEDOR`, `OPERADOR`). Todas as rotas privadas são protegidas via JWT.
   - **Logotipo Oficial Alumiportas**: O sistema já possui logomarca oficial consolidada (`/static/logo-alumiportas.png`). O módulo de configurações dinâmicas gerencia Razão Social, CNPJ, Telefone/WhatsApp, Endereço e Cidade, estampando a logo oficial em todos os cabeçalhos A4.
   - **Calibração do Ramo Moveleiro (Linha 45 mm Rometal)**: A Alumiportas atua prioritariamente na fabricação de portas de alumínio para marcenaria e móveis sob medida, utilizando a **Linha 45 mm Rometal**:
     - Perfis Estruturais: **RM-060** (Aba Baixa) e **RM-059** (Aba Alta).
     - Acabamentos homologados: **Bronze**, **Fosco** e **Preto**.
     - Vidros padronizados: Estritamente **Vidros de 4 mm** (Reflecta Bronze, Espelho, Incolor, Fumê).
     - Componentes: Esquadretas **ESQ-041** / **ESQ-055** (corte a 45°), parafusos M4×8 e baguete **BG-216**.
     - 4 Tipologias centrais: **Porta de Giro Moveleira**, **Porta de Correr Moveleira**, **Porta Basculante Aérea** e **Frente de Gaveta Moveleira**.
     - Meta: Paridade exata ($\Delta = \text{R\$} 0{,}00$) com as planilhas da oficina.
   - **Saneamento de Bugs & Qualidade**: Validação e merge do PR #600 (correção de etiquetas térmicas 100×60mm na Venda Avulsa), 100% dos testes verdes e SonarQube com 0 code smells.
3. Descarte formal de fluxos de pagamento/financeiro nesta iteração.
4. Homologação do protótipo interativo `docs/planejamento/prototipos/autenticacao-configuracoes-homologacao.html` demonstrando a navegação nos 4 pilares em conformidade com o Design System oficial.

---

## 3. 📋 Detalhamento do Backlog Homologado (Sprint Backlog)

### 3.1 Visão Geral por Pilares

| Pilar | Escopo / Módulo | Story Points | Horas Estimadas | Tarefas |
|---|---|:---:|:---:|:---:|
| **Pilar 1** | Segurança & Autenticação de Usuário Único | 5 pts | 8.0h | `US-10.1` a `US-10.3` (3 tarefas atômicas) |
| **Pilar 2** | Configurações da Empresa e Logo Oficial | 4 pts | 7.5h | `US-10.4` a `US-10.6` (3 tarefas atômicas) |
| **Pilar 3** | Calibração Moveleira Linha 45 mm Rometal | 2 pts | 5.5h | `US-10.7` e `US-10.8` (2 tarefas atômicas) |
| **Pilar 4** | Saneamento de Bugs & Dossiê de Homologação | 2 pts | 5.5h | `US-10.9` e `US-10.10` (2 tarefas atômicas) |
| **Total** | **Sprint Backlog Oficial da Sprint 10** | **13 pts** | **26.5h** | **10 Tarefas Atômicas** |

### 3.2 Tarefas Decompostas (`docs/planejamento/sprint-10/README.md`)

| Subtarefa | Título da Tarefa Atômica | Pontos | Horas |
|:---:|---|:---:|:---:|
| `US-10.1` | Setup de Autenticação, Entidade `User` e Migração Flyway `V27` | 1 pt | 2.0h |
| `US-10.2` | Motor de Autenticação JWT, Spring Security 6 e Endpoints `/api/v1/auth` | 2 pts | 3.0h |
| `US-10.3` | Tela de Login (`/login`) e Proteção de Rotas (`ProtectedRoute`) no Frontend | 2 pts | 3.0h |
| `US-10.4` | Entidade `CompanySettings`, Migração `V28` e Endpoints de Configurações | 1 pt | 2.0h |
| `US-10.5` | Tela de Configurações (`/configuracoes`) com Preview de Cabeçalho A4 | 2 pts | 3.0h |
| `US-10.6` | Consumo Dinâmico dos Dados da Empresa em todos os PDFs e Etiquetas | 1 pt | 2.5h |
| `US-10.7` | Matriz de Calibração das 4 Tipologias Moveleiras Rometal 45 mm | 1 pt | 2.5h |
| `US-10.8` | Ajuste Fino dos Motores de Cálculo para Paridade Centavo a Centavo | 1 pt | 3.0h |
| `US-10.9` | Saneamento do Bug de Etiquetas Térmicas na Venda Avulsa (PR #600) | 1 pt | 2.5h |
| `US-10.10` | Bateria E2E Cypress, Quality Gate SonarQube e Dossiê de Homologação | 1 pt | 3.0h |

---

## 4. 📢 Encaminhamentos e Próximos Passos

1. Iniciar o desenvolvimento das fatias atômicas a partir de branches padronizadas baseadas em `develop`.
2. O Tech Lead coordenará o setup do Spring Security 6 (`US-10.1` e `US-10.2`) para desbloquear as telas do frontend (`US-10.3`).
3. O Product Owner validará a matriz de calibração moveleira da `US-10.7` com as ordens de serviço reais da oficina.

# PIT — Plano de Iteração — Sprint 07

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 07 — Gestão Fabril: Etiquetas de Identificação de Peças (US-17) e Painel Kanban de Produção (US-18) |
| **Período** | 13/10/2026 a 27/10/2026 (14 dias) — **🟢 Concluída (100% Entregue em 23/10/2026)** |
| **Scrum Master / PO** | José Guylherme dos Santos Melo — Product Owner & Scrum Master |
| **Tech Lead** | Italo Jefferson Lima dos Santos — Tech Lead & Engenharia |
| **Versão** | 2.0 (Fechamento Oficial e Conclusão das US-17 e US-18 no GitHub) |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 🎯 Objetivo da Sprint 07

Iniciar e consolidar a **Release 2 (Gestão de Produção & Fábrica)** do AlumiGest, estabelecendo a esteira operacional que conecta os pedidos de venda aprovados na Sprint 06 ao chão de fábrica e à oficina de esquadrias:

1. **US-17 (#142) — Emitir Etiquetas de Identificação de Peças por Item do Pedido:** Emissão de etiquetas adesivas térmicas (100x60mm / 1000x600mm) contendo identificação de cliente, O.S., medidas nominais (L x A), cor do alumínio, tipo de vidro e numeração sequencial/rastreabilidade por exemplar físico e folha de esquadria (5 pts).
2. **US-18 (#143) — Acompanhar Produção via Painel Kanban de Pedidos de Venda:** Criação da esteira fabril visual no frontend estruturada nas colunas `AGUARDANDO_PRODUCAO`, `EM_PRODUCAO` e `CONCLUIDO`, com controle transicional de status no backend, registro automático de data de conclusão e badges dinâmicos de urgência de prazo/SLA (5 pts).
3. **Qualidade e Sustentação Técnica:** Garantir cobertura de testes unitários ($\ge 80\%$) para serviços de geração de documentos e transições fabris, bem como resolução de inconsistências detectadas em homologação.

---

## 2. 📋 Backlog da Sprint 07 (Quadro Oficial GitHub Projects)

O backlog foi dimensionado em **10 Story Points** distribuídos em **11 Fatias Verticais (*Thin Vertical Slices*)**, totalizando **27.0 horas estimadas**:

| Subtarefa | Descrição Técnica da Fatia | Tipo / Módulo | Horas | Executor Real (GitHub) | PR no GitHub | Status In-Sprint |
|:---:|---|---|:---:|---|:---:|:---:|
| **`US-17.1`** | Criar serviço `LabelPdfService` usando OpenPDF com layout térmico, cliente, medidas, cor, vidro e paginação | Backend Core / PDF | 3.0h | **Italo Jefferson** | PR #448 / PR #463 | 🟢 Concluído |
| **`US-17.2`** | Adicionar endpoint `GET /api/orders/{orderId}/labels-pdf` no `OrderController` com stream `application/pdf` | Backend REST / API | 2.0h | **Guilherme Kauã** | PR #449 / PR #465 | 🟢 Concluído |
| **`US-17.3`** | Criar bateria de testes unitários do `LabelPdfService` validando geração de bytes e contagem de peças | Testes Unitários | 2.0h | **Italo Jefferson** | PR #448 / PR #463 | 🟢 Concluído |
| **`US-17.4`** | Adicionar botão "Imprimir Etiquetas" na tela de detalhes do pedido (`OrderDetailPage.tsx`) com modal e feedback visual | Frontend UI / Ações | 2.0h | **Júlio Kennedy** | PR #451 / PR #470 | 🟢 Concluído |
| **`US-18.1`** | Implementar endpoint `PATCH /api/orders/{id}/production-status` no backend com gravação de `data_conclusao` | Backend Core / Regras | 3.0h | **José Guylherme** | PR #452 / PR #472 | 🟢 Concluído |
| **`US-18.2`** | Criar hook React Query `useProductionKanban` e serviços Axios de produção (`productionApi.ts`) | Frontend State / API | 2.0h | **Gabriel de Souza** *(Testes: Italo J.)* | PR #453 / PR #488 / PR #507 | 🟢 Concluído |
| **`US-18.3`** | Criar componente `OrderProductionCard` no frontend com indicador de SLA, contagem de peças e ações | Frontend UI / Cards | 3.0h | **Maylson Rodrigues** | PR #454 / PR #471 | 🟢 Concluído |
| **`US-18.4`** | Criar componente `ProductionKanbanBoard` com colunas de status fabril e transições contextuais | Frontend UI / Kanban | 3.0h | **Júlio Kennedy** | PR #455 / PR #482 | 🟢 Concluído |
| **`US-18.5`** | Criar página `ProductionKanbanPage` com filtros de busca por código, cliente e estágio | Fatia Vertical UI | 3.0h | **Joseph Nichollas** | PR #456 / PR #505 | 🟢 Concluído |
| **`US-18.6`** | Configurar rota `/producao` no React Router e atalho "Produção (Kanban)" no menu lateral (`Sidebar.tsx`) | Frontend Nav | 1.0h | **Guilherme Kauã** | PR #457 / PR #508 | 🟢 Concluído |
| **`US-18.7`** | Documentar endpoints no OpenAPI/Swagger e implementar testes de integração para status fabril | Testes & Docs | 3.0h | **Maylson Rodrigues** *(Invariantes: Italo J.)* | PR #481 | 🟢 Concluído |
| **Total** | **Sprint Backlog Oficial** | **11 Fatias Verticais** | **27.0h** | **Equipe Completa** | — | 🟢 **Concluída (100%)** |

---

## 3. 🔍 Acompanhamento e Conclusão das User Stories (Situação em 23/10/2026)

* **Módulo US-17 (Etiquetas Térmicas):** Todas as 4 fatias verticais foram implementadas, validadas e integradas na branch `develop` através do **PR consolidado #509**. A esteira de etiquetas contemplou correções de bugs (#485 via PR #491, #486 via PR #494, #487 via PR #497 e #492/#493 via PR #495), garantindo layout térmico fiel, cálculo de frações de folhas no backend e preservação de contadores globais.
* **Módulo US-18 (Painel Kanban de Produção):** Todas as 7 fatias verticais foram implementadas com sucesso:
  * Backend: endpoint `PATCH /api/v1/orders/{id}/production-status` com preenchimento atômico de `completion_date`, validações de transição fabril e proteção contra pedidos cancelados;
  * Frontend: hook `useProductionKanban`, cards informativos com cálculo de urgência de prazo/SLA (`OrderProductionCard`), quadro Kanban completo em 3 colunas (`ProductionKanbanBoard`), página dedicada (`ProductionKanbanPage`) com filtros instantâneos e atalho no menu lateral (`Sidebar.tsx`);
  * Testes: suítes unitárias, integração MockMvc e testes E2E dedicados à US-18.
* **Situação das Histórias Pai no GitHub:**
  * **US-17 (#142):** 🟢 **Finalizada e Mesclada** no GitHub.
  * **US-18 (#143):** 🟢 **Finalizada e Mesclada** no GitHub.

---

## 4. 🐞 BUGs e Defeitos Tratados In-Sprint

Durante o ciclo de execução da Sprint 07, além do escopo funcional das User Stories, a equipe de desenvolvimento absorveu uma carga intensiva de **estabilização técnica, resolução de bugs de campo da US-17** e **correções de débitos e regressões herdadas da Sprint 06 / Release 2**:

### 4.1 BUGs da US-17 (Etiquetas Térmicas de Identificação)
Identificados durante a homologação funcional no chão de fábrica e testes com a impressora física:

| Issue | Título / Descrição | Severidade | Autor Issue | Resolvido por | Resolução / PR |
|:---:|---|:---:|:---:|:---:|---|
| **#483** | Cálculo incorreto de `totalPieces` e reset de `pieceNumber` ao filtrar etiquetas térmicas por `itemId` | P2 - Alto | GMSantos20 | **Herbert Carvalho** | ✅ **Resolvido (PR #509)** com totalização global |
| **#484** | Ausência de validação no backend para bloqueio de emissão de etiquetas em ordens canceladas | P2 - Alto | GMSantos20 | **Maylson Rodrigues** | ✅ **Resolvido (PR #509)** via validação de `OrderStatus.CANCELLED` |
| **#485** | Mascaramento de mensagens de erro HTTP 422/404 em `downloadLabelsPdf` devido ao `responseType: 'blob'` | P2 - Alto | GMSantos20 | **Joseph Nichollas** | ✅ **Resolvido (PR #491)** via desserialização de blob JSON |
| **#486** | Divergência de ordenação, quantidade zero e leitura de ambiente no `ThermalLabelModal` | P2 - Alto | GMSantos20 | **Guilherme Kauã** | ✅ **Resolvido (PR #494)** com alinhamento às regras do backend |
| **#487** | Botão 'Baixar PDF' no `ThermalLabelModal` ignora o filtro ativo e rótulo de impressão é estático | P3 - Médio | GMSantos20 | **Júlio Kennedy** | ✅ **Resolvido (PR #497)** com repasse dinâmico de filtro |
| **#492** | Dimensões 100x60mm incorretas, multiplicação de etiquetas (1 item gerando 4 cópias) e dedução de folhas por esquadria | P1 - Crítico | GMSantos20 | **Italo Jefferson** | ✅ **Resolvido (PR #495)** no layout térmico e motor backend |
| **#493** | Impressão térmica baixava PDF em vez de emitir diretamente para a impressora física (Elgin L42) | P2 - Alto | GMSantos20 | **Italo Jefferson** | ✅ **Resolvido (PR #495)** com script nativo e `@media print` |

### 4.2 BUGs e Débitos Extras Resolvidos pela Equipe (Fora do Backlog Original)
Itens não previstos no planejamento inicial da Sprint 07, mas prontamente absorvidos e solucionados pelo time de engenharia para blindagem da Release 2:

| PR / Ref | Descrição Técnica da Correção | Responsável | Status |
|:---:|---|:---:|:---:|
| **PR #489** (BUG-043) | Adiciona canal de aprovação `OUTRO` no frontend e backend com persistência correta | Júlio Kennedy | ✅ Merged |
| **PR #480** | Corrige separadores e espaços em branco duplicados na renderização do endereço do cliente | Herbert Santos | ✅ Merged |
| **PR #479** | Corrige exibição e formatação da condição de pagamento no resumo financeiro | Herbert Santos | ✅ Merged |
| **PR #469** (BUG-040) | Separação do contrato canônico `/api/v1/orders` de aliases legados (`/api/orders`, `/api/pedidos`) | Guilherme Kauã | ✅ Merged |
| **PR #468** (#443) | Garante chaves únicas do React para as reticências na paginação da listagem de ordens | Joseph Nichollas | ✅ Merged |
| **PR #467** (#441) | Bloqueia fechamento acidental via tecla `Escape` e clique no backdrop durante submissão | Italo Santos | ✅ Merged |
| **PR #466** (BUG-039) | Redirecionamento automático de rotas legadas (`/pedidos`, `/work-orders`) para a URL canônica `/ordens-servico` | Guilherme Kauã | ✅ Merged |
| **PR #464** (#434, #438) | Ordenação robusta de códigos de O.S. por magnitude numérica anual e sanitização de sufixos malformados | Joseph Nichollas | ✅ Merged |
| **PR #461** | Correção do status inicial `CREATED` e controle da transição de status para produção (US-15.1) | José Guylherme | ✅ Merged |
| **PR #490** | Habilitação do gatilho `merge_group` no GitHub Actions para suporte a fila de mesclagem e estabilização de CI | Italo Santos | ✅ Merged |

---

## 5. 🛡️ Riscos e Mitigações Registrados na Sprint 07

* **Risco R16 — Calibração Dimensional e Integração de Impressoras Térmicas (Elgin L42):**
  * *Impacto:* Risco de etiquetas desalinhadas na bobina adesiva de 100x60mm ou dependência de diálogos do navegador Chrome.
  * *Mitigação:* Calibração do motor com comando nativo BPLB/EPL2 (`q800`, `Q480,24`) e disponibilização tanto de download de PDF padronizado quanto de script nativo BPLB.
* **Risco R17 — Segregação de Responsabilidades (Backend x Frontend):**
  * *Impacto:* Risco de duplicar regras de cálculo de folhas físicas no frontend da aplicação, violando as diretrizes de arquitetura do projeto.
  * *Mitigação:* Garantir que todo o cálculo de dedução de folhas e frações seja resolvido exclusivamente pelo backend (`ThermalLabelDataResolver`), expondo dados consolidados via DTO para a interface.
* **Risco R18 — Transições Concorrentes de Status no Kanban Fabril:**
  * *Impacto:* Conflito de transição quando múltiplos operadores fabris avançam ordens simultaneamente.
  * *Mitigação:* Validação atômica da máquina de estados no backend (`PATCH /api/orders/{id}/production-status`), rejeitando saltos inválidos de status.

---

## 6. 📅 Rituais de Governança da Sprint 07

1. **Daily Scrum:** Reuniões diárias de alinhamento com registro e consolidação semanal em atas na sexta-feira (Semana 1: 16/10/2026 ✅ | Semana 2: 23/10/2026 ⏳).
2. **Sprint Review & Retrospectiva:** Agendada para o fechamento do ciclo em **27/10/2026**, com demonstração das etiquetas físicas e do Painel Kanban para o PO.

---

*Plano de Iteração oficial da Sprint 07 — AlumiGest — Registrado em conformidade com Docs-as-Code — 21/10/2026*

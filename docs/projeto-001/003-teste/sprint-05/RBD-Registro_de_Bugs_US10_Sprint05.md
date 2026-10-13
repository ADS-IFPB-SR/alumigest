# 🐞 RBD — Registro de Bugs e Defeitos da US-10 — Sprint 05

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçarias e Serralherias de Alumínio |
| **Documento** | Relatório de Registro de Bugs e Não-Conformidades da Sprint 05 (US-10) |
| **User Story** | [US-10: Emitir e Exportar Orçamento em PDF - Via Comercial e WhatsApp](https://github.com/ADS-IFPB-SR/alumigest/issues/134) |
| **Scrum Master** | Júlio Kennedy dos Santos Silva |
| **Equipe Técnica** | Equipe de Engenharia e QA AlumiGest |
| **Data de Emissão** | 29/09/2026 |
| **Status Geral** | 🟡 5 Defeitos Catalogados para Triagem e Correção |
| **Documento Central** | [`RBD-Registro_de_Bugs_e_Defeitos.md`](../RBD-Registro_de_Bugs_e_Defeitos.md) (v2.6.0) |

---

## 1. 🎯 Objetivo e Contexto da Sprint 05

Este documento consolida a análise técnica e o levantamento de defeitos, inconsistências de contrato e vulnerabilidades funcionais identificados no escopo da **US-10 (Emissão e Exportação de Orçamento em PDF - Via Comercial e WhatsApp)** durante a **Sprint 05**.

Conforme a governança da **Metodologia IMPROS** e do **Plano de Gerência de Configuração (PGC)**:
1. Este registro atua como o desdobramento da Sprint 05 para acompanhamento direto pelo **Scrum Master** (**Júlio Kennedy dos Santos Silva**).
2. Todos os itens catalogados possuem rastreabilidade bidirecional com o catálogo mestre corporativo [`RBD-Registro_de_Bugs_e_Defeitos.md`](../RBD-Registro_de_Bugs_e_Defeitos.md) sob os identificadores **BUG-027 a BUG-031**.
3. O objetivo é orientar o planejamento de correções (*bug fixing*), a triagem no Daily Scrum e a garantia de qualidade para a **Release 1 (v1.0.0)**.

---

## 2. 📊 Matriz de Bugs da US-10

| ID | Issue GitHub | Título Resumido | Componente / Camada | Severidade | Impacto no Negócio / Usuário | Status |
|:---:|:---:|:---|:---:|:---:|:---|:---:|
| **[BUG-027](../RBD-Registro_de_Bugs_e_Defeitos.md#bug-027)** | [#372](https://github.com/ADS-IFPB-SR/alumigest/issues/372) | Divergência de Cálculo de Mão de Obra (`laborCost`) entre Frontend e Backend com Múltiplas Quantidades (`quantity > 1`) | Motor de Orçamentos / Backend & UI | 🔴 Alta (P2) | O valor de mão de obra e o subtotal líquido de materiais divergem entre a tela e o PDF comercial impresso. | 🟡 Aberto |
| **[BUG-028](../RBD-Registro_de_Bugs_e_Defeitos.md#bug-028)** | [#373](https://github.com/ADS-IFPB-SR/alumigest/issues/373) | Falha da Clipboard API em Ambientes HTTP e Ausência de Link Direto para WhatsApp (`api.whatsapp.com/send`) | Frontend / Ações (`BudgetDetailActions.tsx`) | 🟡 Média (P3) | Em redes locais HTTP/PWA (`http://192.168.x.x`), o botão de copiar gera crash de console; falta link de envio direto. | 🟡 Aberto |
| **[BUG-029](../RBD-Registro_de_Bugs_e_Defeitos.md#bug-029)** | [#374](https://github.com/ADS-IFPB-SR/alumigest/issues/374) | Cálculo Incorreto de Dias de Validade no Rodapé do PDF com Sobrescrita Indevida para 15 Dias | Backend / PDF (`BudgetPdfService.java`) | 🟡 Média (P3) | Prazos curtos (< 24h ou horas próximas) são truncados e forçados para "15 dias", gerando contradição legal no PDF. | 🟡 Aberto |
| **[BUG-030](../RBD-Registro_de_Bugs_e_Defeitos.md#bug-030)** | [#375](https://github.com/ADS-IFPB-SR/alumigest/issues/375) | Razão Social da Empresa Hardcodada no Resumo para WhatsApp Ignorando `CompanyProperties` | Backend / WhatsApp (`BudgetPdfService.java`) | 🟢 Baixa (P4) | Propostas enviadas pelo WhatsApp fixam a assinatura "Alumiportas" mesmo se a empresa configurar outra razão social. | 🟡 Aberto |
| **[BUG-031](../RBD-Registro_de_Bugs_e_Defeitos.md#bug-031)** | [#376](https://github.com/ADS-IFPB-SR/alumigest/issues/376) | Resposta de Erro Empacotada como Blob sem Tratamento de Mensagem no Download de PDF Comercial | Frontend / API (`budgetsApi.ts`) | 🟡 Média (P3) | Exceções de regra (orçamento cancelado 422) são mascaradas por toasts genéricos sem orientação ao usuário. | 🟡 Aberto |

---

## 3. 🔍 Detalhamento Técnico das Não-Conformidades

### BUG-027: Divergência de Cálculo de Mão de Obra com `quantity > 1` (Issue #372)
* **Arquivos Afetados:**
  - [`BudgetPricingService.java`](../../../../backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPricingService.java)
  - [`BudgetPdfService.java`](../../../../backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java)
  - [`BudgetDetailPage.tsx`](../../../../frontend/src/pages/BudgetDetailPage.tsx)
* **Diagnóstico Técnico:**
  O backend soma `laborCost` uma única vez no subtotal da linha (`itemSubtotal = (materiais * qty) + laborCost`), enquanto o frontend calcula `totalLaborCost` multiplicando `laborCost * qty`. Se um item tiver quantidade 3 e mão de obra de R$ 100,00, a tela indica R$ 300,00 de serviço, mas o PDF e o banco cobram apenas R$ 100,00.
* **Solução Recomendada:** Alinhar o modelo matemático: se a mão de obra for unitária, aplicar `itemSubtotal = (itemMaterialsSubtotal.add(itemLaborCost)).multiply(BigDecimal.valueOf(itemQty))` e atualizar o acumulador do PDF comercial.

---

### BUG-028: Quebra de Clipboard em HTTP e Falta de Link WhatsApp (Issue #373)
* **Arquivos Afetados:**
  - [`BudgetDetailActions.tsx`](../../../../frontend/src/features/budgets/components/BudgetDetailActions.tsx)
  - [`BudgetDetailPage.tsx`](../../../../frontend/src/pages/BudgetDetailPage.tsx)
* **Diagnóstico Técnico:**
  `navigator.clipboard` é restrito a HTTPS e `localhost`. Em ambiente de oficina/rede local (`http://192.168.x.x`), o objeto é `undefined` e causa exceção não tratada capturada pelo catch genérico. Além disso, a sub-tarefa US-10.10 especificava expressamente o link WhatsApp (`https://api.whatsapp.com/send?text=...`), ausente na interface.
* **Solução Recomendada:** Implementar fallback com elemento `<textarea>` temporário e `document.execCommand('copy')`, além de adicionar botão/link para abertura direta da URL do WhatsApp com `encodeURIComponent(text)`.

---

### BUG-029: Cálculo Incorreto de Dias de Validade no PDF Comercial (Issue #374)
* **Arquivos Afetados:**
  - [`BudgetPdfService.java`](../../../../backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java)
* **Diagnóstico Técnico:**
  O uso de `Duration.between().toDays()` sobre datas de calendário com horários próximos resulta em `0` dias. O fallback `if (diasValidade <= 0) diasValidade = 15;` sobrescreve prazos legítimos de 1 ou 2 dias para 15 dias.
* **Solução Recomendada:** Calcular a diferença entre `LocalDate` usando `ChronoUnit.DAYS.between(createdAt.toLocalDate(), validUntil.toLocalDate())`.

---

### BUG-030: Razão Social Hardcodada no WhatsApp (Issue #375)
* **Arquivos Afetados:**
  - [`BudgetPdfService.java`](../../../../backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java)
* **Diagnóstico Técnico:**
  A string `_Alumiportas - Vidraçaria e Esquadrias_` está literal no código, ignorando a propriedade configurada em `CompanyProperties`.
* **Solução Recomendada:** Utilizar `companyProps.getRazaoSocial()` com fallback dinâmico.

---

### BUG-031: Falta de Extração de Erro em Respostas Blob (Issue #376)
* **Arquivos Afetados:**
  - [`budgetsApi.ts`](../../../../frontend/src/features/budgets/services/budgetsApi.ts)
  - [`BudgetDetailActions.tsx`](../../../../frontend/src/features/budgets/components/BudgetDetailActions.tsx)
* **Diagnóstico Técnico:**
  Requisições com `responseType: 'blob'` retornam o payload de erro como `Blob`. Sem deserializar o texto, o toast exibe mensagem genérica e não informa, por exemplo, que o orçamento não pode ser baixado porque está com status `CANCELLED`.
* **Solução Recomendada:** Converter `error.response.data` de Blob para JSON (`await error.response.data.text()`) e repassar a mensagem real para o toast.

---

## 4. 🧭 Orientações ao Scrum Master para Gestão das Correções

1. **Priorização no Backlog:**
   - **Sprint Atual (Sprint 05):** O **BUG-027** ([#372](https://github.com/ADS-IFPB-SR/alumigest/issues/372)) e o **BUG-029** ([#374](https://github.com/ADS-IFPB-SR/alumigest/issues/374)) devem ser priorizados imediatamente para não comprometer a homologação comercial da Release 1.
   - **Melhorias de Usabilidade:** **BUG-028** ([#373](https://github.com/ADS-IFPB-SR/alumigest/issues/373)), **BUG-030** ([#375](https://github.com/ADS-IFPB-SR/alumigest/issues/375)) e **BUG-031** ([#376](https://github.com/ADS-IFPB-SR/alumigest/issues/376)) podem ser distribuídos como tarefas de refinamento contínuo da US-10.
2. **Atualização da Governança:**
   - Todos os bugs já foram integrados ao catálogo mestre [`RBD-Registro_de_Bugs_e_Defeitos.md`](../RBD-Registro_de_Bugs_e_Defeitos.md).
   - As issues individuais no GitHub foram formalmente criadas vinculadas à sub-árvore da [US-10 (#134)](https://github.com/ADS-IFPB-SR/alumigest/issues/134): [#372](https://github.com/ADS-IFPB-SR/alumigest/issues/372), [#373](https://github.com/ADS-IFPB-SR/alumigest/issues/373), [#374](https://github.com/ADS-IFPB-SR/alumigest/issues/374), [#375](https://github.com/ADS-IFPB-SR/alumigest/issues/375) e [#376](https://github.com/ADS-IFPB-SR/alumigest/issues/376).

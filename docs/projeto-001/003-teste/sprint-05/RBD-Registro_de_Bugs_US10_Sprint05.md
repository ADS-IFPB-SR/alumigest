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
| **Documento Central** | [`RBD-Registro_de_Bugs_e_Defeitos.md`](../RBD-Registro_de_Bugs_e_Defeitos.md) (v2.2.0) |

---

## 1. 🎯 Objetivo e Contexto da Sprint 05

Este documento consolida a análise técnica e o levantamento de defeitos, inconsistências de contrato e vulnerabilidades funcionais identificados no escopo da **US-10 (Emissão e Exportação de Orçamento em PDF - Via Comercial e WhatsApp)** durante a **Sprint 05**.

Conforme a governança da **Metodologia IMPROS** e do **Plano de Gerência de Configuração (PGC)**:
1. Este registro atua como o desdobramento da Sprint 05 para acompanhamento direto pelo **Scrum Master** (**Júlio Kennedy dos Santos Silva**).
2. Todos os itens catalogados possuem rastreabilidade bidirecional com o catálogo mestre corporativo [`RBD-Registro_de_Bugs_e_Defeitos.md`](../RBD-Registro_de_Bugs_e_Defeitos.md) sob os identificadores **BUG-023 a BUG-027**.
3. O objetivo é orientar o planejamento de correções (*bug fixing*), a triagem no Daily Scrum e a garantia de qualidade para a **Release 1 (v1.0.0)**.

---

## 2. 📊 Matriz de Bugs da US-10

| ID | Título Resumido | Componente / Camada | Severidade | Impacto no Negócio / Usuário | Status |
|:---:|:---|:---:|:---:|:---|:---:|
| **[BUG-023](../RBD-Registro_de_Bugs_e_Defeitos.md#bug-023)** | Divergência de Cálculo de Mão de Obra (`laborCost`) entre Frontend e Backend com Múltiplas Quantidades (`quantity > 1`) | Motor de Orçamentos / Backend & UI | 🔴 Alta (P2) | O valor de mão de obra e o subtotal líquido de materiais divergem entre a tela e o PDF comercial impresso. | 🟡 Aberto |
| **[BUG-024](../RBD-Registro_de_Bugs_e_Defeitos.md#bug-024)** | Falha da Clipboard API em Ambientes HTTP e Ausência de Link Direto para WhatsApp (`api.whatsapp.com/send`) | Frontend / Ações (`BudgetDetailActions.tsx`) | 🟡 Média (P3) | Em redes locais HTTP/PWA (`http://192.168.x.x`), o botão de copiar gera crash de console; falta link de envio direto. | 🟡 Aberto |
| **[BUG-025](../RBD-Registro_de_Bugs_e_Defeitos.md#bug-025)** | Cálculo Incorreto de Dias de Validade no Rodapé do PDF com Sobrescrita Indevida para 15 Dias | Backend / PDF (`BudgetPdfService.java`) | 🟡 Média (P3) | Prazos curtos (< 24h ou horas próximas) são truncados e forçados para "15 dias", gerando contradição legal no PDF. | 🟡 Aberto |
| **[BUG-026](../RBD-Registro_de_Bugs_e_Defeitos.md#bug-026)** | Razão Social da Empresa Hardcodada no Resumo para WhatsApp Ignorando `CompanyProperties` | Backend / WhatsApp (`BudgetPdfService.java`) | 🟢 Baixa (P4) | Propostas enviadas pelo WhatsApp fixam a assinatura "Alumiportas" mesmo se a empresa configurar outra razão social. | 🟡 Aberto |
| **[BUG-027](../RBD-Registro_de_Bugs_e_Defeitos.md#bug-027)** | Resposta de Erro Empacotada como Blob sem Tratamento de Mensagem no Download de PDF Comercial | Frontend / API (`budgetsApi.ts`) | 🟡 Média (P3) | Exceções de regra (orçamento cancelado 422) são mascaradas por toasts genéricos sem orientação ao usuário. | 🟡 Aberto |

---

## 3. 🔍 Detalhamento Técnico das Não-Conformidades

### BUG-023: Divergência de Cálculo de Mão de Obra com `quantity > 1`
* **Arquivos Afetados:**
  - [`BudgetPricingService.java`](file:///c:/Users/J%C3%BAlio%20Kennedy/Documents/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPricingService.java#L50-L58)
  - [`BudgetPdfService.java`](file:///c:/Users/J%C3%BAlio%20Kennedy/Documents/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java#L510-L525)
  - [`BudgetDetailPage.tsx`](file:///c:/Users/J%C3%BAlio%20Kennedy/Documents/alumigest/frontend/src/pages/BudgetDetailPage.tsx#L89-L92)
* **Diagnóstico Técnico:**
  O backend soma `laborCost` uma única vez no subtotal da linha (`itemSubtotal = (materiais * qty) + laborCost`), enquanto o frontend calcula `totalLaborCost` multiplicando `laborCost * qty`. Se um item tiver quantidade 3 e mão de obra de R$ 100,00, a tela indica R$ 300,00 de serviço, mas o PDF e o banco cobram apenas R$ 100,00.
* **Solução Recomendada:** Alinhar o modelo matemático: se a mão de obra for unitária, aplicar `itemSubtotal = (itemMaterialsSubtotal.add(itemLaborCost)).multiply(BigDecimal.valueOf(itemQty))` e atualizar o acumulador do PDF comercial.

---

### BUG-024: Quebra de Clipboard em HTTP e Falta de Link WhatsApp
* **Arquivos Afetados:**
  - [`BudgetDetailActions.tsx`](file:///c:/Users/J%C3%BAlio%20Kennedy/Documents/alumigest/frontend/src/features/budgets/components/BudgetDetailActions.tsx#L37-L52)
  - [`BudgetDetailPage.tsx`](file:///c:/Users/J%C3%BAlio%20Kennedy/Documents/alumigest/frontend/src/pages/BudgetDetailPage.tsx)
* **Diagnóstico Técnico:**
  `navigator.clipboard` é restrito a HTTPS e `localhost`. Em ambiente de oficina/rede local (`http://192.168.x.x`), o objeto é `undefined` e causa exceção não tratada capturada pelo catch genérico. Além disso, a sub-tarefa US-10.10 especificava expressamente o link WhatsApp (`https://api.whatsapp.com/send?text=...`), ausente na interface.
* **Solução Recomendada:** Implementar fallback com elemento `<textarea>` temporário e `document.execCommand('copy')`, além de adicionar botão/link para abertura direta da URL do WhatsApp com `encodeURIComponent(text)`.

---

### BUG-025: Cálculo Incorreto de Dias de Validade no PDF Comercial
* **Arquivos Afetados:**
  - [`BudgetPdfService.java`](file:///c:/Users/J%C3%BAlio%20Kennedy/Documents/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java#L604-L617)
* **Diagnóstico Técnico:**
  O uso de `Duration.between().toDays()` sobre datas de calendário com horários próximos resulta em `0` dias. O fallback `if (diasValidade <= 0) diasValidade = 15;` sobrescreve prazos legítimos de 1 ou 2 dias para 15 dias.
* **Solução Recomendada:** Calcular a diferença entre `LocalDate` usando `ChronoUnit.DAYS.between(createdAt.toLocalDate(), validUntil.toLocalDate())`.

---

### BUG-026: Razão Social Hardcodada no WhatsApp
* **Arquivos Afetados:**
  - [`BudgetPdfService.java`](file:///c:/Users/J%C3%BAlio%20Kennedy/Documents/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java#L231)
* **Diagnóstico Técnico:**
  A string `_Alumiportas - Vidraçaria e Esquadrias_` está literal no código, ignorando a propriedade configurada em `CompanyProperties`.
* **Solução Recomendada:** Utilizar `companyProps.getRazaoSocial()` com fallback dinâmico.

---

### BUG-027: Falta de Extração de Erro em Respostas Blob
* **Arquivos Afetados:**
  - [`budgetsApi.ts`](file:///c:/Users/J%C3%BAlio%20Kennedy/Documents/alumigest/frontend/src/features/budgets/services/budgetsApi.ts#L351-L366)
  - [`BudgetDetailActions.tsx`](file:///c:/Users/J%C3%BAlio%20Kennedy/Documents/alumigest/frontend/src/features/budgets/components/BudgetDetailActions.tsx#L24-L35)
* **Diagnóstico Técnico:**
  Requisições com `responseType: 'blob'` retornam o payload de erro como `Blob`. Sem deserializar o texto, o toast exibe mensagem genérica e não informa, por exemplo, que o orçamento não pode ser baixado porque está com status `CANCELLED`.
* **Solução Recomendada:** Converter `error.response.data` de Blob para JSON (`await error.response.data.text()`) e repassar a mensagem real para o toast.

---

## 4. 🧭 Orientações ao Scrum Master para Gestão das Correções

1. **Priorização no Backlog:**
   - **Sprint Atual (Sprint 05):** O **BUG-023** e o **BUG-025** devem ser priorizados imediatamente para não comprometer a homologação comercial da Release 1.
   - **Melhorias de Usabilidade:** **BUG-024**, **BUG-026** e **BUG-027** podem ser distribuídos como tarefas de refinamento contínuo da US-10.
2. **Atualização da Governança:**
   - Todos os bugs já foram integrados ao catálogo mestre [`RBD-Registro_de_Bugs_e_Defeitos.md`](../RBD-Registro_de_Bugs_e_Defeitos.md).
   - Ao abrir issues individuais no GitHub, utilize o template padronizado em [`.github/ISSUE_TEMPLATE/bug_report.yml`](../../../../.github/ISSUE_TEMPLATE/bug_report.yml).

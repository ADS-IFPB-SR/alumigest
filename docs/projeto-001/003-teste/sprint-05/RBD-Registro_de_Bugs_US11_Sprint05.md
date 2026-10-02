# 🐞 RBD — Registro de Bugs e Defeitos da US-11 — Sprint 05

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçarias e Serralherias de Alumínio |
| **Documento** | Relatório de Registro de Bugs e Não-Conformidades da Sprint 05 (US-11) |
| **User Story** | [US-11: Emitir Orçamento em PDF - Via Técnica de Oficina (Sigilo Comercial)](https://github.com/ADS-IFPB-SR/alumigest/issues/135) |
| **Scrum Master** | Júlio Kennedy dos Santos Silva |
| **Equipe Técnica** | Equipe de Engenharia e QA AlumiGest |
| **Data de Emissão** | 01/10/2026 |
| **Status Geral** | 🟡 4 Defeitos Catalogados para Triagem e Correção no Kanban |
| **Documento Central** | [`RBD-Registro_de_Bugs_e_Defeitos.md`](../RBD-Registro_de_Bugs_e_Defeitos.md) (v2.7.0) |

---

## 1. 🎯 Objetivo e Contexto da Sprint 05

Este documento consolida o levantamento detalhado de bugs potenciais, fragilidades de contrato, inconsistências de tradução/I18N e riscos de runtime identificados no escopo da **US-11 (Emissão de Orçamento em PDF — Via Técnica de Oficina sob Sigilo Comercial)** durante os testes de homologação da **Sprint 05**.

Conforme as diretrizes da **Metodologia IMPROS** e do **Plano de Gerência de Configuração (PGC)**:
1. Este registro desdobra as não-conformidades técnicas sob responsabilidade do **Scrum Master** (**Júlio Kennedy dos Santos Silva**).
2. Fornece cartões prontos para inclusão na coluna de **Bugs / Débito Técnico** do quadro **Kanban da Sprint**.
3. Visa assegurar a robustez da **Release 1 (v1.0.0)** e a integridade fabril das ordens de corte e usinagem.

---

## 2. 📊 Matriz de Bugs e Fragilidades da US-11

| ID | Issue GitHub | Título Resumido | Componente / Camada | Severidade | Impacto no Usuário / Chão de Fábrica | Status |
|:---:|:---:|:---|:---:|:---:|:---|:---:|
| **[BUG-034](../RBD-Registro_de_Bugs_e_Defeitos.md#bug-034)** | [#383](https://github.com/ADS-IFPB-SR/alumigest/issues/383) | Risco de `NullPointerException` (HTTP 500) por Unboxing de `BudgetItem.quantity` Nulo no Card de Produção | Backend / PDF (`BudgetPdfService.java`) | 🔴 Alta (P2) | Se um item tiver quantidade nula no banco, a emissão do PDF técnico falha com crash 500 para todo o orçamento. | 🟡 Aberto |
| **[BUG-035](../RBD-Registro_de_Bugs_e_Defeitos.md#bug-035)** | [#384](https://github.com/ADS-IFPB-SR/alumigest/issues/384) | Impressão de `"• Tipo: NONE"` e Contradição Visual de Puxador quando Esquadria Não Possui Puxador | Backend / PDF (`BudgetPdfService.java`) | 🟡 Média (P3) | Esquadria sem puxador/ferragem exibe termo em inglês no PDF ou fallback falso afirmando ter puxador no lado de abertura. | 🟡 Aberto |
| **[BUG-036](../RBD-Registro_de_Bugs_e_Defeitos.md#bug-036)** | [#385](https://github.com/ADS-IFPB-SR/alumigest/issues/385) | Resposta de Erro Empacotada como Blob sem Tratamento de Mensagem em `downloadPdfTecnico` | Frontend / API & Hooks (`budgetsApi.ts`, `useBudgets.ts`) | 🟡 Média (P3) | Ao falhar (ex: HTTP 422 por orçamento cancelado), o toast exibe texto genérico mascarando o motivo real da regra de negócio. | 🟡 Aberto |
| **[BUG-037](../RBD-Registro_de_Bugs_e_Defeitos.md#bug-037)** | [#386](https://github.com/ADS-IFPB-SR/alumigest/issues/386) | Ausência do Alias de Rota `/technical-pdf` Documentado na Especificação da Tarefa US-11.2 | Backend / Controller (`BudgetController.java`) | 🟢 Baixa (P4) | Requisições para o endpoint canônico `/api/budgets/{id}/technical-pdf` falham com HTTP 404 Not Found. | 🟡 Aberto |

---

## 3. 🔍 Detalhamento Técnico das Não-Conformidades

### BUG-034: Risco de NPE em `BudgetPdfService.adicionarCardClienteProducao`
* **Arquivos Afetados:**
  - [`BudgetPdfService.java`](file:///c:/Users/Júlio%20Kennedy/Documents/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java#L975-L978)
* **Diagnóstico Técnico:**
  Na linha 976, o código executa:
  ```java
  int totalPecas = budget.getItems() != null
          ? budget.getItems().stream().mapToInt(BudgetItem::getQuantity).sum()
          : 0;
  ```
  O campo `quantity` da entidade `BudgetItem` é do tipo `Integer` (objeto nullable). O método `mapToInt` realiza unboxing implícito para o tipo primitivo `int`. Caso algum item possua `quantity == null`, a JVM dispara uma `NullPointerException` não tratada, abortando a geração do PDF técnico com erro HTTP 500. Na linha 1079 (`criarCelulaItemSeq`), a checagem defensiva `item.getQuantity() != null ? item.getQuantity() : 1` foi implementada, demonstrando a necessidade da mesma proteção no cabeçalho fabril.
* **Solução Recomendada:**
  Aplicar operador ternário defensivo na agregação:
  ```java
  int totalPecas = budget.getItems() != null
          ? budget.getItems().stream().mapToInt(i -> i.getQuantity() != null ? i.getQuantity() : 1).sum()
          : 0;
  ```

---

### BUG-035: Inconsistência de Tradução e Fallback de Puxador Inexistente no PDF Técnico
* **Arquivos Afetados:**
  - [`BudgetPdfService.java`](file:///c:/Users/Júlio%20Kennedy/Documents/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java#L1502-L1535)
* **Diagnóstico Técnico:**
  1. Quando `handleConfig` contém `{"handleType":"NONE"}`, o método `adicionarTipoPuxador` invoca `traduzirTipoPuxadorTexto("NONE")`, que retorna `null`. O código executa `linhas.add("Tipo: " + (tipoTraduzido != null ? tipoTraduzido : tipo.replace('_', ' ')))`, gerando a linha `"• Tipo: NONE"` no PDF com termo em inglês não traduzido.
  2. Quando `handleConfig` é `"NONE"` ou `"{}"` (esquadria sem ferragem/puxador, conforme Issue #335), `extrairLinhasPuxadorJson` retorna uma lista vazia. Como `linhas.isEmpty()` é verdadeiro, o método invoca `obterLinhasPuxadorFallback`, gerando as linhas:
     `"• Formato: Padrão do modelo."` e `"• Posição: Lado de abertura."`.
  Isso gera uma contradição flagrante com o esquema técnico vetorial (CAD), que exibe a folha limpa sem puxador, induzindo o serralheiro a erro na oficina.
* **Solução Recomendada:**
  Em `gerarLinhasPuxador`, se `handleConfig` for nulo, vazio, `"NONE"` ou `{"handleType":"NONE"}`, retornar deterministicamente:
  ```java
  return List.of("Sem puxador previsto.");
  ```

---

### BUG-036: Resposta de Erro Blob sem Tratamento de Mensagem em `downloadPdfTecnico`
* **Arquivos Afetados:**
  - [`budgetsApi.ts`](file:///c:/Users/Júlio%20Kennedy/Documents/alumigest/frontend/src/features/budgets/services/budgetsApi.ts#L427-L447)
  - [`useBudgets.ts`](file:///c:/Users/Júlio%20Kennedy/Documents/alumigest/frontend/src/features/budgets/hooks/useBudgets.ts#L139-L152)
  - [`BudgetDetailActions.tsx`](file:///c:/Users/Júlio%20Kennedy/Documents/alumigest/frontend/src/features/budgets/components/BudgetDetailActions.tsx#L150-L165)
* **Diagnóstico Técnico:**
  O método `downloadPdfTecnico` utiliza `responseType: 'blob'`. Quando a chamada falha (ex.: HTTP 422 por orçamento com status `CANCELLED`), o payload JSON da exceção (`ErrorResponse`) é retornado empacotado como um objeto `Blob`. No hook `useDownloadPdfTecnico`, o handler tenta acessar `err?.response?.data?.message`, que resulta em `undefined`. O usuário recebe apenas o toast genérico `"Erro ao gerar o PDF técnico."`, sem ter ciência do bloqueio comercial.
* **Solução Recomendada:**
  Desserializar o `Blob` no tratamento do erro:
  ```typescript
  if (err?.response?.data instanceof Blob) {
    try {
      const errorJson = JSON.parse(await err.response.data.text());
      if (errorJson.message) message = errorJson.message;
    } catch { /* fallback */ }
  }
  ```

---

### BUG-037: Ausência do Endpoint `/technical-pdf` Mapeado no `BudgetController`
* **Arquivos Afetados:**
  - [`BudgetController.java`](file:///c:/Users/Júlio%20Kennedy/Documents/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/controller/BudgetController.java#L171)
* **Diagnóstico Técnico:**
  A especificação da sub-tarefa **US-11.2** define explicitamente o path `/api/budgets/{id}/technical-pdf`. No entanto, o controller mapeou estritamente `@GetMapping("/{id}/pdf/tecnico")`. Sistemas clientes, testes automatizados e integrações que adotam o padrão REST em inglês recebem `404 Not Found`.
* **Solução Recomendada:**
  Adicionar a rota alternativa como alias no controller:
  ```java
  @GetMapping({"/{id}/pdf/tecnico", "/{id}/technical-pdf"})
  ```

---

## 4. 📋 Cartões Formatados para o Quadro Kanban (Coluna Bugs / Débito Técnico)

Abaixo estão os cartões estruturados no padrão de issues do projeto, prontos para cadastro no GitHub Projects e inclusão no Kanban de desenvolvimento.

---

### 🎴 Card 1: `[BUG-034]` Prevenção de NPE por Quantidade Nula no Card Fabril do PDF Técnico
```markdown
# [BUG-034] Prevenção de NPE por quantidade nula no cabeçalho do PDF técnico

## 📌 Metadados
- **ID**: `BUG-034`
- **US Pai**: `US-11: Emitir Orçamento em PDF - Via Técnica de Oficina`
- **Componente**: `backend` (PDF Service)
- **Severidade**: `🔴 P2 - Alta`
- **Arquivo**: `backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java`

## 🎯 Descrição
Na geração do PDF técnico (`gerarPdfTecnico`), a chamada `budget.getItems().stream().mapToInt(BudgetItem::getQuantity).sum()` não realiza verificação defensiva contra valores nulos. Se qualquer item contiver `quantity == null`, o unboxing implícito dispara `NullPointerException` (HTTP 500).

## 🧪 Critérios de Aceitação
- [ ] Tratar `getQuantity()` nulo com fallback defensivo para `1` na contagem total de peças.
- [ ] Criar teste unitário em `BudgetPdfServiceTest` gerando PDF técnico com item contendo `quantity = null`.
- [ ] Build Maven e testes 100% aprovados.
```

---

### 🎴 Card 2: `[BUG-035]` Correção de "• Tipo: NONE" e Fallback de Puxador Inexistente na Ficha Técnica
```markdown
# [BUG-035] Correção de "• Tipo: NONE" e fallback de puxador inexistente na Ficha Técnica

## 📌 Metadados
- **ID**: `BUG-035`
- **US Pai**: `US-11: Emitir Orçamento em PDF - Via Técnica de Oficina`
- **Componente**: `backend` (PDF Service / I18N)
- **Severidade**: `🟡 P3 - Média`
- **Arquivo**: `backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java`

## 🎯 Descrição
Ao gerar o PDF técnico para uma esquadria sem ferragem/puxador (`handleConfig = "NONE"` ou `{"handleType":"NONE"}`):
1. O texto do puxador exibe o termo em inglês `"• Tipo: NONE"`.
2. Em casos de configuração vazia, o fallback padrão injeta `"Formato: Padrão do modelo."` e `"Posição: Lado de abertura."`, contradizendo o desenho esquemático CAD que está sem puxador.

## 🧪 Critérios de Aceitação
- [ ] Retornar `"• Sem puxador previsto."` quando a esquadria não possuir puxador configurado.
- [ ] Eliminar qualquer exibição literal de termos em inglês (`NONE`).
- [ ] Criar teste unitário em `BudgetPdfServiceTest` validando a saída textual para esquadrias sem puxador.
```

---

### 🎴 Card 3: `[BUG-036]` Tratamento de erro Blob em downloadPdfTecnico no Frontend
```markdown
# [BUG-036] Tratamento de erro Blob em downloadPdfTecnico no Frontend

## 📌 Metadados
- **ID**: `BUG-036`
- **US Pai**: `US-11: Emitir Orçamento em PDF - Via Técnica de Oficina`
- **Componente**: `frontend` (API & Hooks)
- **Severidade**: `🟡 P3 - Média`
- **Arquivos**: `frontend/src/features/budgets/services/budgetsApi.ts`, `useBudgets.ts`

## 🎯 Descrição
A requisição de download da Via Técnica usa `responseType: 'blob'`. Em caso de erro HTTP (ex: 422 ao tentar baixar PDF de orçamento cancelado), o payload `ErrorResponse` em JSON é entregue como `Blob`. Sem deserializar o texto do blob, o toast exibe mensagem genérica, impedindo o usuário de entender o motivo do bloqueio.

## 🧪 Critérios de Aceitação
- [ ] Implementar extração assíncrona do payload de erro (`await error.response.data.text()`).
- [ ] Repassar a mensagem específica da API para o toast de erro.
- [ ] Criar teste unitário em `useBudgets.test.tsx` simulando erro 422 em resposta Blob.
```

---

### 🎴 Card 4: `[BUG-037]` Adicionar alias de rota /technical-pdf no BudgetController
```markdown
# [BUG-037] Adicionar alias de rota /technical-pdf no BudgetController

## 📌 Metadados
- **ID**: `BUG-037`
- **US Pai**: `US-11: Emitir Orçamento em PDF - Via Técnica de Oficina`
- **Componente**: `backend` (Controller)
- **Severidade**: `🟢 P4 - Baixa`
- **Arquivo**: `backend/src/main/java/br/edu/ifpb/alumigest/budgets/controller/BudgetController.java`

## 🎯 Descrição
A especificação da tarefa US-11.2 previa o endpoint `GET /api/budgets/{id}/technical-pdf`. O controller expôs apenas `/{id}/pdf/tecnico`. Clientes ou testes que utilizam a rota canônica em inglês recebem 404.

## 🧪 Critérios de Aceitação
- [ ] Mapear `@GetMapping({"/{id}/pdf/tecnico", "/{id}/technical-pdf"})`.
- [ ] Adicionar teste de integração no `BudgetControllerIntegrationTest` validando 200 OK na rota `/technical-pdf`.
- [ ] Atualizar anotações OpenAPI/Swagger se necessário.
```

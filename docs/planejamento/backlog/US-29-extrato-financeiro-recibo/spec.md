# Especificação Funcional: US-29 — Emitir Extrato Financeiro do Cliente e Recibo de Quitação

**Identificador**: `US-29`  
**Issue GitHub**: [#154](https://github.com/ADS-IFPB-SR/alumigest/issues/154)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como operador financeiro ou vendedor da Alumiportas, desejo consultar e emitir o extrato financeiro consolidado de um cliente (total faturado, total quitado, saldo devedor e débitos em aberto) e gerar recibos oficiais de quitação em PDF A4 padronizado, oferecendo comprovação documental idônea aos clientes e agilidade nas conciliações de pagamento.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Consulta do Extrato Financeiro Consolidado do Cliente**
  - **Dado que** o operador seleciona um cliente no painel financeiro ou ficha de cadastro,
  - **Quando** acessa a aba "Extrato Financeiro",
  - **Então** o sistema exibe o card resumo com:
    - `totalInvoiced` (Total Faturado em Pedidos / O.S.)
    - `totalPaid` (Total Efetivamente Pago)
    - `outstandingBalance` (Saldo Devedor em Aberto)
    - `hasOverdueDebt` (Indicador de Inadimplência: `true`/`false`)
  - **E** exibe a linha do tempo cronológica com todas as cobranças, liquidações e métodos utilizados.

- [ ] **Cenário 2: Alerta Visual de Inadimplência no Extrato**
  - **Dado que** o cliente possui uma ou mais parcelas com status `OVERDUE`,
  - **Quando** o operador visualiza o extrato,
  - **Então** o sistema destaca um banner de alerta vermelho indicando "Cliente com Títulos em Atraso",
  - **E** lista em destaque os títulos vencidos com cálculo dos juros/atraso e botão rápido de cobrança/renegociação.

- [ ] **Cenário 3: Emissão de Recibo Oficial de Quitação em PDF A4**
  - **Dado que** uma parcela ou pedido foi liquidado com sucesso (`status = PAID`),
  - **Quando** o operador clica no botão "Gerar Recibo em PDF",
  - **Então** o backend processa o documento via `ReceiptPdfService` e retorna stream de bytes (`application/pdf`),
  - **E** o documento A4 gerado contém o cabeçalho institucional da Alumiportas (CNPJ, endereço, telefone), identificação do pagador, número sequencial do recibo (`REC-YYYY-NNNNNN`), valor por extenso, código da O.S., método de pagamento e hash de autenticidade no rodapé.

- [ ] **Cenário 4: Geração de Recibo Parcial para Adiantamentos**
  - **Dado que** o cliente realizou um pagamento parcial ou entrada (`InstallmentType = DOWN_PAYMENT`),
  - **Quando** o operador solicita o recibo correspondente,
  - **Então** o documento discrimina textualmente que se refere a quitação parcial ou sinal de pedido, indicando o saldo restante remanescente.

- [ ] **Cenário 5: Download Direto e Pré-visualização no Navegador**
  - **Dado que** o PDF foi gerado pelo serviço,
  - **Quando** o usuário clica em "Visualizar Recibo",
  - **Então** o frontend abre modal com preview do PDF embutido (iframe/blob URL) com opções de "Imprimir" e "Baixar Arquivo".

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Condição para Emissão de Recibo):** Somente transações ou parcelas com pagamento confirmado (`paidAmount > 0`) podem gerar recibo de quitação.
- **RN-02 (Autenticidade e Imutabilidade):** O recibo gerado deve conter código de autenticidade SHA-256 gerado a partir do ID da transação, data, valor e chave de segurança da aplicação.
- **RN-03 (Diretriz de Idioma em Variáveis):** Entidades, DTOs e serviços com terminologia em inglês: `ClientFinancialStatementResponse`, `totalInvoiced`, `totalPaid`, `outstandingBalance`, `hasOverdueDebt`, `receiptCode`, `issuedAt`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / iText ou OpenPDF / PostgreSQL)
- **Endpoints:**
  - `GET /api/v1/finance/receivables/client/{clientId}/statement` (extrato consolidado do cliente)
  - `GET /api/v1/finance/receivables/{id}/receipt-pdf` (geração e download do recibo em PDF)
- **Serviço:** `ReceiptPdfService.java` com template A4 estilizado.

### Frontend (React 19 / TanStack Query / Tailwind)
- **Componentes:**
  - `ClientFinancialStatementCard.tsx` (card consolidado com métricas financeiras do cliente)
  - `ClientFinancialStatementTimeline.tsx` (tabela e linha do tempo de transações)
  - `ReceiptViewerModal.tsx` (modal com preview de PDF)

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `ReceiptPdfServiceTest` validando geração correta de PDF sem bytes corrompidos e presença de elementos obrigatórios.
- [ ] Teste de integração do endpoint do extrato validando precisão dos cálculos de saldo devedor e indicador de inadimplência.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (9 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-29.1](issues/US-29.1-criar-record-clientfinancialstatementresponse/issue.md) | Criar record `ClientFinancialStatementResponse` (`totalInvoiced`, `totalPaid`, `outstandingBalance`, `hasOverdueDebt`) | 🔲 No Backlog |
| [US-29.2](issues/US-29.2-implementar-metodo-obterextratocliente-long-c/issue.md) | Implementar método `obterExtratoCliente(Long clientId)` no `AccountReceivableService` | 🔲 No Backlog |
| [US-29.3](issues/US-29.3-criar-servico-receiptpdfservice-gerando-recib/issue.md) | Criar serviço `ReceiptPdfService` gerando Recibo de Quitação em PDF A4 institucional | 🔲 No Backlog |
| [US-29.4](issues/US-29.4-adicionar-endpoints-get-api-finance-receivabl/issue.md) | Adicionar endpoints GET `/api/v1/finance/receivables/client/{clientId}/statement` e `/api/v1/finance/receivables/{id}/receipt-pdf` | 🔲 No Backlog |
| [US-29.5](issues/US-29.5-criar-teste-unitario-do-receiptpdfservicetest/issue.md) | Criar teste unitário do `ReceiptPdfServiceTest` | 🔲 No Backlog |
| [US-29.6](issues/US-29.6-criar-componente-clientfinancialstatementcard/issue.md) | Criar componente `ClientFinancialStatementCard` no frontend | 🔲 No Backlog |
| [US-29.7](issues/US-29.7-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | 🔲 No Backlog |
| [US-29.8](issues/US-29.8-adicionar-atalho-contas-a-receber-no-submenu-/issue.md) | Adicionar atalho "Extrato e Contas a Receber" no submenu Financeiro do frontend | 🔲 No Backlog |
| [US-29.9](issues/US-29.9-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste documental da release | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-29-extrato-financeiro-recibo`

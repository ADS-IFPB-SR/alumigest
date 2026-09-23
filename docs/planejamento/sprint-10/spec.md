# Feature Specification: Sprint 10 — Contas a Receber, Gestão de Sinais/Entradas (50%) e Parcelamento

**Feature**: `007-contas-receber-parcelamento`  
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão  
**Created**: 2026-08-27  
**Updated**: 2026-09-23  
**Status**: APPROVED (Esclarecimentos Resolvidos — Padrão BDD Gherkin)  

---

## 1. Visão Geral & Contexto de Negócio

No modelo operacional da Alumiportas, a grande maioria dos contratos de esquadrias e vidros envolve divisão de pagamentos: **50% de Sinal de Entrada** (para compra de matéria-prima) e **50% de Saldo na Entrega/Instalação**, ou parcelamento no cartão/boleto em até 12x.

Atualmente, o controle de quais clientes já pagaram o sinal e quais estão com saldo devedor pendente na entrega é feito em cadernos ou planilhas desconectadas.

Esta sprint entrega:
1. **Geração Automática do Plano de Contas a Receber**: Desdobramento inteligente do valor do pedido em títulos a receber (`AccountReceivable`), com centavos residuais na 1ª parcela e permissão de edição manual de datas/valores.
2. **Gestão de Sinais de Entrada (50%) e Saldos**: Acompanhamento dinâmico dos status (`A_VENCER`, `VENCIDO`, `PAGO_PARCIAL`, `PAGO`, `CANCELADO`).
3. **Painel Financeiro de Contas a Receber**: Visão consolidada por período de vencimento com alertas visuais de inadimplência.
4. **Posição Financeira do Cliente & Recibos em PDF**: Extrato de débitos e emissão de recibos oficiais de quitação via OpenPDF.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-27: Desdobrar e Gerenciar Parcelamento de Pedidos

#### 🎯 Objetivo de Negócio
> **Como** vendedor e operador financeiro da Alumiportas,  
> **Desejo** desdobrar automaticamente o valor líquido de um pedido de venda aprovado em títulos de contas a receber conforme as condições comerciais pactuadas (ex: 50% de entrada + 50% na instalação, ou parcelamento em até 12x), com ajuste livre de datas e valores,  
> **Para que** o contas a receber seja alimentado com precisão e controle dos vencimentos sem discrepâncias de centavos.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Desdobramento automático padrão (Entrada 50% + Saldo 50%)**
  - **Dado que** o pedido "PED-2026-0020" possui valor líquido total de R$ 5.000,00
  - **Quando** o plano de contas a receber é gerado com a condição padrão "50% Sinal + 50% Entrega"
  - **Então** o sistema cria 2 títulos em `account_receivables`:
    - Parcela 1/2 (Sinal): Valor de R$ 2.500,00, vencimento imediato (`data_atual`)
    - Parcela 2/2 (Saldo): Valor de R$ 2.500,00, vencimento vinculado à `data_previsao_entrega` do pedido
  - **E** ambos iniciam com status `A_VENCER`.

- [ ] **Cenário 2: Rateio com resto de centavos na 1ª parcela (Divisão ímpar)**
  - **Dado que** um pedido possui valor total de R$ 1.000,00 parcelado em 3 vezes
  - **Quando** o serviço `InstallmentCalculator` efetua a divisão
  - **Então** a parcela 1/3 recebe o valor de R$ 333,34
  - **E** as parcelas 2/3 e 3/3 recebem o valor de R$ 333,33 cada
  - **E** a soma total das 3 parcelas totaliza exatamente R$ 1.000,00.

- [ ] **Cenário 3: Customização manual de parcelas com validação de soma exata**
  - **Dado que** o operador ajusta manualmente os valores ou prazos das parcelas através de `InstallmentPlanCustomRequest`
  - **Quando** a soma de todos os valores informados é exatamente igual ao `valor_liquido` do pedido
  - **Então** o sistema grava o novo plano de parcelas substituindo a projeção anterior com sucesso (`200 OK`).

- [ ] **Cenário 4: Rejeição de plano com soma divergente do valor do pedido**
  - **Dado que** o operador tenta submeter um plano onde a soma das parcelas (R$ 4.990,00) difere do valor total do pedido (R$ 5.000,00)
  - **Quando** a requisição for processada pelo backend
  - **Então** o sistema rejeita a operação com status HTTP `422 Unprocessable Entity`
  - **E** retorna a mensagem: "A soma das parcelas (R$ 4.990,00) deve ser exatamente igual ao valor do pedido (R$ 5.000,00). Diferença: R$ 10,00".

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Rateio de Centavos na 1ª Parcela)**: Em divisões com dízimas periódicas ou sobras de centavos, o centavo residual deve ser compulsoriamente atribuído à primeira parcela (Entrada/Sinal).
- **RN-02 (Fechamento Estrito de Centavos)**: Em nenhuma hipótese o sistema aceita plano de parcelas cuja soma divirja em centavos do valor total do pedido.
- **RN-03 (Proteção contra Alteração de Parcelas Já Quitadas)**: Se uma ou mais parcelas já tiverem sido baixadas/quitadas, o plano não pode ser regerado integralmente, permitindo-se apenas renegociar parcelas em aberto.

#### 🔌 Especificação Técnica
- **Backend**:
  - `InstallmentCalculator`: Utilitário matemático operando com `BigDecimal` e `RoundingMode.DOWN` com aplicação de restos na primeira posição.
  - `AccountReceivable`: Entidade JPA com campos `order`, `numeroParcela`, `totalParcelas`, `valorOriginal`, `valorPago`, `dataVencimento`, `dataPagamento`, `status`.
  - `AccountReceivableController`: Endpoint `POST /api/finance/receivables/order/{orderId}/generate`.
  - Testes com JUnit 5 cobrindo divisões por 3, 6, 7, 12 e checagem de soma.
- **Frontend**:
  - Formulário interativo para conferência e edição de parcelas com cálculo dinâmico de soma e aviso em tempo real se houver diferença em centavos.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-27.1**: Criar migration Flyway `backend/src/main/resources/db/migration/V13__create_account_receivables_schema.sql` com tabela `account_receivables`
- **US-27.2**: Criar enums `ReceivableStatus` (A_VENCER, VENCIDO, PAGO_PARCIAL, PAGO, CANCELADO) e `InstallmentType` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/`
- **US-27.3**: Criar entidade JPA `AccountReceivable` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/AccountReceivable.java`
- **US-27.4**: Criar repositório `AccountReceivableRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/AccountReceivableRepository.java`
- **US-27.5**: Criar serviço utilitário `InstallmentCalculator` com algoritmo de rateio com resto na 1ª parcela em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/InstallmentCalculator.java`
- **US-27.6**: Criar record `AccountReceivableResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/AccountReceivableResponse.java`
- **US-27.7**: Criar record `InstallmentPlanCustomRequest` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/InstallmentPlanCustomRequest.java`
- **US-27.8**: Criar mapper MapStruct `AccountReceivableMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/mapper/AccountReceivableMapper.java`
- **US-27.9**: Implementar serviço `AccountReceivableService.gerarPlanoParcelas(Long orderId, InstallmentPlanCustomRequest customRequest)` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/AccountReceivableService.java`
- **US-27.10**: Criar endpoint `POST /api/finance/receivables/order/{orderId}/generate` no `AccountReceivableController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/AccountReceivableController.java`
- **US-27.11**: Criar testes unitários do `InstallmentCalculatorTest` e `AccountReceivableServiceTest`

---

### 📌 US-28: Controlar Contas a Receber, Vencimentos e Inadimplência

#### 🎯 Objetivo de Negócio
> **Como** gerente financeiro da Alumiportas,  
> **Desejo** consultar um painel completo de contas a receber com listagem de títulos a vencer, vencidos e recebidos, com filtros avançados e identificação visual de clientes em mora,  
> **Para que** eu possa planejar o fluxo de recebimentos, cobrar clientes inadimplentes e manter a saúde financeira da vidraçaria sob controle.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Listagem consolidada de contas a receber com cálculo dinâmico de vencimento**
  - **Dado que** existem títulos registrados no contas a receber
  - **Quando** o usuário acessa `/financeiro/contas-a-receber`
  - **Então** o sistema lista as parcelas de forma paginada e ordenada por data de vencimento
  - **E** para qualquer título com `data_vencimento < LocalDate.now()` e que não esteja quitado, o sistema exibe dinamicamente o status `VENCIDO` com os dias de atraso decorridos.

- [ ] **Cenário 2: Alerta visual de inadimplência em telas do sistema**
  - **Dado que** um cliente possui uma ou mais parcelas com status `VENCIDO`
  - **Quando** o vendedor visualiza a ficha desse cliente ou tenta criar um novo orçamento para ele
  - **Então** o sistema exibe um banner de aviso visual em destaque vermelho: "Atenção: Cliente possui R$ X em títulos vencidos"
  - **E** a operação não é bloqueada, mantendo a autonomia do vendedor (aviso não-impeditivo).

- [ ] **Cenário 3: Resumo financeiro consolidado nos cards do topo da página**
  - **Dado que** a listagem de contas a receber é carregada
  - **Quando** o painel renderiza os KPIs
  - **Então** apresenta cartões com:
    1. Total a Vencer no mês
    2. Total Vencido / Em Atraso (Inadimplência)
    3. Total Recebido no período selecionado
    4. Taxa percentual de inadimplência sobre a carteira.

- [ ] **Cenário 4: Filtros avançados por cliente, status e intervalo de datas**
  - **Dado que** o gestor deseja visualizar apenas os títulos vencidos do último trimestre
  - **Quando** ele seleciona status "VENCIDO" e o intervalo de datas nos filtros
  - **Então** a tabela é atualizada instantaneamente refletindo apenas as parcelas correspondentes.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Transição Dinâmica de Status)**: Títulos com `status == A_VENCER` cuja data de vencimento seja anterior ao dia de hoje devem ser interpretados e apresentados como `VENCIDO` em todas as consultas e relatórios.
- **RN-02 (Aviso Não Bloqueante)**: A inadimplência notifica o operador de forma clara, mas não bloqueia a criação de propostas, respeitando negociações pontuais de crédito aprovadas pela gerência.
- **RN-03 (Precisão Financeira)**: Todos os totais somados na listagem e KPIs devem garantir consistência exata com o banco de dados.

#### 🔌 Especificação Técnica
- **Backend**:
  - `AccountReceivableService.listar(Pageable, ...)`: Consulta com Spring Data JPA Specifications.
  - `AccountReceivableController`: Endpoint `GET /api/finance/receivables`.
- **Frontend**:
  - `ReceivablesPage.tsx`: Página estruturada com cards de métricas e filtros.
  - `ReceivablesTable.tsx`: Tabela estilizada em Tailwind CSS com paginação e badges coloridos de status (`A_VENCER` azul, `VENCIDO` vermelho, `PAGO` verde).

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-28.1**: Implementar método `listar(Pageable, status, clienteId, dataInicio, dataFim, busca)` no `AccountReceivableService` com atualização dinâmica de status `VENCIDO`
- **US-28.2**: Criar endpoint `GET /api/finance/receivables` no `AccountReceivableController`
- **US-28.3**: Criar interfaces TypeScript e serviço Axios (`receivablesApi.ts`) em `frontend/src/features/finance/services/receivablesApi.ts`
- **US-28.4**: Criar componente `ReceivablesTable` com badges de alerta de vencimento em `frontend/src/features/finance/components/ReceivablesTable.tsx`
- **US-28.5**: Criar página `ReceivablesPage` e registrar rota `/financeiro/contas-a-receber` no React Router

---

### 📌 US-29: Emitir Extrato Financeiro do Cliente e Recibo de Quitação

#### 🎯 Objetivo de Negócio
> **Como** cliente e operador financeiro da Alumiportas,  
> **Desejo** consultar a posição financeira consolidada do cliente e emitir recibos oficiais de quitação total ou parcial em PDF,  
> **Para que** o cliente tenha um comprovante documental formal de pagamento assinado e a empresa mantenha a comprovação legal das baixas financeiras.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Consulta do Extrato Financeiro Consolidado do Cliente**
  - **Dado que** o cliente ID `10` possui pedidos faturados e parcelas em diversos status
  - **Quando** o operador solicita o extrato via `GET /api/finance/receivables/client/10/statement`
  - **Então** o sistema retorna status `200 OK` contendo:
    1. Total histórico faturado
    2. Total efetivamente pago
    3. Saldo devedor total em aberto
    4. Quantidade de parcelas vencidas e indicador booleano `possuiInadimplencia`
    5. Lista detalhada de todos os títulos agrupados por pedido.

- [ ] **Cenário 2: Emissão do Recibo de Quitação em PDF para parcela quitada**
  - **Dado que** a parcela ID `5` está com status `PAGO`
  - **Quando** o operador clica em "Emitir Recibo" ou requisita `GET /api/finance/receivables/5/receipt-pdf`
  - **Então** o sistema gera um documento PDF formal em formato A4 (`application/pdf`)
  - **E** o recibo contém:
    - Cabeçalho timbrado com dados da Alumiportas (Razão Social, CNPJ, Telefone, Endereço)
    - Número sequencial do recibo e código do pedido
    - Texto declaratório: "Recebemos de [Nome do Cliente], CPF/CNPJ [...], a importância de R$ [Valor] referente à parcela [N/M]"
    - Forma de pagamento utilizada (ex: PIX, Cartão, Dinheiro) e data da liquidação
    - Linha de assinatura para o responsável financeiro.

- [ ] **Cenário 3: Tentativa de emissão de recibo para parcela em aberto**
  - **Dado que** a parcela ID `8` está com status `A_VENCER` ou `VENCIDO` (não paga)
  - **Quando** é solicitada a emissão de recibo de quitação para esta parcela
  - **Então** o sistema recusa a geração com status HTTP `400 Bad Request`
  - **E** informa que só é possível emitir recibo para parcelas liquidadas.

- [ ] **Cenário 4: Download direto e responsivo no Frontend**
  - **Dado que** o operador está na visualização de títulos de um cliente
  - **Quando** ele clica no botão com ícone de recibo/PDF
  - **Então** o arquivo `recibo-REC-{id}.pdf` é descarregado instantaneamente no navegador com feedback de sucesso via toast.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Quitação Prévia Mandatória)**: Somente títulos com status `PAGO` ou `PAGO_PARCIAL` podem originar recibos de pagamento.
- **RN-02 (Validade Documental do Recibo)**: O documento PDF de recibo emitido é imutável após a data de geração, refletindo os dados fiscais vigentes da transação.
- **RN-03 (Padrão Visual A4)**: O layout do recibo é construído via OpenPDF em página A4 vertical com tipografia institucional e molduras padronizadas.

#### 🔌 Especificação Técnica
- **Backend**:
  - `ReceiptPdfService`: Serviço de montagem do PDF do recibo via OpenPDF.
  - `AccountReceivableService.obterExtratoCliente(Long clienteId)`.
  - `AccountReceivableController`: Endpoints de extrato e download do PDF.
  - Testes unitários do gerador de recibos e regras de quitação.
- **Frontend**:
  - `ClientFinancialStatementCard.tsx`: Card de extrato exibido na ficha do cliente.
  - Ação de emissão de recibo por linha da tabela de títulos.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-29.1**: Criar record `ClientFinancialStatementResponse` (totalFaturado, totalPago, saldoDevedor, possuiInadimplencia) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/ClientFinancialStatementResponse.java`
- **US-29.2**: Implementar método `obterExtratoCliente(Long clienteId)` no `AccountReceivableService`
- **US-29.3**: Criar serviço `ReceiptPdfService` gerando Recibo de Quitação em PDF A4 institucional em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/ReceiptPdfService.java`
- **US-29.4**: Adicionar endpoints `GET /api/finance/receivables/client/{clienteId}/statement` e `GET /api/finance/receivables/{id}/receipt-pdf` no `AccountReceivableController`
- **US-29.5**: Criar teste unitário do `ReceiptPdfServiceTest`
- **US-29.6**: Criar componente `ClientFinancialStatementCard` no frontend
- **US-29.7**: Documentar endpoints no OpenAPI/Swagger
- **US-29.8**: Adicionar atalho "Contas a Receber" no submenu Financeiro do frontend
- **US-29.9**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 10

---

## 3. Matriz de Rastreabilidade

| Requisito | User Story | Sub-tarefa Backend | Sub-tarefa Frontend | Testes Automatizados |
| :--- | :--- | :--- | :--- | :--- |
| Desdobramento de Parcelas | **US-27** | US-27.1 a US-27.10 | — | US-27.11 (`InstallmentCalculatorTest`, `AccountReceivableServiceTest`) |
| Gestão de Contas a Receber | **US-28** | US-28.1, US-28.2 | US-28.3, US-28.4, US-28.5 | `ReceivablesTable.test.tsx`, `AccountReceivableServiceTest` |
| Extrato e Recibo em PDF | **US-29** | US-29.1 a US-29.4 | US-29.6, US-29.8 | US-29.5 (`ReceiptPdfServiceTest`) |
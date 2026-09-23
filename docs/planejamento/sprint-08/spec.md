# Feature Specification: Sprint 8 — Controle de Estoque (Baixas/Reservas Automáticas, Kardex) e Homologação R2

**Feature**: `005-estoque-kardex-homologacao-r2`  
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica  
**Created**: 2026-08-27  
**Updated**: 2026-09-23  
**Status**: APPROVED (Esclarecimentos Resolvidos — Padrão BDD Gherkin)  

---

## 1. Visão Geral & Contexto de Negócio

Com o motor de produção e chão de fábrica operando (Sprints 5, 6 e 7), o AlumiGest fecha o ciclo fabril da **Release 2 (v2.0.0)** integrando a gestão de materiais e estoque:
1. **Controle de Saldos em Tempo Real**: Gestão de estoque físico, reservado e disponível (`disponivel = saldo_fisico - reservado`) para perfis de alumínio (barras/metros), vidros (m²) e ferragens (unidades).
2. **Reserva e Baixa Automática**: Reserva dos materiais na liberação da produção e baixa física definitiva ao concluir o corte da esquadria.
3. **Flexibilidade Operacional**: Saldo insuficiente emite alerta visual amarelo na tela sem travar a produção da oficina.
4. **Registro de Perdas & Sucata**: Registro de quebras e sobras com motivo (manuseio, erro de corte, defeito de fábrica) para auditoria e controle de custos de matéria-prima, com descarte e baixa do estoque.
5. **Homologação da Release 2 (v2.0.0)**: Validação integrada do ciclo fabril completo: Orçamento Aprovado → Pedido Lock → Etiquetas 100x50mm → Kanban de Fábrica → Romaneio de Corte & Ficha Técnica → Baixa de Estoque e Kardex.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-21: Reservar e Baixar Matéria-Prima no Estoque Automaticamente

#### 🎯 Objetivo de Negócio
> **Como** encarregado de compras e almoxarife da Alumiportas,  
> **Desejo** que o sistema controle reservas de matéria-prima na liberação do pedido e efetue a baixa automática de saldo na fabricação das esquadrias, além de registrar entradas manuais e perdas de material,  
> **Para que** o saldo do estoque reflita fielmente a realidade da oficina, evitando falta imprevista de insumos e garantindo o planejamento das compras.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Reserva automática de insumos na liberação do pedido para produção**
  - **Dado que** o pedido "PED-2026-0012" é transicionado de `AGUARDANDO_PRODUCAO` para `EM_PRODUCAO`
  - **Quando** o serviço `StockService.reservarMateriais(orderId)` é acionado
  - **Então** o sistema calcula as quantidades de perfis, vidros e componentes requeridos pelos itens do pedido
  - **E** para cada item em estoque, incrementa o campo `saldo_reservado`
  - **E** recalcula o saldo disponível (`saldo_disponivel = saldo_fisico - saldo_reservado`)
  - **E** registra movimentações no histórico com tipo `RESERVA_PRODUCAO`.

- [ ] **Cenário 2: Baixa física definitiva de materiais ao concluir a fabricação**
  - **Dado que** um pedido com materiais reservados é finalizado no chão de fábrica (`CONCLUIDO`)
  - **Quando** o serviço de baixa definitiva de estoque for executado
  - **Então** o sistema subtrai a quantidade do `saldo_fisico` e do `saldo_reservado` simultaneamente
  - **E** registra movimentações no Kardex com tipo `BAIXA_PRODUCAO` vinculadas ao código do pedido.

- [ ] **Cenário 3: Comportamento quando o saldo disponível for insuficiente (Alerta não bloqueante)**
  - **Dado que** um item de material (ex: "Perfil Linha Suprema Branco") possui saldo disponível inferior à quantidade necessária para o pedido
  - **Quando** o sistema tenta realizar a reserva
  - **Então** a operação é concluída com sucesso sem bloquear o avanço do pedido no Kanban de fábrica
  - **E** o item de estoque recebe uma marcação de alerta visual amarelo indicando saldo crítico/negativo
  - **E** é gerado um registro de aviso no log operacional do sistema.

- [ ] **Cenário 4: Registro de entrada manual de mercadorias (Compras / Nota Fiscal)**
  - **Dado que** o almoxarife recebe uma remessa de fornecedor
  - **Quando** ele envia uma requisição `POST /api/stock/movement` com:
    ```json
    {
      "stockItemId": 1,
      "tipoMovimento": "ENTRADA_COMPRA",
      "quantidade": 50.00,
      "documentoReferencia": "NF-10452",
      "observacoes": "Recebimento de barras de alumínio branco 6m"
    }
    ```
  - **Então** o backend atualiza o `saldo_fisico = saldo_fisico + 50.00`
  - **E** registra uma linha no histórico Kardex com carimbo de data/hora e identificação do usuário logado.

- [ ] **Cenário 5: Registro de perdas e sucata na produção**
  - **Dado que** ocorreu avaria ou erro no corte de um perfil ou chapa de vidro
  - **Quando** o encarregado registra uma movimentação com tipo `PERDA_SUCATA`, informando a quantidade e justificativa
  - **Então** o `saldo_fisico` do material é reduzido imediatamente
  - **E** o motivo da perda é gravado de forma auditável para apuração dos custos de refugo.

- [ ] **Cenário 6: Estorno de reserva por cancelamento de pedido**
  - **Dado que** um pedido possuía materiais reservados no status `AGUARDANDO_PRODUCAO` ou `EM_PRODUCAO`
  - **Quando** o pedido for cancelado pelo operador
  - **Então** o sistema estorna a totalidade dos materiais reservados (`saldo_reservado = saldo_reservado - quantidade`)
  - **E** grava movimentação de tipo `CANCELAMENTO_RESERVA`, restabelecendo o saldo disponível.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Fórmula Matemática de Saldos)**: Em qualquer instante, `saldo_disponivel = saldo_fisico - saldo_reservado`. O `saldo_disponivel` pode assumir valores negativos em caso de ruptura de estoque, funcionando como indicador da necessidade de compra.
- **RN-02 (Operação Não Bloqueante)**: A falta de estoque emite alerta visual amarelo (`warning`), mas **não interrompe** o fluxo de produção física na oficina, preservando a autonomia do mestre de obras/serralheiro.
- **RN-03 (Imutabilidade do Kardex)**: Registros de `StockMovement` são estritamente append-only; uma movimentação cadastrada jamais pode ser alterada ou excluída diretamente. Correções devem ser feitas via `AJUSTE_MANUAL`.
- **RN-04 (Controle de Concorrência)**: As atualizações de saldo na tabela `stock_items` devem utilizar locking otimista (`@Version`) ou transações isoladas para prevenir race conditions em reservas simultâneas.

#### 🔌 Especificação Técnica
- **Backend**:
  - `StockMovementType` (Enum): `ENTRADA_COMPRA`, `RESERVA_PRODUCAO`, `BAIXA_PRODUCAO`, `PERDA_SUCATA`, `AJUSTE_MANUAL`, `CANCELAMENTO_RESERVA`.
  - Entidades: `StockItem` (código, descrição, unidade, saldoFisico, saldoReservado, estoqueMinimo, versao) e `StockMovement` (id, stockItem, tipo, quantidade, saldoAnterior, saldoPosterior, documentoReferencia, dataHora, usuario).
  - Migration Flyway `V11__create_stock_schema.sql` criando as tabelas com constraints e chaves estrangeiras.
  - `StockService`: Métodos transacionais de reserva, baixa, entrada manual e consulta de saldos.
  - Testes com JUnit 5 cobrindo concorrência, cálculos de saldos e tratamento de quebra/sucata.
- **Frontend**:
  - `StockMovementModal.tsx`: Modal para cadastro de entradas e perdas de estoque com validação Zod.
  - Hooks React Query em `useStock.ts`.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-21.1**: Criar package `br.edu.ifpb.alumigest.stock` e diretório `frontend/src/features/stock`
- **US-21.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V11__create_stock_schema.sql` com tabelas `stock_items`, `stock_movements`
- **US-21.3**: Criar enum `StockMovementType` (ENTRADA_COMPRA, RESERVA_PRODUCAO, BAIXA_PRODUCAO, PERDA_SUCATA, AJUSTE_MANUAL, CANCELAMENTO_RESERVA) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovementType.java`
- **US-21.4**: Criar entidade JPA `StockItem` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockItem.java`
- **US-21.5**: Criar entidade JPA `StockMovement` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/domain/StockMovement.java`
- **US-21.6**: Criar repositório `StockItemRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockItemRepository.java`
- **US-21.7**: Criar repositório `StockMovementRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/repository/StockMovementRepository.java`
- **US-21.11**: Criar record `StockItemResponse` (saldos físico, reservado, disponível e alerta) em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockItemResponse.java`
- **US-21.12**: Criar record `StockMovementRequest` e `StockMovementResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/dto/StockMovementRequest.java`
- **US-21.13**: Criar mapper MapStruct `StockMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/mapper/StockMapper.java`
- **US-21.14**: Implementar método `reservarMateriais(Long orderId)` no `StockService` em `backend/src/main/java/br/edu/ifpb/alumigest/stock/service/StockService.java`
- **US-21.15**: Implementar método `baixarMateriais(Long orderId)` no `StockService` convertendo reserva em baixa física
- **US-21.16**: Implementar método `registrarMovimentacaoManual(StockMovementRequest request)` e `listarSaldos()` no `StockService`
- **US-21.17**: Criar `StockController` com endpoints GET /api/stock, POST /api/stock/movement, GET /api/stock/{id}/movements em `backend/src/main/java/br/edu/ifpb/alumigest/stock/controller/StockController.java`
- **US-21.18**: Criar testes unitários de reserva, baixa e concorrência no `StockServiceTest` em `backend/src/test/java/br/edu/ifpb/alumigest/stock/service/StockServiceTest.java`

---

### 📌 US-22: Consultar Posição de Estoque e Kardex de Movimentações

#### 🎯 Objetivo de Negócio
> **Como** administrador e gestor de suprimentos da Alumiportas,  
> **Desejo** consultar a posição consolidada de estoque e o extrato cronológico (Kardex) de movimentações de cada matéria-prima,  
> **Para que** eu possa auditar todas as entradas, reservas e saídas de perfis e vidros, identificando desvios e itens próximos ao ponto de reposição.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Listagem consolidada da posição de estoque**
  - **Dado que** existem matérias-primas cadastradas no estoque
  - **Quando** o usuário acessa a tela `/estoque`
  - **Então** o sistema exibe uma tabela contendo:
    1. Código e descrição do material
    2. Unidade de medida (m, m², barra 6m, un)
    3. Saldo Físico em almoxarifado
    4. Saldo Reservado para ordens/pedidos ativos
    5. Saldo Disponível para novos orçamentos
    6. Indicador de status (Normal, Alerta de Reposição, Ruptura/Crítico).

- [ ] **Cenário 2: Destaque visual para itens abaixo do ponto de reposição**
  - **Dado que** um item possui `saldo_disponivel <= estoque_minimo`
  - **Quando** a tabela de estoque é renderizada
  - **Então** a linha do item exibe um badge de aviso visual (amarelo para estoque mínimo, vermelho para saldo zerado ou negativo)
  - **E** o painel de métricas no topo da página contabiliza a quantidade de "Itens com Reposição Urgente".

- [ ] **Cenário 3: Consulta do Extrato Cronológico Kardex por Item**
  - **Dado que** o operador clica no botão "Ver Histórico" de um item específico na tabela
  - **Quando** a gaveta lateral `KardexDrawer` for aberta
  - **Então** o sistema exibe a lista cronológica decrescente de movimentações desse material
  - **E** para cada movimentação apresenta:
    - Data e hora formatadas
    - Tipo da movimentação com badge estilizado (`ENTRADA`, `RESERVA`, `BAIXA`, `PERDA`, `AJUSTE`)
    - Quantidade movimentada (positiva para entradas, negativa para saídas)
    - Saldo resultante após a movimentação
    - Documento de referência ou número do pedido
    - Operador responsável.

- [ ] **Cenário 4: Busca textual e filtros por categoria**
  - **Dado que** o usuário está na tela de estoque
  - **Quando** ele digita um termo no campo de busca (ex: "Vidro 8mm" ou "Suprema")
  - **Então** a tabela filtra os itens em tempo real mantendo a paginação e os dados consolidados consistentes.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Auditoria e Rastreabilidade)**: Cada linha do Kardex deve permitir identificar com exatidão a origem da movimentação (pedido, nota de compra ou operador que realizou ajuste manual).
- **RN-02 (Precisão Numérica Decimal)**: Os campos de quantidade devem suportar precisão de até 3 casas decimais (ex: metros lineares de perfil `5.850 m`, área de vidro `1.450 m²`), operados como `BigDecimal` no backend.
- **RN-03 (Desempenho da Consulta)**: O extrato Kardex deve ser paginado no backend para itens com grande volume de movimentações, evitando travamento de renderização no frontend.

#### 🔌 Especificação Técnica
- **Backend**:
  - `StockController`: Endpoints `GET /api/stock` com suporte a filtros e `GET /api/stock/{id}/movements` (paginado).
  - DTOs: `StockItemResponse` e `StockMovementResponse`.
  - Mapeamento via MapStruct garantindo conversão limpa e performática.
- **Frontend**:
  - `StockPage.tsx`: Página central de estoque com cards de KPIs no topo.
  - `StockTable.tsx`: Tabela com ordenação, filtros e badges de status.
  - `KardexDrawer.tsx`: Componente Drawer responsivo para visualização do extrato de movimentações.
  - `useStock.ts`: Hook com React Query e controle de paginação.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-22.1**: Criar interfaces TypeScript e schemas Zod em `frontend/src/features/stock/types/stock.ts`
- **US-22.2**: Criar serviço de API Axios (`stockApi.ts`) e hooks React Query (`useStock.ts`)
- **US-22.3**: Criar componente `StockTable` com badges de alerta amarelo em `frontend/src/features/stock/components/StockTable.tsx`
- **US-22.4**: Criar modal `StockMovementModal` para entrada de materiais em `frontend/src/features/stock/components/StockMovementModal.tsx`
- **US-22.5**: Criar componente `KardexDrawer` com histórico de movimentações em `frontend/src/features/stock/components/KardexDrawer.tsx`
- **US-22.6**: Criar página `StockPage` e registrar rota `/estoque` no React Router

---

### 📌 US-23: Homologação Integrada e Validação da Release 2 (v2.0.0)

#### 🎯 Objetivo de Negócio
> **Como** Tech Lead, Product Owner e Encarregado da Alumiportas,  
> **Desejo** executar a homologação técnica e operacional integrada de todas as funcionalidades da Release 2 (v2.0.0),  
> **Para que** possamos assegurar a integridade do fluxo completo da fábrica (Orçamento → Pedido com Snapshot → Etiquetas 100x50mm → Kanban de Produção → Romaneio de Corte → Baixa no Estoque e Kardex) com conformidade estrita ao Quality Gate do SonarQube.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Execução da Pirâmide de Testes Automatizados da Release 2**
  - **Dado que** todas as funcionalidades das Sprints 05, 06, 07 e 08 foram implementadas
  - **Quando** forem executados os comandos `mvn clean verify` no backend e `npm test` / `npm run build` no frontend
  - **Então** 100% dos testes unitários e de integração devem passar sem nenhuma falha ou regressão
  - **E** o build de produção do frontend em Vite/TypeScript deve concluir sem avisos de tipagem (`tsc --noEmit`).

- [ ] **Cenário 2: Conformidade com o SonarQube Quality Gate**
  - **Dado que** o código da Release 2 é submetido à análise estática do SonarQube
  - **Quando** o Quality Gate for avaliado
  - **Então** deve atender a todos os critérios de aceitação:
    1. Cobertura de testes em código novo $\ge 80\%$
    2. Zero Bugs e zero Vulnerabilidades críticas
    3. Manutenibilidade com classificação A (Code Smells insignificantes ou resolvidos)
    4. Duplicação de código inferior a $3\%$.

- [ ] **Cenário 3: Validação do Fluxo E2E Integrado da Fábrica**
  - **Dado que** o ambiente de testes está ativo com banco de dados de homologação
  - **Quando** o avaliador executa a jornada completa:
    1. Converte um Orçamento Aprovado em Pedido de Venda (`US-13` / `US-14`)
    2. Imprime o comprovante PDF do pedido (`US-16`)
    3. Emite as etiquetas de identificação térmica 100x50mm dos itens (`US-17`)
    4. Move o pedido pelo Kanban de produção (`US-18`)
    5. Consulta o Romaneio de Corte e a Ficha Técnica de Montagem (`US-19` / `US-20`)
    6. Verifica a reserva e a baixa automática no estoque com extrato no Kardex (`US-21` / `US-22`)
  - **Então** todas as etapas devem ser executadas com consistência de dados, sem bloqueios indevidos e com total integridade referencial.

- [ ] **Cenário 4: Geração do Relatório Oficial de Testes de Aceitação (TEA)**
  - **Dado que** todos os testes técnicos e funcionais foram concluídos com sucesso
  - **Quando** a homologação for finalizada
  - **Então** o documento `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Release2.md` deve ser consolidado e aprovado com evidências
  - **E** o guia `quickstart.md` deve estar atualizado e verificado para execução local.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Critério Inegociável de Entrega)**: A Release 2 só é considerada concluída e pronta para deploy quando todos os cenários da US-23 forem validados e o SonarQube Quality Gate estiver verde.
- **RN-02 (Rastreabilidade e Governança Docs-as-Code)**: As especificações técnicas em `docs/sistema/` e `docs/projeto-001/` devem refletir com precisão as implementações efetivas da Release 2.

#### 🔌 Especificação Técnica
- **Validação Local**:
  - Backend: `mvn clean verify`
  - Frontend: `npm run lint`, `npm test -- --run`, `npm run build`
  - Auditoria de Cobertura JaCoCo e Vitest
- **Documentação**:
  - Relatório TEA Release 2 e atualização do Swagger/OpenAPI.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-23.1**: Executar `mvn clean verify` no backend e corrigir qualquer falha nos testes de todas as sprints da Release 2
- **US-23.2**: Executar `npm run build` no frontend e validar tipagem estrita
- **US-23.3**: Validar os cenários E2E da Release 2 no ambiente local
- **US-23.4**: Documentar relatório de Testes de Aceitação da Release 2 em `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Release2.md`
- **US-23.5**: Documentação OpenAPI/Swagger nos endpoints de estoque
- **US-23.6**: Adicionar atalho "Estoque & Materiais" no menu do frontend
- **US-23.7**: Validação final do `quickstart.md` da Sprint 8

---

## 3. Matriz de Rastreabilidade

| Requisito | User Story | Sub-tarefa Backend | Sub-tarefa Frontend | Testes Automatizados |
| :--- | :--- | :--- | :--- | :--- |
| Reserva e Baixa de Estoque | **US-21** | US-21.1 a US-21.17 | US-21.1 | US-21.18 (`StockServiceTest`) |
| Posição de Estoque e Kardex | **US-22** | US-21.17 | US-22.1 a US-22.6 | `StockTable.test.tsx`, `KardexDrawer.test.tsx` |
| Homologação Release 2 (v2.0.0) | **US-23** | US-23.1, US-23.5 | US-23.2, US-23.6 | US-23.3, US-23.4, US-23.7 (TEA & E2E) |
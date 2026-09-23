# Feature Specification: Sprint 9 — Módulo de Pagamento e Cobrança via PIX (QR Code Dinâmico + Copia e Cola)

**Feature**: `006-pagamento-cobranca-pix`  
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão  
**Created**: 2026-08-27  
**Updated**: 2026-09-23  
**Status**: APPROVED (Esclarecimentos Resolvidos — Padrão BDD Gherkin)  

---

## 1. Visão Geral & Contexto de Negócio

Com as etapas de orçamento, pedidos, produção fabril e estoque estabelecidas, a **Release 3 (v3.0.0)** inicia a automação financeira do AlumiGest.

O método de pagamento mais utilizado pelos clientes da Alumiportas para pagamento de sinais de entrada (50%) ou liquidação total à vista é o **PIX**. Atualmente, a conferência manual de comprovantes de PIX enviados por WhatsApp gera atrasos na liberação de pedidos e risco de fraudes com comprovantes falsos.

Esta sprint entrega:
1. **Geração de Cobrança PIX Dinâmica**: Emissão de QR Code e código "Copia e Cola" (Payload padrão BACEN / EMV) associados a um Pedido de Venda ou Orçamento com validade padrão de 24 horas.
2. **Arquitetura Híbrida de Provedor PIX**: Interface `PixGatewayService` com implementação para Gateway de Mercado (Asaas / EFI) e Simulador Mock integrado para testes locais e desenvolvimento.
3. **Detecção e Notificação de Pagamento em Tempo Real**: Atualização instantânea na tela via webhook/polling quando o cliente conclui o pagamento do PIX.
4. **Fluxo Financeiro Integrado**: Ao confirmar o pagamento do sinal (50%), o status financeiro do pedido é atualizado para `SINAL_PAGO`, habilitando com destaque o botão de "Liberar para Produção".

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-24: Gerar Cobrança PIX com QR Code Dinâmico e Copia e Cola

#### 🎯 Objetivo de Negócio
> **Como** vendedor e operador financeiro da Alumiportas,  
> **Desejo** gerar cobranças PIX dinâmicas com QR Code e código "Copia e Cola" para o sinal de entrada (50%) ou liquidação integral de pedidos e orçamentos,  
> **Para que** o cliente possa pagar instantaneamente pelo aplicativo do seu banco, com valor exato e conciliação bancária automatizada sem conferência manual.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Geração de cobrança PIX para sinal de entrada (50%) de um pedido**
  - **Dado que** existe um pedido de venda "PED-2026-0015" no valor total de R$ 4.000,00 com status financeiro `PENDENTE`
  - **Quando** o operador solicita a geração do PIX informando tipo `SINAL` e valor de R$ 2.000,00 via endpoint `POST /api/payments/pix/generate-for-order/{orderId}`
  - **Então** o sistema gera uma transação PIX com identificador único (`txid`)
  - **E** retorna status HTTP `201 Created` contendo:
    1. Código copia e cola (`payloadCopiaECola`) no padrão EMV do Banco Central
    2. Imagem do QR Code em Base64 (`qrCodeBase64`)
    3. Valor formatado (`2000.00`)
    4. Data e hora de expiração calculada para exatamente 24 horas a partir da emissão.

- [ ] **Cenário 2: Validação de regras e integridade monetária**
  - **Dado que** o operador tenta gerar uma cobrança PIX com valor negativo, zerado ou superior ao saldo em aberto do pedido
  - **Quando** a requisição for submetida ao backend
  - **Então** o sistema rejeita a operação com status HTTP `422 Unprocessable Entity`
  - **E** retorna mensagem de validação clara informando que o valor da cobrança é inválido.

- [ ] **Cenário 3: Reutilização de cobrança ativa não expirada**
  - **Dado que** já existe uma cobrança PIX gerada para o pedido com validade vigente (menos de 24 horas de emissão) e status `PENDENTE`
  - **Quando** o operador clica novamente em "Gerar PIX" para o mesmo tipo de pagamento
  - **Então** o sistema retorna a cobrança existente sem criar cobranças duplicadas desnecessárias no gateway bancário.

- [ ] **Cenário 4: Geração com Provedor Mock em ambiente de desenvolvimento e testes**
  - **Dado que** a aplicação está rodando sob o profile `dev` ou `test`
  - **Quando** o serviço `PixService` é executado
  - **Então** o componente `MockPixGatewayServiceImpl` emite um payload sintético válido com CRC16 calculado
  - **E** permite o ciclo completo de testes locais sem dependência de credenciais reais de banco.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Padrão EMV BR Code BACEN)**: O código copia e cola deve obedecer estritamente à especificação do Banco Central do Brasil para QR Code dinâmico, incluindo identificadores de merchant account, chave PIX, URL do payload e soma de verificação CRC16 CCITT.
- **RN-02 (Validade Padrão de 24 Horas)**: Cobranças não pagas expiram em 24 horas. Após a expiração, uma nova cobrança pode ser gerada.
- **RN-03 (Imutabilidade e Associação)**: Todo `PixTransaction` deve estar rigidamente vinculado a um `Payment` e a um `Order`. O `txid` alfanumérico gerado é único e imutável.
- **RN-04 (Precisão Monetária)**: Todos os valores devem ser processados usando `BigDecimal` com 2 casas decimais e arredondamento `RoundingMode.HALF_EVEN`.

#### 🔌 Especificação Técnica
- **Backend**:
  - `PixPayloadGenerator`: Utilitário gerador de strings EMV compatíveis com BR Code e cálculo de CRC16.
  - `PixGatewayService`: Interface genérica definindo `criarCobrancaImediata()` e `consultarCobranca()`.
  - `MockPixGatewayServiceImpl`: Implementação simulada para testes locais.
  - `PixService`: Serviço orquestrador contendo a lógica de negócios e persistência.
  - `PixPaymentController`: Endpoints REST documentados no Swagger.
  - Testes unitários com JUnit 5 validando estrutura do payload e integridade matemática do CRC16.
- **Frontend**:
  - `pixApi.ts`: Cliente Axios com tipagem estrita para requisições de pagamento.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-24.1**: Criar package `br.edu.ifpb.alumigest.finance` e diretório `frontend/src/features/finance`
- **US-24.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V12__create_payments_and_pix_schema.sql` com tabelas `payments` e `pix_transactions`
- **US-24.3**: Criar enums `PaymentType`, `PaymentMethod`, `PaymentStatus` e `PixStatus` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/`
- **US-24.4**: Criar entidade JPA `Payment` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/Payment.java`
- **US-24.5**: Criar entidade JPA `PixTransaction` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/PixTransaction.java`
- **US-24.6**: Criar repositório `PaymentRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/PaymentRepository.java`
- **US-24.7**: Criar repositório `PixTransactionRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/PixTransactionRepository.java`
- **US-24.8**: Criar gerador de payload EMV / BR Code `PixPayloadGenerator` com CRC16 CCITT em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/PixPayloadGenerator.java`
- **US-24.9**: Criar record `PixGenerateRequest` (tipoPagamento, valor, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixGenerateRequest.java`
- **US-24.10**: Criar record `PixChargeResponse` (txid, valor, payloadCopiaECola, qrCodeBase64, dataExpiracao) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixChargeResponse.java`
- **US-24.11**: Criar interface `PixGatewayService` e implementação `MockPixGatewayServiceImpl` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/impl/MockPixGatewayServiceImpl.java`
- **US-24.12**: Implementar serviço `PixService.gerarCobrancaPix(Long orderId, PixGenerateRequest request)` com validade de 24h em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/PixService.java`
- **US-24.13**: Criar endpoint `POST /api/payments/pix/generate-for-order/{orderId}` no `PixPaymentController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/PixPaymentController.java`
- **US-24.14**: Criar testes unitários do `PixPayloadGeneratorTest` e `PixServiceTest`

---

### 📌 US-25: Confirmar Pagamento PIX via Webhook com Liberação Automática

#### 🎯 Objetivo de Negócio
> **Como** sistema AlumiGest e gestor de produção da Alumiportas,  
> **Desejo** receber notificações instantâneas de liquidação de pagamentos via Webhook bancário ou consulta periódica,  
> **Para que** o sistema confirme a quitação do sinal imediatamente, alterando o status financeiro do pedido e desbloqueando a liberação para produção na fábrica sem intervenção manual.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Recebimento de notificação de liquidação via Webhook**
  - **Dado que** existe uma transação PIX com `txid = "TX12345678"` com status `PENDENTE` vinculada a um pedido
  - **Quando** o PSP bancário envia um callback `POST /api/webhooks/pix` informando que o PIX foi pago com identificador bancário `endToEndId = "E1234567820260923"`
  - **Então** o endpoint processa a requisição e retorna status HTTP `200 OK`
  - **E** atualiza o status da `PixTransaction` para `CONCLUIDO` e registra o carimbo de `data_pagamento`
  - **E** atualiza o status do `Payment` para `PAGO`.

- [ ] **Cenário 2: Atualização automática do status financeiro do Pedido e habilitação da Produção**
  - **Dado que** o pagamento liquidado refere-se ao sinal de 50% de um pedido
  - **Quando** a liquidação é confirmada no backend
  - **Então** o status financeiro do pedido passa de `PENDENTE` para `SINAL_PAGO`
  - **E** a ação "Liberar para Produção" é imediatamente habilitada na tela de detalhes do pedido com destaque visual verde.

- [ ] **Cenário 3: Idempotência no processamento de Webhooks repetidos**
  - **Dado que** o Webhook com o mesmo `endToEndId` já foi processado anteriormente com sucesso
  - **Quando** o banco reenviar a notificação de pagamento (retentativa de rede)
  - **Então** o sistema reconhece a liquidação prévia
  - **E** retorna status HTTP `200 OK` imediatamente sem duplicar lançamentos financeiros ou alterar novamente os dados.

- [ ] **Cenário 4: Simulação de pagamento para testes manuais e automatizados**
  - **Dado que** o desenvolvedor ou testador está validando o fluxo em ambiente local
  - **Quando** ele dispara uma requisição `POST /api/payments/pix/simulate/{txid}`
  - **Então** o sistema executa o mesmo fluxo de liquidação do webhook oficial, confirmando o pagamento para o `txid` informado.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Idempotência Compulsória)**: O processamento de confirmação de pagamento deve ser estritamente idempotente, garantindo que múltiplas chamadas com o mesmo `endToEndId` não criem duplicidades financeiras.
- **RN-02 (Desbloqueio Fabril Condicionado)**: Apenas pedidos com status financeiro `SINAL_PAGO` ou `PAGO_TOTAL` podem ter seu status produtivo alterado para `EM_PRODUCAO`, salvaguardando a empresa contra fabricação sem garantia de pagamento.
- **RN-03 (Segurança do Endpoint de Webhook)**: O endpoint `/api/webhooks/pix` deve validar token de autorização via header ou assinatura HMAC compartilhada configurada no `application.yml`.

#### 🔌 Especificação Técnica
- **Backend**:
  - `PixWebhookController`: Endpoint aberto e protegido por token/header secreto recebendo o payload bancário.
  - `PixService.liquidarPix(String txid, String e2eid)`: Lógica transacional que audita e executa a baixa.
  - `PixPaymentControllerIntegrationTest`: Teste de integração simulando o ciclo completo de geração e confirmação.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-25.1**: Criar record `PixStatusResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixStatusResponse.java`
- **US-25.2**: Implementar método `liquidarPix(String txid, String e2eid)` no `PixService` atualizando o pagamento e o status financeiro do pedido
- **US-25.3**: Criar endpoint `GET /api/payments/pix/status/{txid}` no `PixPaymentController` para polling de status
- **US-25.4**: Criar endpoint `POST /api/webhooks/pix` no `PixWebhookController`
- **US-25.5**: Criar endpoint `POST /api/payments/pix/simulate/{txid}` no `PixPaymentController` para testes no ambiente dev
- **US-25.6**: Criar testes de integração REST do fluxo de liquidação PIX no `PixPaymentControllerIntegrationTest`

---

### 📌 US-26: Modal PIX Interativo no Frontend e Histórico de Transações

#### 🎯 Objetivo de Negócio
> **Como** vendedor e cliente da Alumiportas,  
> **Desejo** interagir com um modal visual e intuitivo de pagamento PIX com QR Code, botão de cópia com um clique, cronômetro regressivo e confirmação instantânea na tela,  
> **Para que** a experiência de pagamento seja ágil, moderna, segura e com feedback visual imediato assim que a transação for concluída.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Abertura do Modal de Pagamento PIX**
  - **Dado que** o vendedor está na tela do pedido e clica no botão "Pagar com PIX"
  - **Quando** o modal `PixPaymentModal` é exibido na tela
  - **Então** ele exibe:
    1. Imagem em alta resolução do QR Code para leitura com a câmera do celular
    2. Campo com o código Copia e Cola completo
    3. Botão "Copiar Código PIX"
    4. Valor a ser pago formatado em Real (`R$ 2.000,00`)
    5. Cronômetro regressivo com o tempo restante de validade da cobrança (24h).

- [ ] **Cenário 2: Cópia do código Copia e Cola para a área de transferência**
  - **Dado que** o modal está aberto com a cobrança gerada
  - **Quando** o usuário clica no botão "Copiar Código PIX"
  - **Então** o texto é transferido para o clipboard do sistema operacional
  - **E** o botão altera seu texto e ícone temporariamente para "Copiado!" com cor verde por 3 segundos
  - **E** é emitido um feedback toast confirmando a cópia.

- [ ] **Cenário 3: Detecção reativa do pagamento em tempo real (Polling)**
  - **Dado que** o modal está aberto e o cliente efetua o pagamento no app bancário
  - **Quando** o hook `usePixPayment` realiza a checagem periódica a cada 3 segundos via `GET /api/payments/pix/status/{txid}`
  - **Então** o backend responde com `status: "CONCLUIDO"`
  - **E** o modal exibe imediatamente a animação de sucesso (`PixPaymentSuccessAlert`) com ícone de checkmark verde
  - **E** a tela de fundo atualiza os dados do pedido sem necessidade de recarregar a página manualmente.

- [ ] **Cenário 4: Tratamento de expiração da cobrança**
  - **Dado que** o tempo limite de 24 horas da cobrança foi atingido com o modal aberto
  - **Quando** o timer atinge 00:00:00
  - **Então** o QR Code é desativado visualmente com overlay cinza
  - **E** o modal exibe a mensagem "Esta cobrança expirou" com um botão "Gerar Novo PIX".

- [ ] **Cenário 5: Integração com a tela de detalhes do Pedido**
  - **Dado que** o pedido teve o sinal liquidado com sucesso
  - **Quando** o usuário visualiza `OrderDetailPage.tsx`
  - **Então** a seção financeira exibe o badge verde `SINAL PAGO`
  - **E** o botão "Liberar para Produção" fica habilitado para clique.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Frequência de Polling Suave)**: O polling de verificação de status deve ocorrer a cada 3 segundos enquanto o modal estiver aberto, sendo cancelado imediatamente ao fechar o modal ou confirmar o pagamento, preservando a largura de banda.
- **RN-02 (Feedback Acessível)**: Toda transição de estado no modal deve dispor de textos acessíveis (ARIA labels) e suporte à navegação por teclado (ESC para fechar).
- **RN-03 (Fallback para Falha de Clipboard)**: Se a API `navigator.clipboard` falhar ou for bloqueada por permissão do navegador, o sistema deve fornecer seleção de texto direta no input.

#### 🔌 Especificação Técnica
- **Frontend**:
  - `PixPaymentModal.tsx`: Componente com design clean, responsivo e suporte a tema escuro/claro.
  - `usePixPayment.ts`: Custom hook com React Query / interval gerenciando ciclo de vida da transação.
  - `PixPaymentSuccessAlert.tsx`: Componente de animação e feedback de liquidação.
  - Atualização dos botões de ação e status financeiro em `OrderDetailPage.tsx`.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-26.1**: Criar interfaces TypeScript e serviço Axios (`pixApi.ts`) em `frontend/src/features/finance/services/pixApi.ts`
- **US-26.2**: Criar custom hook `usePixPayment` com polling automático a cada 3 segundos em `frontend/src/features/finance/hooks/usePixPayment.ts`
- **US-26.3**: Criar componente `PixPaymentModal` com QR Code, botão "Copiar Chave PIX" e timer regressivo em `frontend/src/features/finance/components/PixPaymentModal.tsx`
- **US-26.4**: Criar componente `PixPaymentSuccessAlert` com animação de confirmação em `frontend/src/features/finance/components/PixPaymentSuccessAlert.tsx`
- **US-26.5**: Integrar botão "Gerar PIX" na página de detalhes do pedido (`OrderDetailPage.tsx`) e destacar o botão "Liberar para Produção" quando o status for `SINAL_PAGO`
- **US-26.6**: Documentar endpoints no OpenAPI/Swagger
- **US-26.7**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 9

---

## 3. Matriz de Rastreabilidade

| Requisito | User Story | Sub-tarefa Backend | Sub-tarefa Frontend | Testes Automatizados |
| :--- | :--- | :--- | :--- | :--- |
| Cobrança PIX Dinâmica | **US-24** | US-24.1 a US-24.13 | US-24.1 | US-24.14 (`PixPayloadGeneratorTest`, `PixServiceTest`) |
| Confirmação via Webhook | **US-25** | US-25.1 a US-25.5 | — | US-25.6 (`PixPaymentControllerIntegrationTest`) |
| Modal Interativo & Polling | **US-26** | US-25.3 | US-26.1 a US-26.5 | `PixPaymentModal.test.tsx`, `usePixPayment.test.ts` |
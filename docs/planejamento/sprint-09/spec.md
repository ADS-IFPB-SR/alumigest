# Feature Specification: Sprint 9 — Módulo de Pagamento e Cobrança via PIX (QR Code Dinâmico + Copia e Cola)

**Feature**: `006-pagamento-cobranca-pix`
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

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

## 2. Histórias de Usuário (User Stories)

### User Story 1 (P1) — Geração de QR Code PIX e Chave Copia e Cola 🎯 MVP

**Como** Vendedor da Alumiportas,
**Quero** gerar uma cobrança PIX com valor exato (sinal de 50% ou total) para o cliente com 1 clique,
**Para que** eu possa exibir o QR Code na tela ou enviar o código Copia e Cola via WhatsApp.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Geração de cobrança PIX para sinal de entrada
  Dado que existe um pedido "PED-2026-0001" com valor líquido de R$ 2.000,00 e condição "50% Entrada"
  Quando o vendedor clica em "Gerar PIX de Entrada (R$ 1.000,00)"
  Então o sistema deve gerar um QR Code Dinâmico com validade de 24 horas e código Copia e Cola
  E exibir o modal de pagamento com botão "Copiar Chave PIX" e contador regressivo
```

---

### User Story 2 (P1) — Confirmação Automática de Pagamento PIX e Liberação 🎯 MVP

**Como** Cliente e Vendedor,
**Quero** que o sistema reconheça o pagamento do PIX imediatamente após a transferência no aplicativo do banco,
**Para que** o pedido receba o status `SINAL_PAGO` e habilite a liberação imediata para a fábrica.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Confirmação de recebimento do PIX
  Dado que o modal de pagamento PIX de R$ 1.000,00 está aberto
  Quando o pagamento é concluído e o webhook do gateway notifica a API
  Então a tela deve exibir confirmação visual ("Pagamento de R$ 1.000,00 Confirmado com Sucesso!")
  E o status financeiro do pedido muda para "SINAL_PAGO"
  E o botão "Liberar para Produção" fica habilitado em destaque verde
```

---

### User Story 3 (P2) — Histórico de Cobranças PIX e Simulador de Testes

**Como** Administrador e Desenvolvedor,
**Quero** consultar o extrato de transações PIX geradas e dispor de um botão de simulação de pagamento no ambiente de homologação,
**Para que** eu possa validar o fluxo E2E mesmo sem transacionar dinheiro real.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Simulação de pagamento PIX em ambiente dev/staging
  Dado que existe uma cobrança PIX gerada no ambiente de testes
  Quando o testador clica em "Simular Pagamento PIX"
  Então o sistema processa a liquidação instantaneamente disparando o webhook interno
```

---

## 3. Requisitos Funcionais

1. **RF01 - Geração de Payload PIX**: Geração de código copia e cola em conformidade com o padrão EMV QRCPS-MPM do Banco Central do Brasil.
2. **RF02 - Associação Rastreável**: Cada cobrança PIX (`PixTransaction`) vincula-se obrigatoriamente a um `Order` ou `Budget`.
3. **RF03 - Validade de 24 Horas**: Cada cobrança expira automaticamente após 24 horas, permitindo gerar uma nova cobrança se necessário.
4. **RF04 - Webhook Listener**: Endpoint seguro `/api/webhooks/pix` para recebimento de callbacks de PSPs bancários.
5. **RF05 - Modal Interativo**: Modal com renderização do QR Code, botão de cópia com feedback ("Copiado!"), timer e polling a cada 3 segundos.
6. **RF06 - Integração com Liberação Fabril**: Pedidos com sinal pendente exibem aviso amigável; após pagamento do sinal, a liberação fabril é desbloqueada.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Provedor Gateway)**: Gateway de Mercado (Asaas / EFI) + Simulador Mock integrado para testes locais e desenvolvimento.
- **Q2 (Validade do QR Code)**: 24 horas de validade padrão com opção de regenerar.
- **Q3 (Efeito no Pedido)**: Atualização do status financeiro para `SINAL_PAGO` e ativação em destaque verde do botão "Liberar para Produção".
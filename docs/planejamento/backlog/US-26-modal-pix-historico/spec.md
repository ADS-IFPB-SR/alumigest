# Especificação Funcional: US-26 — Modal PIX Interativo no Frontend e Histórico de Transações

**Identificador**: `US-26`  
**Issue GitHub**: [#151](https://github.com/ADS-IFPB-SR/alumigest/issues/151)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como vendedor ou operador de caixa da Alumiportas, desejo interagir com um modal dinâmico de cobrança PIX contendo QR Code de alta resolução, botão "Copia e Cola", temporizador regressivo e atualização visual instantânea via polling/notificação, além de consultar o histórico de transações PIX emitidas para a Ordem de Serviço, proporcionando uma experiência de atendimento moderna e transparente ao cliente.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Apresentação Interativa do Modal com QR Code e Timer**
  - **Dado que** o vendedor clica no botão "Gerar PIX" na página `OrderDetailPage`,
  - **Quando** o modal `PixPaymentModal` for renderizado,
  - **Então** o sistema exibe o QR Code Base64 com moldura nítida, valor monetário formatado em Reais (`R$ 0.000,00`),
  - **E** inicia uma contagem regressiva visual (ex: "Expira em 23h 59m"),
  - **E** inicia polling silencioso em segundo plano a cada 3 segundos via hook `usePixPayment`.

- [ ] **Cenário 2: Cópia do Código PIX com Feedback Visual**
  - **Dado que** o cliente solicita o código para pagamento em aplicativo de banco no celular,
  - **Quando** o operador clica no botão "Copiar Código PIX",
  - **Então** o texto BR Code é copiado para o clipboard do sistema operacional,
  - **E** o botão exibe temporariamente o estado "Copiado!" com ícone de confirmação verde e Toast de sucesso.

- [ ] **Cenário 3: Transição Instantânea ao Confirmar Pagamento**
  - **Dado que** o modal está aberto aguardando a transferência,
  - **Quando** o backend liquida o PIX e o polling detecta o status `PAID`,
  - **Então** o modal substitui imediatamente o QR Code por um banner animado de celebração (`PixPaymentSuccessAlert`) com o texto "Pagamento Confirmado com Sucesso!",
  - **E** fecha automaticamente após 3 segundos, atualizando os badges de saldo e status da O.S. sem recarregar a página.

- [ ] **Cenário 4: Histórico de Transações PIX da Ordem de Serviço**
  - **Dado que** foram geradas múltiplas tentativas ou pagamentos fracionados de PIX para a O.S.,
  - **Quando** o usuário expande a seção "Histórico de Transações PIX",
  - **Então** o sistema lista cada cobrança com `txid`, valor, data/hora e badge de status colorido:
    - **Verde**: `PAID` (Liquidado)
    - **Âmbar**: `PENDING` (Aguardando Pagamento)
    - **Cinza**: `EXPIRED` (Expirado)

- [ ] **Cenário 5: Tratamento de Expiração da Cobrança em Tela Aberta**
  - **Dado que** o cliente não realizou o pagamento dentro do prazo de 24h com o modal aberto,
  - **Quando** o cronômetro atinge `00:00:00`,
  - **Então** o QR Code é ocultado e substituído por alerta informativo com botão "Gerar Nova Cobrança PIX".

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Prevenção de Memory Leak):** O polling de verificação do status PIX deve ser cancelado determinística e imediatamente quando o modal for fechado, o pagamento for confirmado ou o timer expirar.
- **RN-02 (Acessibilidade e Usabilidade):** Fechamento via tecla `ESC` ou clique no backdrop habilitado, sem interromper transações válidas em andamento.
- **RN-03 (Diretriz de Idioma em Variáveis):** Componentes e hooks com propriedades em inglês: `qrCodeBase64`, `copyAndPastePayload`, `expiresAt`, `isPending`, `isPaid`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Endpoints:**
  - `GET /api/v1/payments/pix/orders/{orderId}/transactions` (histórico de transações da O.S.)
  - `GET /api/v1/payments/pix/status/{txid}` (consulta pontual de status)

### Frontend (React 19 / Vite / TanStack Query / Tailwind)
- **Componentes:**
  - `PixPaymentModal.tsx`
  - `PixPaymentSuccessAlert.tsx`
  - `PixTransactionHistory.tsx`
- **Hook:** `usePixPayment(orderId)` com `refetchInterval` condicional e revalidação de cache

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário do hook `usePixPayment` validando disparo, polling e interrupção após liquidação.
- [ ] Teste de componente com React Testing Library validando cópia para clipboard e renderização de timer.
- [ ] Teste E2E Cypress validando abertura do modal, simulação de pagamento e fechamento com sucesso.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

**Branch:** `feat/us-26-modal-pix-historico`

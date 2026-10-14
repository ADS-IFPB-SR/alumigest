# Especificação Funcional: US-24 — Gerar Cobrança PIX com QR Code Dinâmico e Copia e Cola

**Identificador**: `US-24`  
**Issue GitHub**: [#149](https://github.com/ADS-IFPB-SR/alumigest/issues/149)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como vendedor ou gestor financeiro da Alumiportas, desejo gerar uma cobrança PIX dinâmica integrada para uma Ordem de Serviço (`OS-YYYY-NNNN`) com geração de QR Code em imagem (Base64), código "Copia e Cola" (BR Code padrão Bacen) e controle de expiração, para agilizar o recebimento de entradas e pagamentos à vista com conciliação automática.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Geração Bem-Sucedida de Cobrança PIX com QR Code e Copia e Cola**
  - **Dado que** o vendedor visualiza uma Ordem de Serviço na página `OrderDetailPage` com valor pendente de pagamento,
  - **Quando** aciona a ação "Gerar Cobrança PIX", informa o valor (`amount`) e confirma o modal,
  - **Então** o sistema gera um identificador de transação único (`txid` alfanumérico),
  - **E** compila a string padrão EMV BR Code com checksum CRC16 válido,
  - **E** renderiza no frontend o QR Code visual e disponibiliza botão com clique único para "Copiar Código PIX",
  - **E** exibe o cronômetro regressivo com prazo de expiração configurado para 24 horas (`expiresAt`).

- [ ] **Cenário 2: Validação de Valor Mínimo e Teto da O.S.**
  - **Dado que** o usuário tenta gerar uma cobrança PIX,
  - **Quando** informa um valor menor ou igual a zero ou superior ao saldo em aberto da O.S.,
  - **Então** a validação do schema Zod e do backend bloqueia a operação com HTTP `422 Unprocessable Entity` ("O valor da cobrança PIX deve ser maior que zero e não pode exceder o saldo pendente da ordem").

- [ ] **Cenário 3: Reutilização de Cobrança PIX Pendente Válida**
  - **Dado que** já existe uma cobrança PIX com status `PENDING` e dentro do prazo de validade para aquele mesmo valor/etapa da O.S.,
  - **Quando** o vendedor solicita a geração de PIX,
  - **Então** o sistema recupera a transação existente em vez de duplicar cobranças no provedor, retornando o mesmo QR Code e `txid`.

- [ ] **Cenário 4: Expiração Automática de Cobrança Vencida**
  - **Dado que** uma cobrança PIX atingiu a data/hora limite (`expiresAt`) sem confirmação de pagamento,
  - **Quando** o backend executa a rotina de verificação ou o status é consultado,
  - **Então** a transação passa atomicamente para `EXPIRED`, desabilitando o QR Code na interface e permitindo a emissão de nova cobrança.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Conformidade com o Arranjo PIX Bacen):** O payload copia-e-cola deve seguir a especificação EMV QRCPS (Merchant-Presented Mode) com chave PIX, nome do recebedor ("Alumiportas"), cidade ("Santa Rita") e CRC16 CCITT.
- **RN-02 (Precisão Financeira Estrita):** O valor da transação deve ser persistido como `NUMERIC(12,2)` com `RoundingMode.HALF_EVEN`.
- **RN-03 (Diretriz de Idioma em Variáveis):** Entidades e DTOs em inglês técnico: `txid`, `amount`, `copyAndPastePayload`, `qrCodeBase64`, `expiresAt`, `pixStatus` (`PENDING`, `PAID`, `EXPIRED`, `CANCELLED`).

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Tabelas:** `tb_payments` e `tb_pix_transactions` (`V22__create_payments_and_pix_schema.sql`)
- **Endpoint:** `POST /api/v1/payments/pix/orders/{orderId}`
- **DTOs:** `PixChargeRequestDTO` (`amount`, `paymentType`), `PixChargeResponseDTO` (`txid`, `amount`, `qrCodeBase64`, `copyAndPastePayload`, `expiresAt`, `status`)
- **Service:** `PixService.java` e `PixPayloadGenerator.java`

### Frontend (React 19 / Vite / TanStack Query / Tailwind)
- **Modal:** `PixPaymentModal.tsx` com visualização de QR Code, botão "Copiar Código" com feedback e temporizador
- **Hook:** `useGeneratePixCharge(orderId)`

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `PixPayloadGeneratorTest` validando a estrutura TLV (Tag-Length-Value) e integridade do cálculo CRC16.
- [ ] Teste de integração REST validando `POST /api/v1/payments/pix/orders/{orderId}` e retorno HTTP 201/422.
- [ ] Componente visual `PixPaymentModal.tsx` testado com cópia para área de transferência e feedback visual Toast.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

**Branch:** `feat/us-24-cobranca-pix-dinamico`

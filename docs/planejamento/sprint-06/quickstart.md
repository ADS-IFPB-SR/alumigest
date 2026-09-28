# Quickstart Validation Guide: Sprint 6 — Pedidos de Venda, Lock de Preços e Comprovante Oficial

**Feature**: `002-pedidos-lock-precos`  
**Período da Sprint 06**: 29/09/2026 a 12/10/2026  
**Status**: APPROVED  

## Pré-requisitos

- PostgreSQL rodando com migrations até V19 aplicadas (`V19__create_orders_schema.sql`)
- Backend compilando sem erros (`mvn clean compile`)
- Frontend executando sem erros de tipagem (`npm run build`)
- Existência de pelo menos 1 orçamento criado em status `DRAFT` ou `SENT` (ex: ID 1)

---

## Cenários de Validação

### Cenário 1: Converter Orçamento em Pedido de Venda com Sugestão de Prazo

```bash
# Converter orçamento ID 1 em pedido de venda
curl -s -X POST http://localhost:8080/api/orders/from-budget/1 \
  -H "Content-Type: application/json" \
  -d '{
    "canalAprovacao": "WHATSAPP",
    "dataPrevisaoEntrega": "2026-10-14",
    "observacoes": "Aprovado via WhatsApp após confirmação das medidas"
  }'

# Resultado esperado:
# - HTTP 201 Created
# - Código do pedido gerado (ex: PED-2026-0001)
# - Status inicial: AGUARDANDO_PRODUCAO
# - Orçamento ID 1 com status atualizado para APPROVED
```

### Cenário 2: Validação do Snapshot Imutável (Lock de Preços)

```bash
# 1. Consultar pedido gerado
curl -s http://localhost:8080/api/orders/1

# 2. Simular reajuste no catálogo: alterar o preço do material ou tipologia no banco
# 3. Consultar novamente o pedido gerado
curl -s http://localhost:8080/api/orders/1

# Resultado esperado: 
# - Todos os itens do pedido e valores totais permanecem 100% idênticos
# - Blindagem contra reajuste comprovada pelo snapshot deep copy
```

### Cenário 3: Bloqueio de Conversão Duplicada (Invariante 1-para-1)

```bash
# Tentar converter novamente o mesmo orçamento ID 1
curl -s -X POST http://localhost:8080/api/orders/from-budget/1 \
  -H "Content-Type: application/json" \
  -d '{"canalAprovacao": "PRESENCIAL", "dataPrevisaoEntrega": "2026-10-14"}'

# Resultado esperado: 
# - HTTP 409 Conflict ou HTTP 422 Unprocessable Entity
# - Mensagem: "Orçamento já convertido em pedido de venda"
```

### Cenário 4: Cancelamento de Pedido com Justificativa Obrigatória

```bash
# 1. Tentativa inválida sem justificativa (deve falhar por Bean Validation)
curl -s -X PATCH http://localhost:8080/api/orders/1/cancel \
  -H "Content-Type: application/json" \
  -d '{"justificativa": "Curta"}' # Menos de 10 caracteres

# Resultado esperado: HTTP 400 Bad Request

# 2. Cancelamento com justificativa válida
curl -s -X PATCH http://localhost:8080/api/orders/1/cancel \
  -H "Content-Type: application/json" \
  -d '{"justificativa": "Cliente solicitou cancelamento por adiamento da reforma residencial"}'

# Resultado esperado: HTTP 200 OK com status CANCELADO e justificativa gravada
```

### Cenário 5: Emissão e Download do Comprovante do Pedido em PDF

```bash
curl -s -o comprovante-pedido.pdf http://localhost:8080/api/orders/1/pdf/comprovante

# Resultado esperado: 
# - Arquivo application/pdf válido
# - Contém código PED-2026-0001, dados do cliente, itens congelados e total contratado
```

---

## Checklist do Quality Gate da Sprint 06

- [ ] `mvn clean verify` executado sem falhas no backend
- [ ] `npm run build` executado sem erros de TypeScript no frontend
- [ ] Testes unitários do `OrderService` cobrindo conversão, deep copy e cancelamento
- [ ] Testes de integração do `OrderController` com base H2
- [ ] Teste automatizado do `OrderPdfService`
- [ ] SonarQube Quality Gate verde (New Code Coverage $\ge 80\%$, zero bugs e vulnerabilidades)
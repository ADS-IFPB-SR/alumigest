# Quickstart Validation Guide: Sprint 5 — Aprovação de Orçamentos e Pedidos (Lock de Preços)

**Feature**: `002-pedidos-lock-precos`
**Date**: 2026-08-27

## Prerequisites

- PostgreSQL rodando com migrations até V9 aplicadas
- Backend compilando sem erros (`mvn clean compile`)
- Frontend buildando sem erros (`npm run build`)
- Existência de pelo menos 1 orçamento criado na base (ex: ID 1)

## Validation Scenarios

### Cenário 1: Converter Orçamento em Pedido de Venda

```bash
# Converter orçamento ID 1 em pedido de venda
curl -s -X POST http://localhost:8080/api/orders/from-budget/1 \
  -H "Content-Type: application/json" \
  -d '{
    "canalAprovacao": "WHATSAPP",
    "dataPrevisaoEntrega": "2026-09-11",
    "observacoes": "Aprovado via áudio do cliente"
  }'

# Resultado esperado:
# - HTTP 201 Created
# - Código do pedido gerado (ex: PED-2026-0001)
# - Status inicial: AGUARDANDO_PRODUCAO
# - Orçamento ID 1 passa para status APROVADO
```

### Cenário 2: Validação de Lock de Preços (Imutabilidade)

```bash
# 1. Obter valor atual do pedido
curl -s http://localhost:8080/api/orders/1

# 2. Alterar o preço de um material base ou produto no catálogo
# 3. Consultar novamente o pedido
curl -s http://localhost:8080/api/orders/1

# Resultado esperado: Todos os itens do pedido e valores totais permanecem 100% idênticos
```

### Cenário 3: Tentativa de Conversão Duplicada

```bash
curl -s -X POST http://localhost:8080/api/orders/from-budget/1 \
  -H "Content-Type: application/json" \
  -d '{"canalAprovacao": "PRESENCIAL", "dataPrevisaoEntrega": "2026-09-11"}'

# Resultado esperado: HTTP 400 Bad Request com mensagem "Orçamento já convertido em pedido de venda"
```

### Cenário 4: Cancelar Pedido com Justificativa

```bash
curl -s -X PATCH http://localhost:8080/api/orders/1/cancel \
  -H "Content-Type: application/json" \
  -d '{"justificativa": "Cliente desistiu da obra por motivos financeiros"}'

# Resultado esperado: HTTP 200 OK com status CANCELADO e justificativa gravada
```

### Cenário 5: Download do Comprovante do Pedido em PDF

```bash
curl -s -o comprovante-pedido.pdf http://localhost:8080/api/orders/1/pdf/comprovante

# Resultado esperado: PDF válido baixado contendo número PED-2026-0001, dados da Alumiportas, itens e prazos
```

## Quality Gate Checklist

- [ ] `mvn clean verify` executado sem erros
- [ ] `npm run build` executado sem erros
- [ ] Testes unitários do `OrderService` cobrindo conversão, lock de preços e cancelamento
- [ ] Teste de geração do PDF de comprovante
- [ ] SonarQube Quality Gate aprovado
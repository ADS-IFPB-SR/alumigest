# Quickstart Validation Guide: Sprint 07 — Gestão Fabril: Etiquetas de Identificação de Peças & Painel Kanban de Produção

**Feature**: `003-etiquetas-kanban-producao`  
**Período da Sprint 07**: 13/10/2026 a 27/10/2026  
**Status**: APPROVED  

## Pré-requisitos

1. Backend Spring Boot rodando na porta 8080 (`mvn spring-boot:run` ou pela IDE).
2. Frontend Vite rodando na porta 5173 (`npm run dev`).
3. Existência de pelo menos 1 Pedido de Venda criado e em status `AGUARDANDO_PRODUCAO` com itens associados (ex: ID `c1f7a0b5-7c91-4d3e-9081-3e4b7b209a81` ou gerado via conversão de orçamento).

---

## Cenários de Validação Técnica e Funcional

### Cenário 1: Emissão e Download de Etiquetas Térmicas (100x50 mm)

```bash
# 1. Solicitar o PDF de etiquetas para o pedido
curl -s -o /tmp/etiquetas_teste.pdf -w "%{http_code}\n" \
  http://localhost:8080/api/orders/{orderId}/labels-pdf

# Resultado esperado:
# - HTTP 200 OK
# - Arquivo PDF gerado em /tmp/etiquetas_teste.pdf
# - Tamanho das páginas: 100 x 50 mm (283.46 x 141.73 pt)
# - Quantidade de páginas igual à soma de unidades físicas dos itens do pedido
```

### Cenário 2: Consulta dos Pedidos para o Quadro Kanban

```bash
# 1. Buscar pedidos nos estágios de fabricação
curl -s "http://localhost:8080/api/orders?status=AGUARDANDO_PRODUCAO" | jq .

# Resultado esperado:
# - HTTP 200 OK
# - Lista de pedidos retornados contendo código, clienteNome, dataPrevisaoEntrega e status
```

### Cenário 3: Transição para Início de Produção (`AGUARDANDO_PRODUCAO` ➔ `EM_PRODUCAO`)

```bash
# 1. Mover o pedido para a esteira de fabricação
curl -s -X PATCH http://localhost:8080/api/orders/{orderId}/production-status \
  -H "Content-Type: application/json" \
  -d '{"status": "EM_PRODUCAO"}' | jq .

# Resultado esperado:
# - HTTP 200 OK
# - Campo "status" atualizado para "EM_PRODUCAO"
# - Campo "dataConclusao" permanece null
```

### Cenário 4: Conclusão da Produção com Registro Automático da Data (`EM_PRODUCAO` ➔ `CONCLUIDO`)

```bash
# 1. Finalizar a fabricação do pedido
curl -s -X PATCH http://localhost:8080/api/orders/{orderId}/production-status \
  -H "Content-Type: application/json" \
  -d '{"status": "CONCLUIDO"}' | jq .

# Resultado esperado:
# - HTTP 200 OK
# - Campo "status" atualizado para "CONCLUIDO"
# - Campo "dataConclusao" preenchido com a data atual (ex: "2026-10-14")
```

### Cenário 5: Bloqueio de Transição Inválida

```bash
# 1. Tentar reabrir o pedido concluído ou pular etapas
curl -s -X PATCH http://localhost:8080/api/orders/{orderId}/production-status \
  -H "Content-Type: application/json" \
  -d '{"status": "AGUARDANDO_PRODUCAO"}' | jq .

# Resultado esperado:
# - HTTP 422 Unprocessable Entity
# - Mensagem de erro amigável informando que a transição fabril não é permitida
```

---

## Validação Visual no Frontend

1. **Botão de Etiquetas**:
   - Acessar `http://localhost:5173/pedidos/:id`.
   - Localizar o botão **"Imprimir Etiquetas"** na barra de ações superior.
   - Clicar e verificar que o download do arquivo `etiquetas-PED-YYYY-NNNN.pdf` é disparado imediatamente.
2. **Painel Kanban**:
   - Acessar o item **"Produção (Kanban)"** no menu lateral (`/producao`).
   - Verificar as 3 colunas: Aguardando Produção, Em Produção e Concluído.
   - Testar o avanço de um card clicando em "Iniciar Produção" e depois em "Concluir Produção".
   - Confirmar o cálculo correto do badge de prazo (verde se > 3 dias, amarelo se 0-3 dias, vermelho se atrasado).

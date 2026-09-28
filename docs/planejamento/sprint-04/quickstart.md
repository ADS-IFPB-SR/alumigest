# Quickstart Validation Guide: Sprint 4 — Descontos, PDF e Homologação R1

**Feature**: `001-orcamento-descontos-pdf`
**Date**: 2026-08-27

## Prerequisites

- Docker e Docker Compose rodando (PostgreSQL)
- Java JDK 21 LTS
- Node.js 20 LTS
- Backend compilando sem erros (`mvn clean compile`)
- Frontend buildando sem erros (`npm run build`)
- Migrations Flyway aplicadas (V1 a V8)
- Logotipo da Alumiportas em `backend/src/main/resources/static/logo-alumiportas.png`

## Setup

```bash
# 1. Subir containers
docker compose up -d

# 2. Backend
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# 3. Frontend
cd frontend
npm install
npm run dev
```

## Validation Scenarios

### Cenário 1: Criar Orçamento e Adicionar Itens

```bash
# Criar orçamento rascunho
curl -s -X POST http://localhost:8080/api/budgets \
  -H "Content-Type: application/json" \
  -d '{"clienteNome":"João Silva","clienteTelefone":"(83)99999-0000"}'

# Resultado esperado: 201 Created com código ORC-2026-0001 e status RASCUNHO

# Adicionar item
curl -s -X POST http://localhost:8080/api/budgets/1/items \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Janela 2F Correr","larguraMm":1200,"alturaMm":1000,"quantidade":2,"corAluminio":"Branco","tipoVidro":"Temperado 8mm","orientacaoAbertura":"CORRER","valorUnitario":450.00}'

# Resultado esperado: 201 Created, valorBruto do orçamento atualizado para 900.00
```

### Cenário 2: Aplicar Desconto Percentual e Verificar Recálculo

```bash
curl -s -X PUT http://localhost:8080/api/budgets/1/discount \
  -H "Content-Type: application/json" \
  -d '{"tipoDesconto":"PERCENTUAL","valor":10.00,"condicaoPagamento":"ENTRADA_50_SALDO_ENTREGA","dataValidade":"2026-09-11"}'

# Resultado esperado:
# - valorBruto: 900.00
# - percentualDesconto: 10.00
# - valorDesconto: 90.00
# - valorLiquido: 810.00
```

### Cenário 3: Validação de Desconto Inválido

```bash
# Desconto > 100%
curl -s -X PUT http://localhost:8080/api/budgets/1/discount \
  -H "Content-Type: application/json" \
  -d '{"tipoDesconto":"PERCENTUAL","valor":150.00}'

# Resultado esperado: 400 Bad Request com mensagem de validação em português
```

### Cenário 4: Gerar PDF Comercial

```bash
curl -s -o orcamento-comercial.pdf http://localhost:8080/api/budgets/1/pdf/comercial

# Resultado esperado:
# - Arquivo PDF válido gerado
# - Cabeçalho com logo Alumiportas
# - Dados do cliente, itens com valores, desconto, total líquido
# - Condição de pagamento e validade
```

### Cenário 5: Gerar PDF Técnico (Oficina)

```bash
curl -s -o orcamento-tecnico.pdf http://localhost:8080/api/budgets/1/pdf/tecnico

# Resultado esperado:
# - PDF válido sem NENHUM valor em R$
# - Medidas, cor do alumínio, tipo de vidro, lado de abertura e ferragens presentes
```

### Cenário 6: Obter Resumo WhatsApp

```bash
curl -s http://localhost:8080/api/budgets/1/resumo-whatsapp

# Resultado esperado: Texto formatado com emojis e informações do orçamento
```

### Cenário 7: Frontend — Fluxo Completo

1. Acessar `/orcamentos/novo`
2. Preencher dados do cliente
3. Adicionar itens de esquadrias com medidas e cores
4. Aplicar desconto (10%)
5. Selecionar condição de pagamento na lista suspensa
6. Clicar em "Emitir PDF Comercial" → verificar download do PDF
7. Clicar em "Emitir Via Técnica" → verificar PDF sem valores
8. Clicar em "Copiar para WhatsApp" → verificar texto na área de transferência

## Automated Tests

```bash
# Backend — testes unitários e integração
cd backend
./mvnw clean verify

# Frontend — build de validação
cd frontend
npm run build
```

### Expected Test Coverage

- `BudgetService`: Testes de criação, desconto (percentual/fixo), validações, transições de status
- `BudgetPdfService`: Teste de geração de PDF comercial (verificar bytes não-vazios e content-type)
- `BudgetPdfService`: Teste de geração de PDF técnico (verificar ausência de valores monetários no texto extraído)
- `BudgetController`: Testes de integração dos endpoints REST
- `DiscountCalculator`: Testes de arredondamento com BigDecimal HALF_EVEN

## Quality Gate Checklist

- [ ] `mvn clean verify` sem falhas
- [ ] `npm run build` sem erros
- [ ] SonarQube Quality Gate aprovado (0 bugs, 0 vulnerabilities, 0 code smells blocker/critical)
- [ ] PDF Comercial renderiza corretamente com dados reais
- [ ] PDF Técnico não exibe nenhum valor em R$
- [ ] Texto WhatsApp formatado corretamente
- [ ] Fluxo E2E funcional no navegador
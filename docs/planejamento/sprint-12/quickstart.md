# Quickstart Validation Guide: Sprint 12 — Instalações e Ordens de Serviço (OS)

**Feature**: `009-instalacoes-ordens-servico`
**Date**: 2026-08-27

## Prerequisites

- PostgreSQL rodando com migrations até V15 aplicadas
- Backend e Frontend rodando
- Existência de 1 Pedido pronto para instalação (ex: ID 1)

## Validation Scenarios

### Cenário 1: Agendar Instalação e Criar OS

```bash
curl -s -X POST http://localhost:8080/api/installation/service-orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "installationTeamId": 1,
    "dataAgendamento": "2026-09-22",
    "turno": "MANHA",
    "enderecoInstalacao": "Rua das Flores, 123",
    "observacoes": "Instalação de 2 janelas e 1 porta"
  }'

# Resultado esperado: HTTP 201 Created com código OS-2026-0001 e status AGENDADA
```

### Cenário 2: Consultar Agenda no Formato Calendário

```bash
curl -s "http://localhost:8080/api/installation/service-orders/calendar?mes=9&ano=2026"

# Resultado esperado: HTTP 200 OK com array de eventos de instalação por equipe
```

### Cenário 3: Concluir OS e Baixar PDF

```bash
# Concluir OS
curl -s -X PATCH http://localhost:8080/api/installation/service-orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "CONCLUIDA", "recebidoPorNome": "Dr. Marcos"}'

# Baixar PDF
curl -s -o os-instalacao.pdf http://localhost:8080/api/installation/service-orders/1/pdf
```
# Research: Sprint 12 — Instalações e Ordens de Serviço (OS)

**Feature**: `009-instalacoes-ordens-servico`
**Date**: 2026-08-27

## R1: Armazenamento e Upload de Fotos de Campo

### Decision: Armazenamento local no filesystem (`uploads/service-orders/`) com link estático servido pela API

**Rationale**:
- Evita complexidade de dependência de S3/Cloud storage nesta fase e funciona perfeitamente em deployments locais/Docker.
- Salva o hash/nome do arquivo na tabela `service_order_photos`.

## R2: Detecção de Conflitos de Agenda

### Decision: Consulta JPQL verificando `data_agendamento` e `turno` para a mesma `installation_team_id`

**Rationale**:
- Retorna um flag `temConflito` e lista de avisos no DTO para orientar a interface sem travar a persistência caso o gestor queira alocar duas obras pequenas no mesmo turno.

## R3: Nova Migration Flyway

### Decision: `V15__create_service_orders_schema.sql`

**Rationale**:
- Cria as tabelas `installation_teams`, `service_orders` e `service_order_photos`.
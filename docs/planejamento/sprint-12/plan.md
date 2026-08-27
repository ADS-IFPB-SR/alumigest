# Implementation Plan: Sprint 12 — Instalações e Ordens de Serviço (OS)

**Branch**: `009-instalacoes-ordens-servico` | **Date**: 2026-08-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/009-instalacoes-ordens-servico/spec.md`

## Summary

Implementar a gestão de Ordens de Serviço de Instalação (`ServiceOrder`), cadastro de equipes (`InstallationTeam`), visualização de agenda em calendário mensal/semanal, acompanhamento de campo no PWA com upload de fotos de evidência e emissão da OS em PDF via OpenPDF.

## Technical Context

**Language/Version**: Java 21 LTS + TypeScript / React 19

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2, Spring Data JPA, OpenPDF 2.0.3
- Frontend: React 19, FullCalendar / React Big Calendar (ou componente custom de grid), Tailwind CSS

**Storage**: PostgreSQL 16+ (Migration `V15__create_service_orders_schema.sql`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Package-by-Feature | ✅ PASS | Módulo `installation` completo |
| I. DTOs em Records Java | ✅ PASS | `ServiceOrderCreateRequest`, `ServiceOrderResponse`, etc. |
| II. Test-First | ✅ PASS | Testes unitários do validador de conflito e agendamento |
| IV. Commits em PT-BR | ✅ PASS | Conventional Commits em português |

## Project Structure

### Backend

```text
backend/src/main/java/br/edu/ifpb/alumigest/installation/
├── controller/
│   ├── ServiceOrderController.java             # Endpoints de OS e upload
│   └── InstallationTeamController.java         # CRUD de equipes
├── service/
│   ├── ServiceOrderService.java                # Lógica de agendamento e transições
│   ├── CalendarService.java                    # Agrupamento de eventos para calendário
│   └── ServiceOrderPdfService.java             # Geração de PDF da OS
├── repository/
│   ├── ServiceOrderRepository.java
│   ├── InstallationTeamRepository.java
│   └── ServiceOrderPhotoRepository.java
├── domain/
│   ├── ServiceOrder.java
│   ├── InstallationTeam.java
│   └── ServiceOrderPhoto.java
├── dto/
│   ├── ServiceOrderCreateRequest.java
│   ├── ServiceOrderResponse.java
│   └── CalendarEventResponse.java
└── mapper/
    └── ServiceOrderMapper.java
```

### Frontend

```text
frontend/src/features/installation/
├── components/
│   ├── InstallationCalendar.tsx                # Grid visual de calendário mensal/semanal
│   ├── ServiceOrderModal.tsx                   # Modal de agendamento
│   ├── FieldExecutionModal.tsx                 # Modal PWA de conclusão com fotos
│   └── ServiceOrderStatusBadge.tsx
└── pages/
    ├── InstallationCalendarPage.tsx            # Tela principal de instalações
    └── ServiceOrderDetailPage.tsx              # Detalhes da OS
```
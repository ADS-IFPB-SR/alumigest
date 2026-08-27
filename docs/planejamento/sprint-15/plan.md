# Implementation Plan: Sprint 15 — Treinamento, Carga Real e Homologação R3

**Branch**: `012-treinamento-carga-homologacao-r3` | **Date**: 2026-08-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/012-treinamento-carga-homologacao-r3/spec.md`

## Summary

Implementar a carga de dados de produção (migration V16 com catálogo de perfis, vidros e estoque inicial), importador de clientes em CSV, manuais operacionais por papel em PDF via OpenPDF e Central de Ajuda no frontend, concluindo o ciclo da Release 3 (v3.0.0).

## Technical Context

**Language/Version**: Java 21 LTS + TypeScript / React 19

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2, Flyway, OpenPDF 2.0.3
- Frontend: React 19, Lucide React, Tailwind CSS

**Storage**: PostgreSQL 16+ (Migration `V16__seed_initial_production_data.sql`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Package-by-Feature | ✅ PASS | Módulo `onboarding` isolado |
| I. DTOs em Records Java | ✅ PASS | `ClientImportSummaryResponse`, etc. |
| II. Test-First | ✅ PASS | Roteiro E2E de homologação e testes unitários |
| IV. Commits em PT-BR | ✅ PASS | Conventional Commits em português |

## Project Structure

### Backend

```text
backend/src/main/resources/db/migration/
└── V16__seed_initial_production_data.sql       # Carga real de perfis, vidros e estoque

backend/src/main/java/br/edu/ifpb/alumigest/onboarding/
├── controller/
│   └── OnboardingController.java               # Endpoints de importação CSV e manuais PDF
├── service/
│   ├── ClientCsvImportService.java             # Processamento e validação de CSV
│   └── OperationalManualPdfService.java        # Geração de manuais em PDF por perfil
└── dto/
    └── ClientImportSummaryResponse.java
```

### Frontend

```text
frontend/src/features/onboarding/
├── components/
│   ├── HelpCenterModal.tsx                     # Central de ajuda com links para manuais
│   ├── CsvClientImportModal.tsx                # Modal de upload de planilha de clientes
│   └── OnboardingTour.tsx                      # Tour rápido de boas-vindas
└── pages/
    └── HelpCenterPage.tsx                      # Página central de suporte e manuais
```
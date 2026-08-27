# Implementation Plan: Sprint 7 — Lista de Corte e Ficha Técnica de Montagem

**Branch**: `004-lista-corte-ficha-montagem` | **Date**: 2026-08-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-lista-corte-ficha-montagem/spec.md`

## Summary

Implementar a geração e emissão do Romaneio Consolidado de Corte por Pedido e da Ficha Técnica de Montagem por Ordem de Produção (OP), exibindo medidas nominais (LxA mm), cores dos perfis, especificações de vidros, orientações de abertura e listas de ferragens, com suporte a PDF para prancheta de oficina com checkboxes de visto manual.

## Technical Context

**Language/Version**: Java 21 LTS + TypeScript / React 19

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2, OpenPDF 2.0.3, Spring Data JPA
- Frontend: React 19, TanStack Query, Tailwind CSS, Lucide React

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Package-by-Feature | ✅ PASS | Módulo `production` estendido com serviços de romaneio e ficha técnica |
| I. DTOs em Records Java | ✅ PASS | `CuttingListResponse`, `AssemblySheetResponse` |
| II. Test-First | ✅ PASS | Testes unitários do gerador de romaneio e testes de PDF |
| IV. Commits em PT-BR | ✅ PASS | Conventional Commits em português |

## Project Structure

### Backend

```text
backend/src/main/java/br/edu/ifpb/alumigest/production/
├── controller/
│   └── ProductionReportController.java         # Endpoints de romaneio e ficha técnica
├── service/
│   ├── CuttingListService.java                 # Montagem dos DTOs de romaneio e ficha
│   └── WorkshopPdfService.java                 # Geração do PDF A4 de oficina com OpenPDF
├── dto/
│   ├── CuttingListResponse.java                # Record consolidado
│   ├── CuttingItemDTO.java                     # Item de corte
│   └── AssemblySheetResponse.java              # Record ficha técnica
```

### Frontend

```text
frontend/src/features/production/
├── components/
│   ├── CuttingListModal.tsx                    # Modal com tabela de romaneio de corte
│   └── AssemblySheetView.tsx                   # Card/Aba com detalhes de montagem da peça
├── services/
│   └── (estendido em productionApi.ts)
```
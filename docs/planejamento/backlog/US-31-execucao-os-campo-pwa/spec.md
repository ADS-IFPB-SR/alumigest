# Especificação Funcional: US-31 — Executar e Concluir OS em Campo com Registro Fotográfico (PWA)

**Identificador**: `US-31`  
**Issue GitHub**: [#156](https://github.com/ADS-IFPB-SR/alumigest/issues/156)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Execução de Ordens de Serviço (OS) em campo via dispositivo móvel com registro fotográfico antes e depois da instalação.

---

## 📋 Sub-Tarefas / Issues Vinculadas (11 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-31.1-criar-package-br-edu-ifpb-alumigest-installat/issue.md) | Criar package `br.edu.ifpb.alumigest.installation` e diretório `frontend/src/features/installation` | 🔲 No Backlog |
| [US](issues/US-31.10-criar-modal-fieldexecutionmodal-no-frontend-c/issue.md) | Criar modal `FieldExecutionModal` no frontend com upload de câmera do celular em `frontend/src/features/installation/components/FieldExecutionModal.tsx` | 🔲 No Backlog |
| [US](issues/US-31.11-criar-testes-unitarios-do-serviceorderservice/issue.md) | Criar testes unitários do `ServiceOrderServiceTest` | 🔲 No Backlog |
| [US](issues/US-31.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql` com tabelas `installation_teams`service_orders` e `service_order_photos` | 🔲 No Backlog |
| [US](issues/US-31.3-criar-enums-serviceorderstatus-shifttype-e-te/issue.md) | Criar enums `ServiceOrderStatus`ShiftType` e `TeamType` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/` | 🔲 No Backlog |
| [US](issues/US-31.4-criar-entidades-jpa-installationteam-serviceo/issue.md) | Criar entidades JPA `InstallationTeam`ServiceOrder` e `ServiceOrderPhoto` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/domain/` | 🔲 No Backlog |
| [US](issues/US-31.5-criar-repositorios-serviceorderrepository-ins/issue.md) | Criar repositórios `ServiceOrderRepository`InstallationTeamRepository` e `ServiceOrderPhotoRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/repository/` | 🔲 No Backlog |
| [US](issues/US-31.6-criar-mapper-mapstruct-serviceordermapper-em-/issue.md) | Criar mapper MapStruct `ServiceOrderMapper` em `backend/src/main/java/br/edu/ifpb/alumigest/installation/mapper/ServiceOrderMapper.java` | 🔲 No Backlog |
| [US](issues/US-31.7-criar-record-serviceorderstatusupdaterequest-/issue.md) | Criar record `ServiceOrderStatusUpdateRequest` e `ServiceOrderPhotoResponse` | 🔲 No Backlog |
| [US](issues/US-31.8-implementar-servico-de-upload-de-imagens-e-at/issue.md) | Implementar serviço de upload de imagens e atualização de status no `ServiceOrderService` | 🔲 No Backlog |
| [US](issues/US-31.9-criar-endpoints-patch-api-installation-servic/issue.md) | Criar endpoints PATCH /api/installation/service-orders/{id}/status e POST /api/installation/service-orders/{id}/photos no `ServiceOrderController` | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

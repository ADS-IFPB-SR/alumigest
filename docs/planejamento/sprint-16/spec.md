# Feature Specification: Sprint 16 — Estabilização pós-implantação, Contingência e Documentação Final

**Feature**: `013-estabilizacao-contingencia-final`
**Release**: Sprint de Reserva / Governança & Estabilização
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Com a Release 3 entregue e em operação na Alumiportas, esta sprint de reserva e sustentação garante a blindagem operacional, segurança contra perda de dados e governança a longo prazo:
1. **Rotinas de Backup Automático & Plano de Contingência**: Execução de backups diários compactados do PostgreSQL às 02h00 com retenção de 30 dias, botão de backup manual e script de restauração rápida em 1 comando (Disaster Recovery em menos de 10 minutos).
2. **Trilha de Auditoria (Audit Trail)**: Registro imutável de operações sensíveis (alteração de preços/tabelas, descontos, cancelamento de pedidos, baixas manuais e exclusões).
3. **Monitoramento e Observabilidade**: Métricas de saúde com Spring Boot Actuator, verificação de conexões e espaço em disco.
4. **Documentação Arquitetural e Runbook**: Diagramas de arquitetura, dicionário de dados consolidado e guia passo a passo de contingência.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-44: Executar Rotinas de Backup Automático e Disaster Recovery em 1 Comando

> Rotinas agendadas de backup diário compactado do PostgreSQL com retenção de 30 dias e script de restauração em menos de 10 minutos.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-44.1**: Criar package `br.edu.ifpb.alumigest.admin` e diretório `frontend/src/features/admin`
- **US-44.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V17__create_audit_and_backup_schema.sql` com tabelas `audit_logs` e `system_backups`
- **US-44.3**: Criar entidades JPA `AuditLog` e `SystemBackup` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/domain/`
- **US-44.4**: Criar repositórios `AuditLogRepository` e `SystemBackupRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/repository/`
- **US-44.5**: Criar record `SystemBackupResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/dto/SystemBackupResponse.java`
- **US-44.6**: Implementar serviço `SystemBackupService.gerarBackup()` com `ProcessBuilder` e retenção de 30 dias em `backend/src/main/java/br/edu/ifpb/alumigest/admin/service/SystemBackupService.java`
- **US-44.7**: Configurar rotina agendada `@Scheduled(cron = "0 0 2 * * *")` para backup na madrugada
- **US-44.8**: Criar endpoints POST /api/admin/backups/generate e GET /api/admin/backups/{id}/download no `SystemBackupController` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/controller/SystemBackupController.java`
- **US-44.9**: Criar script de restauração rápida `scripts/restore-backup.sh` e `scripts/restore-backup.ps1`
- **US-44.10**: Criar testes unitários do `SystemBackupServiceTest`

### 📌 US-45: Registrar Trilha de Auditoria Imutável para Ações Críticas

> Registro imutável de eventos sensíveis (alteração de tabelas de preços, descontos, cancelamento de pedidos, baixas manuais).

#### Sub-tarefas Técnicas (Sub-issues):
- **US-45.1**: Criar anotação customizada `@AuditAction(acao, entidade)` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/annotation/AuditAction.java`
- **US-45.2**: Implementar interceptor AOP `AuditAspect` capturando usuário logado e persistindo em `AuditLogService`
- **US-45.3**: Criar record `AuditLogResponse`
- **US-45.4**: Criar endpoint GET /api/admin/audit-logs no `AuditLogController`
- **US-45.5**: Criar testes unitários do `AuditAspectTest`
- **US-45.6**: Criar componente `AuditLogTable` no frontend com filtros por entidade e data
- **US-45.7**: Criar página `AuditLogsPage` no frontend

### 📌 US-46: Monitorar Saúde do Sistema com Actuator e Publicar Documentação Final

> Endpoints de métricas de saúde com Spring Boot Actuator, dicionário de dados consolidado e runbook de operações da sustentação.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-46.1**: Configurar Spring Boot Actuator no `pom.xml` e `application.yml`
- **US-46.2**: Criar componente `SystemHealthBadge` e tela `SystemSettingsPage` no frontend
- **US-46.3**: Criar Runbook de Contingência e Guia de Disaster Recovery em `docs/arquitetura/disaster-recovery.md`
- **US-46.4**: Criar Diagrama C4 Model consolidado da arquitetura do AlumiGest em `docs/arquitetura/c4-model.md`
- **US-46.5**: Documentar endpoints no OpenAPI/Swagger
- **US-46.6**: Atualizar mapa mestre de governança e documentação em `docs/planejamento/README.md`

## 3. Requisitos Funcionais

1. **RF01 - Agendador de Backup Diário**: `@Scheduled(cron = "0 0 2 * * *")` executando `pg_dump` compactado.
2. **RF02 - Tabela e Aspect de Auditoria**: `@AuditAction` interceptando métodos sensíveis e persistindo em `audit_logs`.
3. **RF03 - Script de Restore Automatizado**: Script `restore-backup.sh / restore-backup.ps1` com 1 comando.
4. **RF04 - Painel Administrativo no Frontend**: Tela de visualização de logs de auditoria e lista de backups para download.
5. **RF05 - Actuator & Métricas**: Exposição segura de `/actuator/health` e `/actuator/metrics`.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Backups)**: Backup diário automático na madrugada (retenção de 30 dias) + botão manual no painel.
- **Q2 (Auditoria)**: Registro detalhado de operações críticas (preços, descontos, cancelamentos, baixas e exclusões).
- **Q3 (Disaster Recovery)**: Script automatizado de restore com 1 comando + Runbook ilustrado.
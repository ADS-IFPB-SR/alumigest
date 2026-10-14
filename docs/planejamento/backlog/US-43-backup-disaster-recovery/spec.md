# Especificação Funcional: US-43 — Executar Rotinas de Backup Automático e Disaster Recovery

**Identificador**: `US-43`  
**Issue GitHub**: [#168](https://github.com/ADS-IFPB-SR/alumigest/issues/168)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como administrador de infraestrutura da Alumiportas, desejo que o sistema execute rotinas agendadas automáticas de backup do banco de dados PostgreSQL com controle de integridade (SHA-256), política de retenção de 30 dias e scripts validados de recuperação de desastres (*Disaster Recovery*), garantindo a continuidade do negócio e a salvaguarda de todas as ordens de serviço e dados financeiros contra falhas físicas ou corrupção de dados.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Execução Automática da Rotina Noturna de Backup Agendado**
  - **Dado que** o relógio do sistema atinge às `02:00:00` da madrugada,
  - **Quando** a anotação `@Scheduled(cron = "0 0 2 * * *")` do Spring dispara o `SystemBackupService`,
  - **Então** o serviço invoca o utilitário nativo `pg_dump` com compressão `gzip`,
  - **E** grava o arquivo no diretório seguro de backups com o padrão `alumigest-backup-YYYY-MM-DD-HHmmss.sql.gz`,
  - **E** calcula o hash SHA-256 e persiste o registro na tabela `system_backups` com `status = SUCCESS`.

- [ ] **Cenário 2: Acionamento Manual de Backup com Download pelo Painel Administrativo**
  - **Dado que** o administrador precisa realizar uma manutenção preventiva ou atualização de versão,
  - **Quando** clica no botão "Gerar Backup Agora" em `/admin/backups`,
  - **Então** o sistema executa o backup imediatamente via `POST /api/v1/admin/backups/generate`,
  - **E** disponibiliza link seguro para download imediato do arquivo gerado via `GET /api/v1/admin/backups/{id}/download`.

- [ ] **Cenário 3: Política Automática de Retenção e Expurgamento (30 Dias)**
  - **Dado que** o sistema acumula backups gerados diariamente,
  - **Quando** a rotina diária de backup é concluída,
  - **Então** o sistema varre a tabela `system_backups` e o diretório de arquivos,
  - **E** remove fisicamente os arquivos gerados com mais de 30 dias (`createdAt < now() - 30 days`), prevenindo saturação de espaço em disco no servidor.

- [ ] **Cenário 4: Procedimento de Restauração Rápida em Caso de Desastre (DR)**
  - **Dado que** ocorreu uma falha catastrófica no banco de produção,
  - **Quando** o administrador executa o script `scripts/restore-backup.sh` (Linux) ou `scripts/restore-backup.ps1` (Windows) passando o arquivo de backup e a senha do banco,
  - **Então** o script valida a integridade do hash SHA-256 do arquivo,
  - **E** restaura completamente o schema e dados do PostgreSQL em menos de 10 minutos com integridade referencial mantida.

- [ ] **Cenário 5: Tratamento de Falha no Backup com Alerta ao Administrador**
  - **Dado que** o processo do `pg_dump` falhou por falta de espaço em disco ou erro de permissão,
  - **Quando** o processo encerra com código de saída diferente de 0,
  - **Então** o sistema registra o log de erro detalhado na tabela `system_backups` com `status = FAILED`,
  - **E** emite log de nível `ERROR` com rastreabilidade para notificação imediata à equipe de TI.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Integridade Criptográfica):** Todo arquivo de backup gerado deve ter seu checksum SHA-256 calculado e registrado para validação antes de qualquer restauração.
- **RN-02 (Segurança de Execução):** O comando `pg_dump` deve ser invocado via `ProcessBuilder` parametrizado, sem interpolação direta de strings para mitigar qualquer risco de command injection.
- **RN-03 (Diretriz de Idioma em Variáveis):** Entidades, DTOs e serviços em inglês: `SystemBackup`, `system_backups`, `SystemBackupResponse`, `BackupStatus` (`SUCCESS`, `FAILED`), `fileName`, `fileSizeBytes`, `checksumSha256`, `retentionDays`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / PostgreSQL / ProcessBuilder)
- **Tabela:** `system_backups` (migration `V17__create_audit_and_backup_schema.sql`)
- **Endpoints:**
  - `POST /api/v1/admin/backups/generate` (gera backup imediato sob demanda)
  - `GET /api/v1/admin/backups` (lista histórico de backups gerados com status e tamanho)
  - `GET /api/v1/admin/backups/{id}/download` (download seguro de arquivo `.sql.gz`)
- **Scripts:** `scripts/restore-backup.sh` e `scripts/restore-backup.ps1`

### Frontend (React 19 / TanStack Query / Tailwind)
- **Componentes:**
  - `BackupManagementPage.tsx` (`/admin/backups`)
  - `BackupHistoryTable.tsx` (listagem com status, tamanho formatado e botão de download)
  - `TriggerBackupButton.tsx` (botão com confirmação e modal de progresso)

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `SystemBackupServiceTest` validando parse de parâmetros e política de expurgo de 30 dias.
- [ ] Teste de restauração em container Docker descartável validando que o dump gerado é restabelecido com 100% de integridade.
- [ ] Validação dos scripts bash e powershell de restauração.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (10 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-43.1](issues/US-43.1-criar-package-br-edu-ifpb-alumigest-admin-e-d/issue.md) | Criar package `br.edu.ifpb.alumigest.admin` e diretório `frontend/src/features/admin` | 🔲 No Backlog |
| [US-43.2](issues/US-43.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V17__create_audit_and_backup_schema.sql` com tabelas `audit_logs` e `system_backups` | 🔲 No Backlog |
| [US-43.3](issues/US-43.3-criar-entidades-jpa-auditlog-e-systembackup-e/issue.md) | Criar entidades JPA `AuditLog` e `SystemBackup` | 🔲 No Backlog |
| [US-43.4](issues/US-43.4-criar-repositorios-auditlogrepository-e-syste/issue.md) | Criar repositórios `AuditLogRepository` e `SystemBackupRepository` | 🔲 No Backlog |
| [US-43.5](issues/US-43.5-criar-record-systembackupresponse-em-backend-/issue.md) | Criar record `SystemBackupResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/dto/SystemBackupResponse.java` | 🔲 No Backlog |
| [US-43.6](issues/US-43.6-implementar-servico-systembackupservice-gerar/issue.md) | Implementar serviço `SystemBackupService.gerarBackup()` com `ProcessBuilder` e retenção de 30 dias | 🔲 No Backlog |
| [US-43.7](issues/US-43.7-configurar-rotina-agendada-scheduled-cron-0-0/issue.md) | Configurar rotina agendada `@Scheduled(cron = "0 0 2 * * *")` para backup na madrugada | 🔲 No Backlog |
| [US-43.8](issues/US-43.8-criar-endpoints-post-api-admin-backups-genera/issue.md) | Criar endpoints POST `/api/v1/admin/backups/generate` e GET `/api/v1/admin/backups/{id}/download` | 🔲 No Backlog |
| [US-43.9](issues/US-43.9-criar-script-de-restauracao-rapida-scripts-re/issue.md) | Criar script de restauração rápida `scripts/restore-backup.sh` e `scripts/restore-backup.ps1` | 🔲 No Backlog |
| [US-43.10](issues/US-43.10-criar-testes-unitarios-do-systembackupservice/issue.md) | Criar testes unitários do `SystemBackupServiceTest` | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-43-backup-disaster-recovery`

# Feature Specification: Sprint 16 — Estabilização pós-implantação, Contingência e Documentação Final

**Feature**: `013-estabilizacao-contingencia-final`  
**Release**: Sprint de Reserva / Governança & Estabilização  
**Created**: 2026-08-27  
**Updated**: 2026-09-23  
**Status**: APPROVED (Esclarecimentos Resolvidos — Padrão BDD Gherkin)  

---

## 1. Visão Geral & Contexto de Negócio

Com a Release 3 entregue e em operação na Alumiportas, esta sprint de reserva e sustentação garante a blindagem operacional, segurança contra perda de dados e governança a longo prazo:
1. **Rotinas de Backup Automático & Plano de Contingência**: Execução de backups diários compactados do PostgreSQL às 02h00 com retenção de 30 dias, botão de backup manual e script de restauração rápida em 1 comando (Disaster Recovery em menos de 10 minutos).
2. **Trilha de Auditoria (Audit Trail)**: Registro imutável de operações sensíveis (alteração de preços/tabelas, descontos, cancelamento de pedidos, baixas manuais e exclusões).
3. **Monitoramento e Observabilidade**: Métricas de saúde com Spring Boot Actuator, verificação de conexões e espaço em disco.
4. **Documentação Arquitetural e Runbook**: Diagramas de arquitetura, dicionário de dados consolidado e guia passo a passo de contingência.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-43: Executar Rotinas de Backup Automático e Disaster Recovery em 1 Comando

#### 🎯 Objetivo de Negócio
> **Como** administrador de infraestrutura e diretor da Alumiportas,  
> **Desejo** que o sistema execute rotinas automáticas de backup diário compactado do banco de dados PostgreSQL com retenção de 30 dias, permita a emissão de backups manuais sob demanda e forneça scripts automatizados de restauração rápida,  
> **Para que** a empresa esteja 100% protegida contra falhas de hardware, corrupção de dados ou ataques cibernéticos, restabelecendo as operações fabris e comerciais em menos de 10 minutos.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Execução programada do backup diário na madrugada**
  - **Dado que** o servidor da aplicação está em execução com agendamento ativo
  - **Quando** o relógio do sistema atingir 02:00:00 da madrugada (`0 0 2 * * *`)
  - **Então** o serviço `SystemBackupService` aciona o utilitário nativo `pg_dump` via `ProcessBuilder`
  - **E** gera um arquivo de dump compactado com gzip no padrão `alumigest-backup-YYYY-MM-DD-HHmmss.sql.gz`
  - **E** grava um registro na tabela `system_backups` com o tamanho do arquivo, tempo de execução e status `SUCESSO`.

- [ ] **Cenário 2: Emissão manual de backup sob demanda no painel administrativo**
  - **Dado que** o administrador precisa aplicar uma atualização crítica ou manutenção preventiva
  - **Quando** ele clica no botão "Gerar Backup Agora" na tela de configurações ou envia `POST /api/admin/backups/generate`
  - **Então** o sistema executa o processo de backup imediatamente
  - **E** disponibiliza o arquivo gerado para download com status HTTP `201 Created`
  - **E** exibe feedback visual toast de confirmação.

- [ ] **Cenário 3: Purga automática de arquivos com retenção de 30 dias**
  - **Dado que** existem arquivos de backup gerados há mais de 30 dias corridos no diretório de armazenamento
  - **Quando** o serviço de backup conclui a rotina diária
  - **Então** o sistema localiza e exclui compulsoriamente os arquivos com data anterior à janela de retenção
  - **E** remove os registros obsoletos da tabela `system_backups`, preservando o espaço em disco do servidor.

- [ ] **Cenário 4: Execução do script de restauração rápida (Disaster Recovery)**
  - **Dado que** ocorreu um incidente que exige a restauração da base a partir do último backup
  - **Quando** o operador de TI executa o script `./scripts/restore-backup.sh <arquivo.sql.gz>` (ou PowerShell `.ps1`)
  - **Então** o script descompacta o arquivo, encerra conexões ativas com o banco e restaura a base em um único comando
  - **E** conclui o procedimento completo em tempo inferior a 10 minutos.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Janela de Execução Silenciosa)**: Backups automáticos ocorrem no horário de menor tráfego (02h00) sem bloquear consultas de leitura do sistema.
- **RN-02 (Política de Retenção Rígida)**: Backups são mantidos por exatamente 30 dias; versões anteriores são removidas para evitar saturação do storage.
- **RN-03 (Restrição Administrativa RBAC)**: Somente usuários com permissão `ROLE_ADMIN` podem gerar, baixar ou restaurar backups do sistema.

#### 🔌 Especificação Técnica
- **Backend**:
  - `SystemBackupService`: Orquestrador com `ProcessBuilder` executando `pg_dump` e compressão gzip.
  - `@Scheduled(cron = "0 0 2 * * *")`.
  - `SystemBackupController`: Endpoints `POST /api/admin/backups/generate` e `GET /api/admin/backups/{id}/download`.
  - Scripts: `scripts/restore-backup.sh` e `scripts/restore-backup.ps1`.
  - Testes unitários com JUnit 5.
- **Frontend**:
  - `SystemSettingsPage.tsx`: Painel com lista de backups, tamanho, data de geração e botão de download.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-43.1**: Criar package `br.edu.ifpb.alumigest.admin` e diretório `frontend/src/features/admin`
- **US-43.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V17__create_audit_and_backup_schema.sql` com tabelas `audit_logs` e `system_backups`
- **US-43.3**: Criar entidades JPA `AuditLog` e `SystemBackup` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/domain/`
- **US-43.4**: Criar repositórios `AuditLogRepository` e `SystemBackupRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/repository/`
- **US-43.5**: Criar record `SystemBackupResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/dto/SystemBackupResponse.java`
- **US-43.6**: Implementar serviço `SystemBackupService.gerarBackup()` com `ProcessBuilder` e retenção de 30 dias em `backend/src/main/java/br/edu/ifpb/alumigest/admin/service/SystemBackupService.java`
- **US-43.7**: Configurar rotina agendada `@Scheduled(cron = "0 0 2 * * *")` para backup na madrugada
- **US-43.8**: Criar endpoints `POST /api/admin/backups/generate` e `GET /api/admin/backups/{id}/download` no `SystemBackupController` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/controller/SystemBackupController.java`
- **US-43.9**: Criar script de restauração rápida `scripts/restore-backup.sh` e `scripts/restore-backup.ps1`
- **US-43.10**: Criar testes unitários do `SystemBackupServiceTest`

---

### 📌 US-44: Registrar Trilha de Auditoria Imutável para Ações Críticas

#### 🎯 Objetivo de Negócio
> **Como** diretor executivo e encarregado de conformidade da Alumiportas,  
> **Desejo** que o sistema registre uma trilha de auditoria completa, detalhada e imutável de todas as ações operacionais críticas (alteração de tabelas de preços, aplicação de descontos elevados, cancelamento de pedidos e baixas manuais de estoque),  
> **Para que** a empresa mantenha rastreabilidade total de responsabilidades, coíba fraudes e atenda às boas práticas de governança corporativa.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Interceptação transparente via AOP e anotação `@AuditAction`**
  - **Dado que** um método de negócio sensível está anotado com `@AuditAction(acao = "ALTERACAO_PRECO", entidade = "Material")`
  - **Quando** o método for executado por um usuário autenticado
  - **Então** o aspecto Spring AOP (`AuditAspect`) intercepta a execução
  - **E** grava uma linha na tabela `audit_logs` contendo:
    1. Nome de usuário e ID do operador
    2. Endereço IP de origem e User-Agent
    3. Timestamp exato em UTC
    4. Tipo de ação e entidade afetada
    5. Snapshot JSON com o estado anterior e posterior dos dados (`dadosAntes` e `dadosDepois`).

- [ ] **Cenário 2: Consulta da Trilha de Auditoria no Frontend com Filtros**
  - **Dado que** o administrador acessa a tela `/admin/auditoria`
  - **Quando** a tabela `AuditLogTable` é renderizada
  - **Então** exibe os logs de forma cronológica decrescente
  - **E** permite filtrar por usuário, entidade (Pedido, Orçamento, Estoque, Material), tipo de ação ou intervalo de datas
  - **E** oferece botão "Ver Detalhes" abrindo modal com a comparação visual das alterações (diff).

- [ ] **Cenário 3: Imutabilidade estrita dos registros de auditoria**
  - **Dado que** registros de auditoria existem no banco de dados
  - **Quando** qualquer rotina interna ou usuário tentar atualizar (`UPDATE`) ou remover (`DELETE`) linhas de `audit_logs`
  - **Então** o sistema rejeita a operação com erro de integridade ou constraint de trigger no PostgreSQL
  - **E** a tabela opera exclusivamente em modo append-only.

- [ ] **Cenário 4: Registro de cancelamento de pedido de venda**
  - **Dado que** um pedido aprovado é cancelado com justificativa
  - **Quando** a transação de cancelamento for confirmada
  - **Então** a auditoria registra o evento `CANCELAMENTO_PEDIDO` com o motivo, saldo que foi estornado e identificador do pedido.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Tabela Append-Only)**: Nenhum registro da tabela `audit_logs` pode sofrer mutação ou deleção, preservando valor jurídico probatório.
- **RN-02 (Captura Assíncrona Não Bloqueante)**: A gravação do log de auditoria não deve impactar negativamente a latência percebida pelo usuário final na operação principal.
- **RN-03 (Privilégio de Acesso)**: Visualização dos registros de auditoria restrita exclusivamente a administradores (`ROLE_ADMIN`).

#### 🔌 Especificação Técnica
- **Backend**:
  - `@AuditAction(acao, entidade)`: Anotação customizada de método.
  - `AuditAspect`: Aspecto AOP em `@Around` ou `@AfterReturning` capturando `SecurityContextHolder` e `HttpServletRequest`.
  - Entidade `AuditLog` mapeada para `audit_logs`.
  - `AuditLogController`: Endpoint `GET /api/admin/audit-logs` com suporte a paginação e Spring Data Specifications.
- **Frontend**:
  - `AuditLogsPage.tsx` e `AuditLogTable.tsx` com visualização de diff JSON formatado.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-44.1**: Criar anotação customizada `@AuditAction(acao, entidade)` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/annotation/AuditAction.java`
- **US-44.2**: Implementar interceptor AOP `AuditAspect` capturando usuário logado e persistindo em `AuditLogService`
- **US-44.3**: Criar record `AuditLogResponse`
- **US-44.4**: Criar endpoint `GET /api/admin/audit-logs` no `AuditLogController`
- **US-44.5**: Criar testes unitários do `AuditAspectTest`
- **US-44.6**: Criar componente `AuditLogTable` no frontend com filtros por entidade e data
- **US-44.7**: Criar página `AuditLogsPage` no frontend

---

### 📌 US-45: Monitorar Saúde do Sistema com Actuator e Publicar Documentação Final

#### 🎯 Objetivo de Negócio
> **Como** equipe de engenharia e sustentação do AlumiGest,  
> **Desejo** monitorar os indicadores de integridade e métricas do sistema via Spring Boot Actuator, expor badge visual de conectividade na área administrativa e consolidar a documentação arquitetural final (C4 Model e Runbooks),  
> **Para que** a operação da plataforma seja observável proativamente e a base de conhecimento de governança esteja completa para manutenção a longo prazo.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Consulta de integridade operacional via endpoint Actuator Health**
  - **Dado que** o backend está ativo
  - **Quando** o monitor de infraestrutura ou administrador autenticado requisita `GET /actuator/health`
  - **Então** o sistema responde com status HTTP `200 OK`
  - **E** exibe o status consolidado `{"status": "UP"}` detalhando a conectividade com o banco de dados PostgreSQL, espaço livre em disco e conectividade de rede.

- [ ] **Cenário 2: Indicador visual de integridade na interface administrativa**
  - **Dado que** o administrador acessa a tela de configurações do sistema
  - **Quando** o componente `SystemHealthBadge` carrega as métricas operacionais
  - **Então** exibe um indicador verde pulsante com texto "Sistema Operacional", versão do build, tempo de atividade (uptime) e latência de banco de dados em milissegundos.

- [ ] **Cenário 3: Publicação dos Runbooks e Diagramas Arquiteturais C4 Model**
  - **Dado que** a Sprint 16 fecha o ciclo de desenvolvimento
  - **Quando** os artefatos de documentação forem verificados no repositório
  - **Então** os documentos oficiais devem estar consolidados:
    - `docs/arquitetura/disaster-recovery.md`: Procedimentos passo a passo de contingência e restauração
    - `docs/arquitetura/c4-model.md`: Diagramas de Contexto, Contêineres e Componentes da arquitetura AlumiGest
    - `docs/planejamento/README.md`: Mapa mestre de governança atualizado com todas as 45 User Stories e rastreabilidade total.

- [ ] **Cenário 4: Proteção e segurança dos endpoints de diagnóstico**
  - **Dado que** uma requisição não autenticada tenta acessar endpoints sensíveis como `/actuator/metrics` ou `/actuator/env`
  - **Quando** for processada pelo Spring Security
  - **Então** o sistema recusa o acesso com status HTTP `401 Unauthorized` ou `403 Forbidden`, protegendo as informações de infraestrutura do sistema.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Segurança do Actuator)**: Endpoints que expõem variáveis de ambiente ou dumps de threads devem ser rigorosamente restritos ou desabilitados em produção, mantendo expostos apenas `/actuator/health` e `/actuator/info`.
- **RN-02 (Governança Docs-as-Code Integral)**: Nenhuma alteração de arquitetura é finalizada sem a atualização correspondente nos diagramas C4 e no dicionário de dados.

#### 🔌 Especificação Técnica
- **Backend**:
  - `spring-boot-starter-actuator` com configurações customizadas em `application.yml` (`management.endpoints.web.exposure.include=health,info,metrics`).
  - Mapeamento de Health Indicators customizados para checagem do banco PostgreSQL e storage de uploads.
- **Frontend**:
  - `SystemHealthBadge.tsx` integrado no rodapé da área administrativa.
- **Documentação**:
  - `docs/arquitetura/disaster-recovery.md` e `docs/arquitetura/c4-model.md`.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-45.1**: Configurar Spring Boot Actuator no `pom.xml` e `application.yml`
- **US-45.2**: Criar componente `SystemHealthBadge` e tela `SystemSettingsPage` no frontend
- **US-45.3**: Criar Runbook de Contingência e Guia de Disaster Recovery em `docs/arquitetura/disaster-recovery.md`
- **US-45.4**: Criar Diagrama C4 Model consolidado da arquitetura do AlumiGest em `docs/arquitetura/c4-model.md`
- **US-45.5**: Documentar endpoints no OpenAPI/Swagger
- **US-45.6**: Atualizar mapa mestre de governança e documentação em `docs/planejamento/README.md`

---

## 3. Matriz de Rastreabilidade

| Requisito | User Story | Sub-tarefa Backend | Sub-tarefa Frontend | Testes Automatizados |
| :--- | :--- | :--- | :--- | :--- |
| Backup Automático e Restore | **US-43** | US-43.1 a US-43.8 | US-43.1 | US-43.10 (`SystemBackupServiceTest`) |
| Trilha de Auditoria | **US-44** | US-44.1 a US-44.4 | US-44.6, US-44.7 | US-44.5 (`AuditAspectTest`) |
| Monitoramento Actuator & Docs | **US-45** | US-45.1, US-45.5 | US-45.2 | Testes de Actuator, Runbooks de Operação |
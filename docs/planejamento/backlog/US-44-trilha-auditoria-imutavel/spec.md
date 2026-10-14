# Especificação Funcional: US-44 — Registrar Trilha de Auditoria Imutável para Ações Críticas

**Identificador**: `US-44`  
**Issue GitHub**: [#169](https://github.com/ADS-IFPB-SR/alumigest/issues/169)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como diretor de governança ou auditor da Alumiportas, desejo que todas as operações críticas e sensíveis no sistema (concessão de descontos manuais, cancelamento de pedidos ou O.S., ajustes manuais de estoque e estornos financeiros) sejam registradas em uma trilha de auditoria imutável com autor, endereço IP, carimbo de data/hora e valores prévios e novos (diff JSON), garantindo conformidade jurídica e transparência operacional contra fraudes.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Interceptação Automática via Aspecto AOP (`@AuditAction`)**
  - **Dado que** um vendedor concede um desconto de 15% na aprovação de um orçamento anotado com `@AuditAction(action = "DISCOUNT_APPLIED", entity = "BUDGET")`,
  - **Quando** o método do serviço executa com sucesso,
  - **Então** o `AuditAspect` captura o login do usuário autenticado no Spring Security, IP da requisição e payload,
  - **E** insere de forma assíncrona um registro na tabela `audit_logs` com os campos `oldValueJson` e `newValueJson`.

- [ ] **Cenário 2: Imutabilidade Física do Registro no Banco de Dados**
  - **Dado que** um registro de auditoria foi inserido na tabela `audit_logs`,
  - **Quando** qualquer usuário ou administrador tenta executar um `UPDATE` ou `DELETE` diretamente no banco ou via JPA,
  - **Então** a trigger de proteção do PostgreSQL (`prevent_audit_log_mutation`) dispara uma exceção bloqueando a mutação,
  - **E** assegura a preservação pericial e integridade histórica do log.

- [ ] **Cenário 3: Consulta Paginada de Logs com Filtros Combinados**
  - **Dado que** o diretor acessa a página `AuditLogsPage` (`/admin/auditoria`),
  - **Quando** aplica filtros por `entityName = "SERVICE_ORDER"`, `action = "CANCEL"` e intervalo de datas,
  - **Então** o sistema retorna a listagem paginada `Page<AuditLogResponse>`,
  - **E** exibe colunas com Timestamp, Usuário/E-mail, Entidade Afetada, Código do Registro, Ação Executada e IP de Origem.

- [ ] **Cenário 4: Visualização do Diff (Antes vs Depois) em Modal Analítico**
  - **Dado que** o auditor clica em "Ver Detalhes" de um log de alteração de preço de insumo,
  - **Quando** o modal `AuditLogDetailModal` é aberto,
  - **Então** o componente renderiza o comparativo visual destacando em vermelho os valores antigos e em verde os novos valores alterados.

- [ ] **Cenário 5: Rastreabilidade Estrita de Cancelamentos e Ajustes de Estoque**
  - **Dado que** um operador realiza uma baixa manual por quebra de barra de alumínio ou cancela uma O.S. já faturada,
  - **Quando** o sistema processa a operação,
  - **Então** exige justificativa obrigatória e vincula o motivo no campo de notas do log de auditoria correspondente.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Imutabilidade Absoluta):** Nenhum registro da tabela `audit_logs` pode ser alterado ou excluído. Operações permitidas: exclusivamente `INSERT` e `SELECT`.
- **RN-02 (Captura Não-Bloqueante):** A persistência dos logs de auditoria deve ser assíncrona (`@Async`) ou transacional integrada para não impactar o tempo de resposta das transações de negócio dos usuários.
- **RN-03 (Diretriz de Idioma em Variáveis):** Entidades, DTOs e aspectos em inglês: `AuditLog`, `audit_logs`, `AuditAction`, `AuditAspect`, `AuditLogResponse`, `actionType`, `entityName`, `entityId`, `oldValueJson`, `newValueJson`, `ipAddress`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / Spring AOP / PostgreSQL)
- **Tabela:** `audit_logs` (migration `V17__create_audit_and_backup_schema.sql`)
  - Colunas: `id`, `user_id`, `user_email`, `action_type`, `entity_name`, `entity_id`, `old_value_json`, `new_value_json`, `ip_address`, `notes`, `created_at`.
- **Anotação & Aspecto:** `@AuditAction` e `AuditAspect.java`
- **Endpoints:**
  - `GET /api/v1/admin/audit-logs?entity=...&action=...&page=...` (exige `hasRole('ADMIN')`)

### Frontend (React 19 / TanStack Query / Tailwind)
- **Páginas & Componentes:**
  - `AuditLogsPage.tsx` (`/admin/auditoria`)
  - `AuditLogTable.tsx` (grid com paginação, badges de ações e filtros)
  - `AuditLogDetailModal.tsx` (comparador visual de diff JSON)

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `AuditAspectTest` validando captura correta de contexto de segurança e metadados de métodos anotados.
- [ ] Teste de banco validando disparo da trigger de rejeição para comandos de `UPDATE` e `DELETE` em `audit_logs`.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (7 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-44.1](issues/US-44.1-criar-anotacao-customizada-auditaction-acao-e/issue.md) | Criar anotação customizada `@AuditAction(action, entity)` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/annotation/AuditAction.java` | 🔲 No Backlog |
| [US-44.2](issues/US-44.2-implementar-interceptor-aop-auditaspect-captu/issue.md) | Implementar interceptor AOP `AuditAspect` capturando usuário logado e persistindo em `AuditLogService` | 🔲 No Backlog |
| [US-44.3](issues/US-44.3-criar-record-auditlogresponse/issue.md) | Criar record `AuditLogResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/admin/dto/AuditLogResponse.java` | 🔲 No Backlog |
| [US-44.4](issues/US-44.4-criar-endpoint-get-api-admin-audit-logs-no-au/issue.md) | Criar endpoint GET `/api/v1/admin/audit-logs` no `AuditLogController` | 🔲 No Backlog |
| [US-44.5](issues/US-44.5-criar-testes-unitarios-do-auditaspecttest/issue.md) | Criar testes unitários do `AuditAspectTest` | 🔲 No Backlog |
| [US-44.6](issues/US-44.6-criar-componente-auditlogtable-no-frontend-co/issue.md) | Criar componente `AuditLogTable` no frontend com filtros por entidade e data | 🔲 No Backlog |
| [US-44.7](issues/US-44.7-criar-pagina-auditlogspage-no-frontend/issue.md) | Criar página `AuditLogsPage` no frontend | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-44-trilha-auditoria-imutavel`

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

## 2. Histórias de Usuário (User Stories)

### User Story 1 (P1) — Backup Automático e Restauração de Desastre 🎯 MVP

**Como** Administrador do AlumiGest,
**Quero** que o sistema execute backups automáticos diários e permita gerar backups manuais e restaurar com 1 comando,
**Para que** a empresa esteja 100% protegida contra perda de dados ou falhas de servidor.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Geração de backup manual
  Dado que o administrador está na tela de Configurações do Sistema
  Quando clica em "Gerar Backup Agora"
  Então o sistema executa o dump compactado do PostgreSQL (.sql.gz)
  E disponibiliza o download seguro e registra no histórico de backups
```

---

### User Story 2 (P1) — Trilha de Auditoria de Ações Críticas 🎯 MVP

**Como** Diretor da Alumiportas,
**Quero** consultar o histórico detalhado de quem concedeu descontos, cancelou pedidos ou alterou preços,
**Para que** haja governança, controle e auditoria interna em tempo real.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Auditoria de cancelamento de pedido
  Dado que um usuário cancela um pedido de venda
  Quando a ação é concluída
  Então um registro é gravado em "audit_logs" com usuário, data/hora, motivo e ID do pedido
  E o log é listado no painel de auditoria da diretoria
```

---

### User Story 3 (P2) — Monitoramento de Saúde e Documentação Final

**Como** Encarregado de TI / Suporte,
**Quero** monitorar a saúde da aplicação via Actuator e consultar o Runbook de contingência,
**Para que** incidentes sejam prevenidos ou resolvidos em poucos minutos.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Health check do sistema
  Dado que o monitoramento consulta "/actuator/health"
  Quando o banco e disco estão saudáveis
  Então a resposta é 200 OK com status "UP"
```

---

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
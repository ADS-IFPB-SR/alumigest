# Especificação Funcional: US-45 — Monitorar Saúde do Sistema com Actuator e Publicar Documentação

**Identificador**: `US-45`  
**Issue GitHub**: [#170](https://github.com/ADS-IFPB-SR/alumigest/issues/170)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como equipe de engenharia e sustentação da Alumiportas, desejo monitorar a saúde operacional da aplicação e de suas dependências (PostgreSQL, espaço em disco, JVM e pool de conexões HikariCP) via Spring Boot Actuator, além de disponibilizar a documentação interativa oficial de APIs via Swagger OpenAPI 3.0 e artefatos de governança arquitetural (C4 Model e Runbooks), garantindo observabilidade contínua e facilidade de integração.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Disponibilização de Endpoints de Health Check (Liveness & Readiness)**
  - **Dado que** o backend está em execução,
  - **Quando** o balanceador de carga ou orquestrador consulta `GET /actuator/health`,
  - **Então** o sistema responde com status `{"status": "UP"}` (HTTP 200),
  - **E** em chamadas autorizadas para administradores, detalha os indicadores de componentes: `db: UP`, `diskSpace: UP` e `mail: UP`.

- [ ] **Cenário 2: Exposição Controlada de Métricas com Actuator**
  - **Dado que** a infraestrutura de monitoramento requisita métricas operacionais,
  - **Quando** consulta `GET /actuator/metrics`,
  - **Então** o Spring Boot expõe métricas de uso de CPU, memória heap da JVM, quantidade de threads ativas e conexões ativas no pool HikariCP.

- [ ] **Cenário 3: Painel de Diagnóstico do Sistema no Frontend (`SystemSettingsPage`)**
  - **Dado que** o administrador acessa `/admin/configuracoes`,
  - **Quando** o componente `SystemHealthBadge` consulta o backend,
  - **Então** exibe um semáforo de saúde em tempo real (Verde: "Operacional", Amarelo: "Degradado", Vermelho: "Indisponível"),
  - **E** exibe a versão atual em produção, tempo de atividade (*uptime*) e estatísticas de uso de armazenamento.

- [ ] **Cenário 4: Publicação da Documentação Interativa Swagger / OpenAPI 3.0**
  - **Dado que** um desenvolvedor ou parceiro de integração precisa consumir os endpoints do AlumiGest,
  - **Quando** navega para `/swagger-ui.html`,
  - **Então** o sistema renderiza a interface do Swagger UI com todos os controladores documentados, esquemas de DTOs descritos em records Java 21,
  - **E** permite a execução interativa de requisições autenticadas via botão "Authorize" com token JWT Bearer.

- [ ] **Cenário 5: Disponibilização de Artefatos de Governança (C4 Model e Runbook)**
  - **Dado que** um novo engenheiro ingressa na sustentação da plataforma,
  - **Quando** consulta o diretório de documentação,
  - **Então** encontra os diagramas C4 Model consolidados (Contexto, Contêineres e Componentes) e o Runbook de Contingência e Recuperação de Desastres validado.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Segurança de Endpoints de Monitoramento):** Endpoints detalhados do Actuator (`/actuator/metrics`, `/actuator/env`, `/actuator/beans`) devem exigir autenticação de administrador com perfil `ROLE_ADMIN`. Apenas `/actuator/health` básico deve responder publicamente sem dados sensíveis.
- **RN-02 (Padronização OpenAPI):** Todos os novos endpoints do backend devem conter anotações `@Tag`, `@Operation` e `@ApiResponse` do SpringDoc para manter a especificação 100% atualizada.
- **RN-03 (Diretriz de Idioma em Variáveis):** Classes e atributos em inglês: `SystemHealthResponse`, `SystemMetricsResponse`, `uptimeSeconds`, `heapUsageBytes`, `databaseStatus`, `diskFreeBytes`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / Spring Actuator / SpringDoc OpenAPI 3)
- **Configurações:**
  ```yaml
  management:
    endpoints:
      web:
        exposure:
          include: health,info,metrics
    endpoint:
      health:
        show-details: when-authorized
  springdoc:
    api-docs:
      path: /v3/api-docs
    swagger-ui:
      path: /swagger-ui.html
  ```

### Frontend (React 19 / TanStack Query / Tailwind)
- **Páginas & Componentes:**
  - `SystemSettingsPage.tsx` (`/admin/configuracoes`)
  - `SystemHealthBadge.tsx` (badge com cor e pulso indicativo de status)
  - `ApiDocsLinkCard.tsx` (atalho para a documentação interativa Swagger)

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste de integração validando que `/actuator/health` retorna HTTP 200 com banco conectado.
- [ ] Teste de segurança validando que `/actuator/metrics` rejeita requisições não autorizadas com HTTP 401/403.
- [ ] Validação do schema OpenAPI `/v3/api-docs` sem erros de serialização JSON.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (6 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-45.1](issues/US-45.1-configurar-spring-boot-actuator-no-pom-xml-e-/issue.md) | Configurar Spring Boot Actuator no `pom.xml` e `application.yml` | 🔲 No Backlog |
| [US-45.2](issues/US-45.2-criar-componente-systemhealthbadge-e-tela-sys/issue.md) | Criar componente `SystemHealthBadge` e tela `SystemSettingsPage` no frontend | 🔲 No Backlog |
| [US-45.3](issues/US-45.3-criar-runbook-de-contingencia-e-guia-de-disas/issue.md) | Criar Runbook de Contingência e Guia de Disaster Recovery em `docs/sistema/disaster-recovery.md` | 🔲 No Backlog |
| [US-45.4](issues/US-45.4-criar-diagrama-c4-model-consolidado-da-arquit/issue.md) | Criar Diagrama C4 Model consolidado da arquitetura do AlumiGest em `docs/sistema/c4-model.md` | 🔲 No Backlog |
| [US-45.5](issues/US-45.5-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | 🔲 No Backlog |
| [US-45.6](issues/US-45.6-atualizar-mapa-mestre-de-governanca-e-documen/issue.md) | Atualizar mapa mestre de governança e documentação em `docs/planejamento/README.md` | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-45-monitoramento-actuator-documentacao`

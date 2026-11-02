# [US-37.5] Criar package `br.edu.ifpb.alumigest.sync` no backend para sincronização comercial

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-37.5`
- **US Pai**: `US-37: Instalar PWA Desktop/Mobile e Elaborar Rascunhos de Orçamentos Offline`
- **Release**: Release 3 (v3.0.0) — Comercial, Financeiro & Sustentação
- **Fase**: `Phase 3: Backend Scaffolding & Sync Architecture`
- **User Story**: [US2 - Backend Sync Engine]
- **Sub-área**: `Backend`
- **Execução Paralela**: ❌ Não
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/sync/`
- **Labels Sugeridas**: `release-3`, `backend`, `java`, `spring-boot`, `architecture`, `solid`

---

## 🎯 Objetivo & Descrição

Criar a estrutura do pacote `br.edu.ifpb.alumigest.sync` no backend Spring Boot 3 para suportar as operações de sincronização comercial offline:
- Subpacotes: `dto`, `service`, `controller`.
- Configurar permissões de segurança no Spring Security para permitir que vendedores autenticados acessem o catálogo e enviem rascunhos.

---

## 🛠️ Checklist de Implementação

- [ ] Criar diretórios `backend/src/main/java/br/edu/ifpb/alumigest/sync/{controller,service,dto}`.
- [ ] Configurar regras de segurança em `SecurityConfig.java` para as rotas `/api/v1/sync/**` exigindo autenticação válida.
- [ ] Assegurar adesão aos princípios SOLID (o serviço de sincronização atua como orquestrador e delega regras de negócio ao `BudgetService` e `TemplateService`).

---

## ✅ Critérios de Aceitação

1. O projeto backend compila com `mvn clean compile` sem warnings.
2. A separação em camadas respeita a arquitetura limpa do projeto AlumiGest.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)

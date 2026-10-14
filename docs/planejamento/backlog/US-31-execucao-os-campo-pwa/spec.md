# Especificação Funcional: US-31 — Executar e Concluir OS em Campo com Registro Fotográfico (PWA)

**Identificador**: `US-31`  
**Issue GitHub**: [#156](https://github.com/ADS-IFPB-SR/alumigest/issues/156)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como instalador ou líder de equipe de campo da Alumiportas, desejo acessar os detalhes da Ordem de Serviço (`OS-YYYY-NNNN`) no smartphone via PWA, registrar o checklist de chegada no cliente, anexar fotos geolocalizadas do "Antes" e do "Depois" da instalação e colher a assinatura digital do cliente para conclusão da O.S., garantindo conformidade operacional e eliminando ordens de serviço impressas em papel.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Consulta da Ordem de Serviço em Execução no Celular**
  - **Dado que** o instalador está logado no PWA com perfil `INSTALLER` ou `OPERATOR`,
  - **Quando** acessa a lista de serviços atribuídos à sua equipe para a data atual,
  - **Então** visualiza os cards com identificador da O.S. (`OS-YYYY-NNNN`), nome do cliente, endereço com link para rota no GPS (Google Maps/Waze) e status inicial `SCHEDULED` ou `IN_PROGRESS`.

- [ ] **Cenário 2: Registro Fotográfico Obrigatório do "Antes" da Instalação**
  - **Dado que** a equipe chegou ao local de montagem,
  - **Quando** o instalador clica no botão "Iniciar Instalação" e acessa a câmera do aparelho via `FieldExecutionModal`,
  - **Então** o sistema permite a captura de fotos com marca d'água de data/hora e classificação `photoStage = BEFORE`,
  - **E** armazena a imagem associada à O.S. no backend (`service_order_photos`).

- [ ] **Cenário 3: Registro Fotográfico do "Depois" e Checklist de Qualidade**
  - **Dado que** as esquadrias/portões foram instalados e testados,
  - **Quando** o montador aciona o upload de fotos de conclusão,
  - **Então** o sistema exige ao menos uma foto categorizada como `photoStage = AFTER`,
  - **E** permite preenchimento do checklist de entrega (alinhamento, vedação, funcionamento de fechaduras e limpeza dos perfis).

- [ ] **Cenário 4: Assinatura Digital do Cliente e Conclusão da O.S.**
  - **Dado que** a instalação física foi concluída com aprovação do cliente,
  - **Quando** o cliente assina digitalmente no touchscreen via componente `SignatureCanvas` e confirma a entrega,
  - **Então** o sistema envia payload com a assinatura em Base64 e atualiza o status da O.S. para `COMPLETED`,
  - **E** grava timestamp `completedAt = Instant.now()`.

- [ ] **Cenário 5: Registro de Ocorrência / Impedimento de Instalação**
  - **Dado que** a obra não tem condições para instalação (ex: alvenaria inacabada, ausência de energia),
  - **Quando** o instalador aciona "Registrar Ocorrência / Pausar",
  - **Então** o sistema solicita o motivo da ocorrência (`interruptionReason`), anexação de foto comprobatória,
  - **E** atualiza o status para `BLOCKED` ou `RESCHEDULED`, notificando imediatamente o supervisor de produção.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Transições de Status Permitidas):** `SCHEDULED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED` ou `BLOCKED`. A transição para `COMPLETED` exige compulsoriamente pelo menos 1 foto `BEFORE` e 1 foto `AFTER`.
- **RN-02 (Código da O.S.):** Utilizar estritamente o código padronizado `OS-YYYY-NNNN`.
- **RN-03 (Enums e Idioma Técnico no Modelo):**
  - `ServiceOrderStatus`: `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `BLOCKED`, `CANCELLED`
  - `PhotoStage`: `BEFORE`, `AFTER`, `INCIDENT`
  - `ShiftType`: `MORNING`, `AFTERNOON`, `FULL_DAY`
  - `TeamType`: `INTERNAL_TEAM`, `OUTSOURCED_TEAM`

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Tabelas:** `service_orders`, `installation_teams`, `service_order_photos` (migration `V15__create_service_orders_schema.sql`)
- **Endpoints:**
  - `GET /api/v1/installation/service-orders/my-team` (lista O.S. da equipe logada)
  - `PATCH /api/v1/installation/service-orders/{id}/status` (atualização de status da O.S.)
  - `POST /api/v1/installation/service-orders/{id}/photos` (upload multipart de fotos com `photoStage`)
  - `POST /api/v1/installation/service-orders/{id}/complete` (conclusão com assinatura digital)

### Frontend (React 19 / PWA / TanStack Query / Tailwind)
- **Componentes:**
  - `FieldExecutionModal.tsx` (fluxo de execução passo a passo no celular)
  - `PhotoCaptureCard.tsx` (captura e pré-visualização de fotos da câmera)
  - `SignatureCanvas.tsx` (coleta de assinatura digital na tela sensível ao toque)

---

## 🛡️ Definition of Done (DoD)

- [ ] Testes unitários do `ServiceOrderServiceTest` cobrindo máquina de estados e validação de fotos obrigatórias.
- [ ] Teste de integração do upload multipart com validação de tipo MIME e armazenamento seguro de imagem.
- [ ] Teste em viewport mobile (375x667) garantindo usabilidade ergonômica com uma mão.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (11 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-31.1](issues/US-31.1-criar-package-br-edu-ifpb-alumigest-installat/issue.md) | Criar package `br.edu.ifpb.alumigest.installation` e diretório `frontend/src/features/installation` | 🔲 No Backlog |
| [US-31.2](issues/US-31.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V15__create_service_orders_schema.sql` com tabelas `installation_teams`, `service_orders` e `service_order_photos` | 🔲 No Backlog |
| [US-31.3](issues/US-31.3-criar-enums-serviceorderstatus-shifttype-e-te/issue.md) | Criar enums `ServiceOrderStatus`, `PhotoStage`, `ShiftType` e `TeamType` | 🔲 No Backlog |
| [US-31.4](issues/US-31.4-criar-entidades-jpa-installationteam-serviceo/issue.md) | Criar entidades JPA `InstallationTeam`, `ServiceOrder` e `ServiceOrderPhoto` | 🔲 No Backlog |
| [US-31.5](issues/US-31.5-criar-repositorios-serviceorderrepository-ins/issue.md) | Criar repositórios `ServiceOrderRepository`, `InstallationTeamRepository` e `ServiceOrderPhotoRepository` | 🔲 No Backlog |
| [US-31.6](issues/US-31.6-criar-mapper-mapstruct-serviceordermapper-em-/issue.md) | Criar mapper MapStruct `ServiceOrderMapper` | 🔲 No Backlog |
| [US-31.7](issues/US-31.7-criar-record-serviceorderstatusupdaterequest-/issue.md) | Criar records `ServiceOrderStatusUpdateRequest` e `ServiceOrderPhotoResponse` | 🔲 No Backlog |
| [US-31.8](issues/US-31.8-implementar-servico-de-upload-de-imagens-e-at/issue.md) | Implementar serviço de upload de imagens e atualização de status no `ServiceOrderService` | 🔲 No Backlog |
| [US-31.9](issues/US-31.9-criar-endpoints-patch-api-installation-servic/issue.md) | Criar endpoints PATCH `/api/v1/installation/service-orders/{id}/status` e POST `/api/v1/installation/service-orders/{id}/photos` | 🔲 No Backlog |
| [US-31.10](issues/US-31.10-criar-modal-fieldexecutionmodal-no-frontend-c/issue.md) | Criar modal `FieldExecutionModal` no frontend com captura da câmera do celular | 🔲 No Backlog |
| [US-31.11](issues/US-31.11-criar-testes-unitarios-do-serviceorderservice/issue.md) | Criar testes unitários do `ServiceOrderServiceTest` | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-31-execucao-os-campo-pwa`

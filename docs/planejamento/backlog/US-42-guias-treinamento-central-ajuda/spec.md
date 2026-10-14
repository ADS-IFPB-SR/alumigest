# Especificação Funcional: US-42 — Disponibilizar Guias de Treinamento por Perfil e Central de Ajuda

**Identificador**: `US-42`  
**Issue GitHub**: [#167](https://github.com/ADS-IFPB-SR/alumigest/issues/167)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como colaborador da Alumiportas (seja vendedor, encarregado de oficina, operador de corte, responsável financeiro ou instalador), desejo acessar uma Central de Ajuda integrada ao sistema com tutoriais práticos e baixar manuais operacionais ilustrados em PDF adaptados ao meu perfil de trabalho, promovendo autonomia operacional e reduzindo a curva de aprendizagem da equipe.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Acesso à Central de Ajuda a partir de Qualquer Tela**
  - **Dado que** o colaborador está navegando no sistema em desktop ou mobile,
  - **Quando** clica no ícone de interrogação ("Central de Ajuda & Manuais") no topo da aplicação,
  - **Então** o sistema abre a gaveta/modal `HelpCenterModal`,
  - **E** exibe guias rápidos recomendados para a tela corrente onde o usuário se encontra (ajuda contextual).

- [ ] **Cenário 2: Filtragem de Tutoriais por Papel do Usuário (Role)**
  - **Dado que** o usuário logado possui a permissão `ROLE_INSTALLER`,
  - **Quando** acessa a página completa da Central de Ajuda (`/ajuda`),
  - **Então** o sistema prioriza em destaque os módulos de execução de campo (PWA, fotos de antes/depois, modo offline e assinatura digital),
  - **E** permite alternar visualização para os demais perfis (Vendas, Serralheria, Estoque, Financeiro).

- [ ] **Cenário 3: Emissão e Download de Manual Operacional em PDF**
  - **Dado que** o encarregado de produção precisa treinar um novo operador de corte,
  - **Quando** clica no botão "Baixar Manual de Produção em PDF",
  - **Então** o serviço `OperationalManualPdfService` compila e entrega o documento `application/pdf` formatado para impressão A4,
  - **E** o manual contém passo a passo ilustrado com leitura de etiquetas, uso do painel Kanban e apontamento de perda de retalhos.

- [ ] **Cenário 4: Busca Rápida por Dúvidas Frequentes (FAQ)**
  - **Dado que** o vendedor tem dúvida sobre como gerar QR Code PIX parcelado,
  - **Quando** digita "PIX" ou "Parcelas" na barra de busca da central,
  - **Então** o sistema filtra instantaneamente os tópicos relevantes exibindo respostas em sanfona expansível (*Accordion*) com links diretos para as ações no sistema.

- [ ] **Cenário 5: Disponibilidade Offline dos Artigos Principais no PWA**
  - **Dado que** o instalador está em campo sem sinal de internet,
  - **Quando** abre a Central de Ajuda pelo PWA,
  - **Então** os tutoriais essenciais de contingência offline são lidos do cache local, permitindo consulta imediata aos procedimentos operacionais.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Mapeamento de Perfis Válidos para Manuais):** O endpoint de manuais deve aceitar estritamente os papéis válidos: `SELLER`, `PRODUCTION`, `STOCK`, `FINANCE`, `INSTALLER` e `ADMIN`.
- **RN-02 (Linguagem Acessível e Didática):** Os textos de ajuda devem utilizar terminologia prática da rotina da serralheria e vidraçaria, evitando jargões técnicos de programação.
- **RN-03 (Diretriz de Idioma em Variáveis):** Classes e enums em inglês: `OperationalManualPdfService`, `RoleManualType`, `HelpCenterArticleResponse`, `role`, `category`, `articleTitle`, `contentMarkdown`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / OpenPDF / PostgreSQL)
- **Endpoints:**
  - `GET /api/v1/onboarding/manuals/{role}/pdf` (stream de download do PDF do manual)
  - `GET /api/v1/onboarding/articles?role=...&search=...` (busca de tópicos de ajuda)
- **Serviço:** `OperationalManualPdfService.java`

### Frontend (React 19 / TanStack Query / Tailwind)
- **Páginas & Componentes:**
  - `HelpCenterPage.tsx` (`/ajuda`)
  - `HelpCenterModal.tsx` (gaveta lateral com ajuda contextual)
  - `ManualDownloadButton.tsx` (seletor e download por perfil)
  - `FaqAccordion.tsx` (lista de dúvidas frequentes com busca em tempo real)

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `OperationalManualPdfServiceTest` cobrindo geração de PDF para todos os perfis (`SELLER`, `PRODUCTION`, etc.).
- [ ] Teste de componente com React Testing Library validando filtro e expansão do accordion de dúvidas.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (7 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-42.1](issues/US-42.1-criar-servico-operationalmanualpdfservice-ger/issue.md) | Criar serviço `OperationalManualPdfService` gerando manuais em PDF para Vendedor, Produção, Estoque, Financeiro e Instalador | 🔲 No Backlog |
| [US-42.2](issues/US-42.2-criar-endpoint-get-api-onboarding-manuals-rol/issue.md) | Criar endpoint GET `/api/v1/onboarding/manuals/{role}/pdf` no `OnboardingController` | 🔲 No Backlog |
| [US-42.3](issues/US-42.3-criar-teste-unitario-do-operationalmanualpdfs/issue.md) | Criar teste unitário do `OperationalManualPdfServiceTest` | 🔲 No Backlog |
| [US-42.4](issues/US-42.4-criar-componente-helpcentermodal-e-pagina-hel/issue.md) | Criar componente `HelpCenterModal` e página `HelpCenterPage` no frontend | 🔲 No Backlog |
| [US-42.5](issues/US-42.5-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | 🔲 No Backlog |
| [US-42.6](issues/US-42.6-adicionar-botao-central-de-ajuda-manuais-no-c/issue.md) | Adicionar botão "Central de Ajuda & Manuais" no cabeçalho do frontend | 🔲 No Backlog |
| [US-42.7](issues/US-42.7-ratificar-termo-de-homologacao-da-release-3-v/issue.md) | Ratificar termo de homologação da Release 3 (v3.0.0) | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-42-guias-treinamento-central-ajuda`

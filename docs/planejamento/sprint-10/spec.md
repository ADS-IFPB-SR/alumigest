# 📑 Especificação Funcional Integrada — Sprint 10: Autenticação JWT, Segurança da Conta, Configurações da Empresa & DoD da Release 1.0

**Período Oficial da Sprint 10**: 24/11/2026 a 07/12/2026  
**Marco de Entrega**: 🏆 **Release 1.0.0 (MVP Protegido, Parametrizado e Homologado)**  
**Product Owner (PO)**: José Guylherme dos Santos Melo  
**Scrum Master**: Joseph Nichollas Abreu Cavalcante  
**Histórias Selecionadas**: **`US-48`** (5 pts), **`US-49`** (3 pts) e **`US-50`** (5 pts) — **Total: 13 Story Points**  

---

## 1. 🤝 Diretrizes de Escopo Homologadas com o Product Owner

| # | Tema | Decisão Oficial para a Sprint 10 / Release 1.0 |
|:---:|---|---|
| **1** | **Modelo de Perfis** | **1 único perfil autenticado** (Operador Único / Administrador da Oficina). Sem segregação em 3 perfis (`ADMIN`, `SELLER`, `PRODUCTION`) e sem matriz RBAC. |
| **2** | **Criação de Contas** | **Sem sistema de registro na interface** (sem auto-cadastro público e sem CRUD de usuários). Conta inicial provisionada via *seed* Flyway (`V27`) / variáveis de ambiente. |
| **3** | **Troca de Senha** | **Habilitada na interface** (`US-49`): operador logado pode alterar sua senha informando a senha atual e definindo uma nova senha forte. |
| **4** | **Lockout (15 min / 5 erros) e Auditoria** | **Fora de escopo nesta sprint** (`RF-005` e `RF-006` postergados para evoluções futuras). |
| **5** | **Logomarca nos Documentos** | **Sem upload dinâmico de logo da empresa ou de clientes.** Mantém-se a logomarca oficial fixa em `backend/src/main/resources/static/logo-alumiportas.png`. |
| **6** | **PDFs Emitidos Anteriormente** | **Sem reprocessamento ou reimpressão retroativa.** A atualização cadastral aplica-se às emissões geradas sob demanda após o salvamento. |
| **7** | **Menus Não Concluídos** | **Ocultar funcionalidades não prontas** (`Dashboard` e `Financeiro` na `Sidebar.tsx`, além de ícones mortos na `Topbar.tsx`). |
| **8** | **Homologação da Release 1.0** | **Incorporada como Definition of Done (DoD)** contínuo da Sprint 10 (mesma governança aplicada às antigas `US-12`, `US-23` e `US-41`). |

---

## 2. 📦 Especificação das Histórias de Usuário (Padrão BDD)

---

### 🔐 US-48: Autenticar Operador Único com JWT, Proteger Rotas Privadas e Encerrar Sessão
**Requisitos Rastreados**: `RF-002`, `RNF-004` (BCrypt), `RNF-006` (JWT 8h)  
**Prioridade**: P1 | **Estimativa**: **5 Story Points** (~8.5h) | **Branch**: `feat/us-48-autenticacao-jwt`

#### 🎯 Objetivo de Negócio
Como **operador responsável pela empresa**, desejo acessar o AlumiGest ERP por meio de uma tela de login protegida por e-mail e senha, mantendo todas as rotas e dados comerciais/fabris inacessíveis a terceiros não autenticados na web e podendo encerrar minha sessão com segurança ao deixar o computador.

#### 🧪 Critérios de Aceitação (*Dado que / Quando / Então*)
- [ ] **Cenário 1: Autenticação com Credenciais Válidas (`POST /api/v1/auth/login`)**
  - **Dado que** existe a conta oficial ativa provisionada no banco e estou na página pública `/login`,
  - **Quando** preencho meu e-mail e senha corretos e aciono **"Entrar"**,
  - **Então** o backend valida o hash `BCrypt`, retorna **HTTP 200 OK** com o token JWT assinado (validade de 8 horas) e os dados da conta (`id`, `name`, `email`),
  - **E** sou redirecionado para a tela operacional inicial (`/orcamentos` ou rota originalmente tentada), exibindo meu nome real na `Topbar.tsx`.

- [ ] **Cenário 2: Rejeição Segura de Credenciais Inválidas**
  - **Dado que** estou na tela `/login`,
  - **Quando** informo um e-mail não cadastrado ou uma senha incorreta,
  - **Então** a API responde com **HTTP 401 Unauthorized** e mensagem única em português (*"E-mail ou senha inválidos"*), sem revelar qual dos dois campos falhou, mantendo o usuário na tela `/login` com feedback visual claro.

- [ ] **Cenário 3: Bloqueio Universal de Rotas Privadas e Endpoints da API**
  - **Dado que** não possuo token JWT válido (acesso anônimo ou token expirado/adulterado),
  - **Quando** tento acessar diretamente qualquer rota interna no navegador (ex.: `/`, `/orcamentos`, `/ordens-servico`, `/producao`, `/configuracoes`) ou consumir qualquer endpoint privado `/api/v1/**`,
  - **Então** o backend rejeita a chamada com **HTTP 401 Unauthorized** e o componente `ProtectedRoute` / interceptor Axios limpa a sessão local e redireciona imediatamente para `/login`.

- [ ] **Cenário 4: Encerramento Explícito de Sessão (`Logout`)**
  - **Dado que** estou autenticado no AlumiGest ERP,
  - **Quando** clico no botão **"Sair"** na `Sidebar.tsx`,
  - **Então** o token JWT é removido do armazenamento local, o cache de dados em memória (`QueryClient`) é limpo e sou redirecionado para `/login`, impedindo o retorno às telas internas pelo botão "Voltar" do navegador.

#### 📋 Regras de Negócio e Contrato Técnico
- **RN-01 (Sem Auto-Cadastro na Interface):** Não deve existir link de *"Criar conta"* nem recuperação por SMTP na tela `/login`. A conta inicial é provisionada via `V27__create_users_schema.sql`.
- **RN-02 (Hash Seguro):** Senhas são persistidas exclusivamente com `BCryptPasswordEncoder` (custo 10–12) e jamais expostas em DTOs ou logs.
- **Tabela `tb_users` (`V27`):** `id (UUID PK)`, `name (VARCHAR 150 NOT NULL)`, `email (VARCHAR 150 UNIQUE NOT NULL)`, `password_hash (VARCHAR 255 NOT NULL)`, `is_active (BOOLEAN NOT NULL DEFAULT TRUE)`, `created_at`, `updated_at`.
- **Endpoints:** `POST /api/v1/auth/login` (público) e `GET /api/v1/auth/me` (autenticado).

---

### 🔑 US-49: Alterar Senha de Acesso da Conta Autenticada
**Requisitos Rastreados**: `RF-001`, `RNF-004`  
**Prioridade**: P1 | **Estimativa**: **3 Story Points** (~5.5h) | **Branch**: `feat/us-49-alteracao-senha`

#### 🎯 Objetivo de Negócio
Como **operador autenticado no sistema**, desejo alterar minha senha de acesso a qualquer momento informando minha senha atual e definindo uma nova senha segura na área de Configurações, para substituir a senha padrão de implantação e manter sigilo total sobre o acesso ao sistema da empresa.

#### 🧪 Critérios de Aceitação (*Dado que / Quando / Então*)
- [ ] **Cenário 1: Alteração de Senha com Sucesso (`PUT /api/v1/auth/password`)**
  - **Dado que** estou autenticado e acesso a seção **"Segurança da Conta / Alterar Senha"** em `/configuracoes`,
  - **Quando** informo minha `Senha Atual` correta, preencho uma `Nova Senha` com no mínimo 8 caracteres e repito o mesmo valor em `Confirmar Nova Senha`, clicando em **"Atualizar Senha"**,
  - **Então** o backend valida a senha vigente, grava o novo hash `BCrypt` no banco, retorna **HTTP 200 OK**, limpa os campos do formulário e exibe um *toast* de sucesso (*"Senha alterada com sucesso"*).

- [ ] **Cenário 2: Bloqueio por Senha Atual Incorreta**
  - **Dado que** estou no formulário de alteração de senha,
  - **Quando** informo uma `Senha Atual` divergente da cadastrada no banco,
  - **Então** o backend rejeita a operação com **HTTP 400 Bad Request** (ou **HTTP 422**) informando *"A senha atual informada está incorreta"*, sem encerrar minha sessão ativa e sem alterar o hash salvo.

- [ ] **Cenário 3: Validação de Força Mínima, Confirmação e Não-Repetição**
  - **Dado que** preencho o formulário de troca de senha,
  - **Quando** digito uma `Nova Senha` com menos de 8 caracteres, diferente do campo `Confirmar Nova Senha`, ou idêntica à `Senha Atual`,
  - **Então** a validação cliente (Zod) e servidor (Bean Validation / regra de domínio) impedem o salvamento exibindo mensagens claras por campo.

- [ ] **Cenário 4: Validação no Próximo Login**
  - **Dado que** concluí a troca de senha e encerrei minha sessão (`Logout`),
  - **Quando** tento entrar novamente com a senha antiga, recebo **HTTP 401 Unauthorized**,
  - **E quando** entro com a nova senha recém-definida, o login é efetuado normalmente.

#### 📋 Regras de Negócio e Contrato Técnico
- **RN-01 (Comprovação da Senha Vigente):** A troca de senha exige obrigatoriamente validação de `currentPassword` contra o hash atual no banco.
- **RN-02 (Acessibilidade):** Os campos `currentPassword`, `newPassword` e `confirmNewPassword` possuem botão de alternância mostrar/ocultar caracteres.
- **Endpoint:** `PUT /api/v1/auth/password` (autenticado via JWT).

---

### 🏢 US-50: Configurar Dados Institucionais da Empresa, Atualizar Cabeçalhos PDF e Higienizar UI da Release 1.0
**Requisitos Rastreados**: `RF-033` (Dados da empresa em propostas/documentos), Padronização Release 1.0  
**Prioridade**: P1 | **Estimativa**: **5 Story Points** (~11.0h) | **Branch**: `feat/us-50-configuracoes-empresa`

#### 🎯 Objetivo de Negócio
Como **operador responsável pela empresa**, desejo editar em `/configuracoes` os dados cadastrais da vidraçaria/serralheria (Razão Social, Nome Fantasia, CNPJ, Telefone/WhatsApp, E-mail e Endereço) para que as próximas propostas, comprovantes, fichas e etiquetas emitidos saiam com as informações oficiais atualizadas, operando em uma interface limpa sem menus *placeholder* inacabados.

#### 🧪 Critérios de Aceitação (*Dado que / Quando / Então*)
- [ ] **Cenário 1: Consulta e Atualização dos Dados Cadastrais da Empresa (`/configuracoes`)**
  - **Dado que** acesso `/configuracoes` na seção **"Dados da Empresa"**,
  - **Quando** a tela carrega os dados vindos de `GET /api/v1/settings/company`,
  - **Então** visualizo o formulário preenchido com `Razão Social`, `Nome Fantasia`, `CNPJ` (máscara `00.000.000/0000-00`), `Inscrição Estadual` (opcional), `Telefone / WhatsApp`, `E-mail`, `CEP`, `Endereço (Logradouro, Número, Complemento, Bairro)` e `Cidade / UF`, acompanhado de pré-visualização do cabeçalho institucional com a logo oficial fixa (`logo-alumiportas.png`),
  - **E quando** altero os dados válidos e clico em **"Salvar Alterações"**, o endpoint `PUT /api/v1/settings/company` persiste o registro singleton e exibe confirmação visual imediata.

- [ ] **Cenário 2: Validação Cadastral de Campos Obrigatórios e Formato**
  - **Dado que** estou editando os dados da empresa em `/configuracoes`,
  - **Quando** informo um CNPJ inválido, e-mail malformado ou deixo campos essenciais (`Razão Social`, `Nome Fantasia`, `CNPJ`, `Telefone`, `Endereço`, `Cidade/UF`) vazios,
  - **Então** o formulário exibe erro inline impedindo o envio e o backend rejeita payloads inválidos com **HTTP 400 Bad Request**.

- [ ] **Cenário 3: Consumo Dinâmico nos Novos Documentos PDF (Sem Reprocessamento Retroativo)**
  - **Dado que** salvei novos dados cadastrais em `/configuracoes`,
  - **Quando** solicito a emissão de um documento PDF a partir desse momento — **Proposta Comercial (`BudgetPdfService`)**, **Comprovante de O.S. (`OrderPdfService`)**, **Ficha Técnica (`ProductionSheetPdfService`)**, **Venda Avulsa (`PartSalePdfService`)** ou **Etiqueta Térmica (`ThermalLabelPdfRenderer`)**,
  - **Então** o cabeçalho do documento gerado passa a exibir os dados atualizados do banco (substituindo a leitura estática de `CompanyProperties` com fallback seguro) combinados à logomarca oficial fixa, sem regerar PDFs passados.

- [ ] **Cenário 4: Higienização de Menus e Placeholders para a Release 1.0**
  - **Dado que** navego pelo AlumiGest ERP autenticado na versão `v1.0.0`,
  - **Quando** inspeciono a `Sidebar.tsx`, a `Topbar.tsx` e as rotas em `App.tsx`,
  - **Então** os itens não concluídos (`Dashboard`, `Financeiro` e botões estáticos sem função como sino de notificações / `"Suporte"` morto) estão ocultos da navegação, a rota `/configuracoes` renderiza a tela real em vez de `PlaceholderPage`, e URLs desconhecidas redirecionam de forma limpa para a página principal.

#### 📋 Regras de Negócio e Contrato Técnico
- **RN-01 (Sem Upload de Logo):** Mantém-se o arquivo institucional estático `logo-alumiportas.png` sem upload de imagens da empresa ou de clientes.
- **RN-02 (Fallback Resiliente):** `CompanySettingsService` prioriza `tb_company_settings` e utiliza `CompanyProperties` como fallback caso campos opcionais estejam ausentes, evitando quebra de layout A4/térmico.
- **RN-03 (Sem Reimpressão Retroativa):** Alterar dados da empresa ou de clientes não dispara reimpressão de documentos emitidos anteriormente; pedidos aprovados preservam seu snapshot imutável (`US-14`).
- **Tabela `tb_company_settings` (`V28`):** `id (UUID PK)`, `company_name`, `trade_name`, `cnpj`, `state_registration`, `phone`, `email`, `zip_code`, `address`, `city_state`, `updated_at`.
- **Endpoints:** `GET /api/v1/settings/company` e `PUT /api/v1/settings/company` (autenticados).

---

## 3. 🔪 Detalhamento das Fatias Verticais Atômicas (`US-48.1` a `US-50.4`)

1. **`US-48.1` [1 pt / 2.5h]** — Migration `V27__create_users_schema.sql` (com *seed* inicial `BCrypt`), entidade `User`, `UserRepository` e `JwtService` (HMAC-SHA256, 8h) + testes unitários.
2. **`US-48.2` [2 pts / 3.0h]** — `SecurityConfig` stateless (Spring Security 6), `JwtAuthenticationFilter`, endpoints `POST /api/v1/auth/login` e `GET /api/v1/auth/me` + suporte `@WithMockUser` para testes WebMvc legados.
3. **`US-48.3` [2 pts / 3.0h]** — Página `LoginPage.tsx` (`/login`), `AuthContext`, interceptor Axios `Bearer`/401, `ProtectedRoute`, exibição do usuário real na `Topbar.tsx` e botão `Sair` na `Sidebar.tsx` + testes Vitest.
4. **`US-49.1` [1 pt / 2.5h]** — Endpoint `PUT /api/v1/auth/password` validando `currentPassword` via `BCrypt`, força mínima (8 caracteres) e não-repetição da senha atual + testes MockMvc.
5. **`US-49.2` [2 pts / 3.0h]** — Seção **"Segurança da Conta / Alterar Senha"** em `/configuracoes` com React Hook Form + Zod, toggles de visibilidade e feedback via *toast* + testes Vitest.
6. **`US-50.1` [1 pt / 2.5h]** — Migration `V28__create_company_settings_schema.sql` (singleton com *seed*), entidade `CompanySettings`, validações cadastrais e endpoints `GET` / `PUT /api/v1/settings/company` + testes MockMvc.
7. **`US-50.2` [2 pts / 3.0h]** — Seção **"Dados da Empresa"** em `/configuracoes` com máscaras (CNPJ, Telefone, CEP) e preview em tempo real do cabeçalho institucional com logo fixa + testes Vitest.
8. **`US-50.3` [1 pt / 3.0h]** — Injeção dinâmica de `CompanySettingsService` em `BudgetPdfService`, `OrderPdfService`, `ProductionSheetPdfService`, `PartSalePdfService` e `ThermalLabelPdfRenderer` com fallback para `CompanyProperties` + testes PDF.
9. **`US-50.4` [1 pt / 2.5h]** — Ocultação de `Dashboard`, `Financeiro` e ícones estáticos mortos na `Sidebar.tsx`/`Topbar.tsx`, comando `cy.login()` com `cy.session()` e suíte E2E Cypress autenticada cobrindo Login + Troca de Senha + Configurações + PDF.

---

## 4. 🛡️ Definition of Done (DoD) & Homologação da Release 1.0.0

1. **Proteção Integral**: Todas as rotas privadas do frontend e endpoints `/api/v1/**` (exceto `/api/v1/auth/login` e healthcheck) exigem JWT válido.
2. **Estabilidade Automatizada**: 100% dos testes Backend (`mvn test`), Frontend (`vitest run`) e E2E (`cypress run` com `cy.login()`) verdes na esteira CI.
3. **Qualidade Estática**: Checkstyle = 0 violações, Oxlint/TypeScript = 0 erros e SonarQube Quality Gate aprovado ($\ge 80\%$ de cobertura no código novo).
4. **Navegação Enxuta**: Nenhuma rota *placeholder* (*"Em Desenvolvimento"*) exposta nos menus da versão `v1.0.0`.
5. **Smoke Test Ponta a Ponta da Release 1.0 (`docker compose`)**:
   - Subida limpa do ambiente Docker aplicando migrations até `V28`;
   - Login inicial $\rightarrow$ Alteração de senha em `/configuracoes` $\rightarrow$ Novo login com a nova senha;
   - Edição dos dados da empresa em `/configuracoes` $\rightarrow$ Emissão de PDFs (Orçamento, O.S., Ficha Técnica, Venda Avulsa e Etiqueta) comprovando o novo cabeçalho dinâmico;
   - Ciclo operacional completo (Estoque $\rightarrow$ Cliente $\rightarrow$ Orçamento $\rightarrow$ O.S. $\rightarrow$ Kanban `COMPLETED` $\rightarrow$ Baixa Kardex) validado sem erros para emissão da tag `v1.0.0`.

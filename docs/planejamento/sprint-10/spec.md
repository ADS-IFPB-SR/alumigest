# 📑 Especificação Funcional Integrada — Sprint 10: Preparação, Segurança e Calibração para a 1ª Entrega

**Período Oficial da Sprint 10**: 24/11/2026 a 07/12/2026  
**Status**: 🟢 Planejada  
**Objetivo Geral**: Consolidar a segurança, a parametrização institucional da empresa e a calibração com orçamentos reais para selar com excelência a **Primeira Entrega Oficial (Release 2)** do AlumiGest.

---

## 1. 🎯 Objetivos de Negócio por Pilar

### 1.1 Pilar 1: Autenticação, Usuários e Controle de Acesso (RBAC)
Como proprietário ou encarregado da vidraçaria Alumiportas, desejo que a aplicação exija autenticação segura e controle os acessos de acordo com o perfil de cada colaborador (`ADMIN`, `VENDEDOR`, `OPERADOR`), para garantir que operadores de fábrica vejam apenas as ordens de serviço no chão de fábrica, vendedores operem o balcão comercial e administradores gerenciem parâmetros críticos do sistema.

### 1.2 Pilar 2: Painel de Configurações da Empresa & Cabeçalhos Dinâmicos
Como gestor da empresa, desejo cadastrar os dados cadastrais e a identidade visual da Alumiportas (Razão Social, Nome Fantasia, CNPJ, Inscrição Estadual, Telefone/WhatsApp, Endereço, Cidade-UF e Logotipo) através de uma tela de configurações, para que esses dados sejam automaticamente estampados em todos os documentos gerados pelo sistema (orçamentos em PDF, fichas técnicas de montagem, comprovantes de O.S. e etiquetas térmicas), eliminando dados estáticos (*hardcoded*).

### 1.3 Pilar 3: Calibração e Validação com Orçamentos Reais
Como orçamentista e responsável técnico de serralheria, desejo comparar as propostas geradas pelo AlumiGest com orçamentos reais já faturados no sistema/planilhas atuais da empresa, confrontando as fórmulas de corte de perfis, consumo de vidro em $m^2$, custos de insumos e preço final, para certificar que o motor de cálculo possui precisão de 100% (divergência R$ 0,00) antes da entrada em produção.

### 1.4 Pilar 4: Saneamento Completo de Bugs & Quality Gate
Como equipe de desenvolvimento e QA, desejamos sanear integralmente todos os bugs apontados (incluindo o reparo da impressão de etiquetas térmicas na Venda Avulsa), manter 100% dos testes unitários, de integração e E2E verdes e aprovar o Quality Gate do SonarQube com zero débitos técnicos.

---

## 2. 🧪 Fatiamento Atômico & Critérios de Aceitação (Dado / Quando / Então)

---

### 📦 PILAR 1: Segurança, Autenticação e RBAC (US-10.1 a US-10.4)

#### US-10.1: Setup de Autenticação, Entidade `User` e Migração Flyway `V27` [1 pt / 2.5h]
- **Escopo**:
  - Script Flyway `V27__create_users_schema.sql` criando a tabela `tb_users` (`id`, `name`, `email`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`).
  - Criação do usuário padrão inicial via seed (`admin@alumiportas.com.br` / senha padrão com hash BCrypt).
  - Entidade JPA `User`, enum `UserRole` (`ADMIN`, `VENDEDOR`, `OPERADOR`) e `UserRepository` com busca por e-mail (`findByEmailIgnoreCaseAndIsActiveTrue`).
- **Critérios de Aceitação**:
  - [ ] A migration executa no PostgreSQL sem erros, criando constraints de e-mail único e índices adequados.
  - [ ] Tentativas de cadastrar e-mails duplicados são rejeitadas pelo banco.
  - [ ] Senhas nunca são persistidas em texto puro, exigindo hash BCrypt com salt de pelo menos 10 rounds.

#### US-10.2: Motor de Autenticação JWT, Spring Security 6 e Endpoints `/api/v1/auth` [2 pts / 3.5h]
- **Escopo**:
  - Configuração do Spring Security 6 (`SecurityFilterChain`) em modo stateless (`SessionCreationPolicy.STATELESS`).
  - Serviço `JwtService` para geração e validação de tokens JWT (HS256) com tempo de expiração configurável (padrão 8 horas).
  - Filtro `JwtAuthenticationFilter` interceptando o header `Authorization: Bearer <token>`.
  - Endpoint `POST /api/v1/auth/login` recebendo `LoginRequestDTO` (email e senha) e devolvendo `LoginResponseDTO` (token, nome, email e role).
  - Endpoint `GET /api/v1/auth/me` para validação de token ativo e recuperação do perfil do usuário logado.
- **Critérios de Aceitação**:
  - [ ] Credenciais válidas retornam HTTP 200 com token JWT assinado e dados do perfil.
  - [ ] Credenciais inválidas retornam HTTP 401 Unauthorized com mensagem padronizada em pt-BR ("E-mail ou senha incorretos").
  - [ ] Endpoints protegidos rejeitam requisições sem token ou com token expirado/adulterado com HTTP 401.

#### US-10.3: Tela de Login (`/login`) Responsiva e Interceptor no Frontend [2 pts / 3.5h]
- **Escopo**:
  - Criação da página `LoginPage.tsx` utilizando Tailwind CSS e o Design System AlumiGest (cores institucionais navy `#041632`, logo da empresa e tipografia oficial).
  - Validação de formulário via Zod e React Hook Form com exibição de erros de campo em tempo real.
  - Cliente `authApi.ts` e hook/contexto `useAuth` para gerenciar estado de login, persistência segura no `localStorage` e logout.
  - Interceptor Axios injetando o token `Bearer` em todas as requisições e capturando status 401 para redirecionar automaticamente ao login.
- **Critérios de Aceitação**:
  - [ ] Layout perfeitamente responsivo (desktop, tablet e mobile).
  - [ ] Exibe feedback sonoro/visual via toast em caso de erro de conexão ou credenciais inválidas.
  - [ ] Ao autenticar com sucesso, armazena a sessão e redireciona o usuário para o painel principal (`/`).

#### US-10.4: Controle de Acesso RBAC, `ProtectedRoute` e Logout no Frontend [1 pt / 2.5h]
- **Escopo**:
  - Componente de alta ordem `ProtectedRoute.tsx` avaliando se o usuário está autenticado e se sua role possui permissão para acessar a rota pretendida.
  - Exibição das informações do usuário autenticado no topo da barra lateral (`Sidebar.tsx`) e cabeçalho, com botão visível de Logout.
  - Restrição de rotas: Operadores de fábrica acessam somente `/producao`, `/ordens-servico` e etiquetas; rotas de catálogo de preços e configurações exigem `ADMIN`.
- **Critérios de Aceitação**:
  - [ ] Usuário não autenticado tentando acessar qualquer rota privada é redirecionado para `/login`.
  - [ ] Usuário logado sem permissão para uma rota recebe aviso de acesso negado sem quebrar a aplicação.
  - [ ] Ação de Logout limpa o token de sessão e redireciona com segurança para `/login`.

---

### 📦 PILAR 2: Painel de Configurações da Empresa & Cabeçalhos Dinâmicos (US-10.5 a US-10.7)

#### US-10.5: Entidade `CompanySettings`, Migração `V28` e Endpoints de Configurações [1 pt / 2.5h]
- **Escopo**:
  - Script Flyway `V28__create_company_settings_schema.sql` criando a tabela singleton `tb_company_settings` (`id`, `company_name`, `trade_name`, `cnpj`, `state_registration`, `phone`, `email`, `address`, `city_state`, `logo_base64_or_url`, `updated_at`).
  - Seed inicial populando os dados oficiais da Alumiportas LTDA.
  - Entidade `CompanySettings`, DTOs `CompanySettingsRequestDTO` / `CompanySettingsResponseDTO` e serviço `CompanySettingsService`.
  - Endpoints `GET /api/v1/settings/company` e `PUT /api/v1/settings/company` (restrito a `ADMIN`).
- **Critérios de Aceitação**:
  - [ ] Validações de CNPJ válido, formato de telefone e campos obrigatórios no DTO.
  - [ ] Atualização segura retornando o registro consolidado com código HTTP 200.

#### US-10.6: Tela de Configurações (`/configuracoes`) com Preview de Cabeçalho [2 pts / 3.5h]
- **Escopo**:
  - Substituição da página estática de Placeholder pela tela oficial `CompanySettingsPage.tsx`.
  - Formulário com campos estruturados: Dados Cadastrais (Razão Social, Nome Fantasia, CNPJ, IE), Contato (Telefone/WhatsApp, E-mail), Endereço Completo e Campo para upload de Logotipo.
  - **Componente de Preview Interativo**: Exibição em tempo real de uma miniatura do cabeçalho institucional exatamente como ele será renderizado nos PDFs.
- **Critérios de Aceitação**:
  - [ ] As alterações digitadas no formulário atualizam instantaneamente o preview do cabeçalho.
  - [ ] Ao salvar, exibe toast de sucesso e invalida o cache do TanStack Query (`['company-settings']`).

#### US-10.7: Consumo Dinâmico dos Dados da Empresa em todos os PDFs e Etiquetas [1 pt / 3.0h]
- **Escopo**:
  - Refatoração dos serviços de geração de documentos para consultar dinamicamente `CompanySettingsService`:
    1. `BudgetPdfService.java` (Orçamento Comercial A4 e Resumo WhatsApp);
    2. `OrderReceiptPdfService.java` (Comprovante da O.S.);
    3. `ProductionSheetService.java` (Ficha Técnica A4 de Produção/Montagem);
    4. `PartSalePdfService.java` (Venda Avulsa A4);
    5. `ThermalLabelPdfRenderer.java` (Etiquetas Térmicas 100×60mm).
- **Critérios de Aceitação**:
  - [ ] Qualquer alteração realizada na tela de configurações é refletida no próximo PDF gerado sem necessidade de reiniciar o backend.
  - [ ] Fallback seguro para os valores padrão caso o banco ainda não possua registro customizado.

---

### 📦 PILAR 3: Calibração e Paridade de Orçamentos Reais (US-10.8 e US-10.9)

#### US-10.8: Matriz de Calibração com 5 Casos Reais de Esquadrias da Alumiportas [1 pt / 2.5h]
- **Escopo**:
  - Documentação da planilha de calibração confrontando 5 modelos oficiais da fábrica:
    1. **Janela de Correr 2 Folhas (Linha Suprema)**: $1200 \times 1000\text{ mm}$, Vidro Incolor 6mm;
    2. **Porta de Correr 2 Folhas (Linha Suprema)**: $2100 \times 1600\text{ mm}$, Vidro Verde 8mm;
    3. **Porta Pivotante (Linha Gold)**: $2200 \times 1000\text{ mm}$, Puxador Tubo Inox 60cm;
    4. **Janela de Correr 4 Folhas (2 Fixas e 2 Móveis)**: $1500 \times 2000\text{ mm}$;
    5. **Janela Maxim-ar com Pingadeira**: $600 \times 600\text{ mm}$, Vidro Mini-boreal 4mm.
  - Registro dos valores de corte (alturas e larguras de perfis), consumo de vidro ($m^2$), acessórios e valor final do sistema legado.
- **Critérios de Aceitação**:
  - [ ] Documento de calibração registrado com as fórmulas oficiais aplicadas pelos serralheiros da Alumiportas.

#### US-10.9: Ajuste Fino dos Motores de Cálculo para Paridade Centavo a Centavo [1 pt / 3.5h]
- **Escopo**:
  - Verificação e ajuste das constantes de folgas construtivas em `SupremaSlidingWindowCalculator.java` e `DefaultFrameCalculator.java`.
  - Ajuste de rateio de barras lineares (perda técnica) e arredondamento padrão bancário (`RoundingMode.HALF_UP` e duas casas decimais).
  - Execução de testes automatizados comparando os resultados calculados com a matriz de calibração da US-10.8.
- **Critérios de Aceitação**:
  - [ ] Divergência entre o cálculo do AlumiGest e a planilha da oficina igual a **R$ 0,00** nos 5 modelos calibrados.
  - [ ] Suíte de testes unitários `BudgetEngineCalibrationTest` validando a precisão matemática sem falhas.

---

### 📦 PILAR 4: Saneamento Geral de Bugs & Homologação da 1ª Entrega (US-10.10 e US-10.11)

#### US-10.10: Saneamento do Bug de Etiquetas Térmicas na Venda Avulsa (PR #600) [1 pt / 2.5h]
- **Escopo**:
  - Mesclagem e homologação final do [PR #600](https://github.com/ADS-IFPB-SR/alumigest/pull/600), resolvendo a Issue [#598](https://github.com/ADS-IFPB-SR/alumigest/issues/598).
  - Eliminação da chamada incorreta `window.print()` e disponibilização do endpoint oficial `GET /api/v1/part-sales/{id}/labels-pdf` em proporção exata $100 \times 60\text{ mm}$.
  - Teste de impressão e download da bobina térmica tanto em desktop quanto na impressora física Elgin L42Pro.
- **Critérios de Aceitação**:
  - [ ] O clique em "Imprimir Etiquetas" na Venda Avulsa baixa ou abre o PDF térmico formatado em 100×60mm, sem capturar a tela do navegador.
  - [ ] Testes automatizados do `PartSaleControllerTest` e `ThermalLabelModal.test.tsx` 100% aprovados.

#### US-10.11: Bateria E2E Cypress, Quality Gate SonarQube e Dossiê de Homologação [1 pt / 3.5h]
- **Escopo**:
  - Execução de ponta a ponta dos testes Cypress (`npm run test:e2e`).
  - Varredura estática de código com SonarQube e Checkstyle garantindo 0 bugs, 0 vulnerabilidades e 0 code smells.
  - Geração dos relatórios formais de governança da disciplina:
    - **RTM** (Roteiro de Testes Manuais da Release 2);
    - **RET** (Relatório de Execução de Testes);
    - **TEA** (Termo de Homologação e Aceitação da Release 2).
- **Critérios de Aceitação**:
  - [ ] Todos os testes Cypress executam com sucesso em ambiente local ou CI.
  - [ ] Dossiê de entrega aprovado e documentado em `docs/projeto-001/003-teste/`.

---

## 3. 🛡️ Definition of Done (DoD) da Sprint 10

Para que a Sprint 10 seja considerada 100% concluída e a **Primeira Entrega** liberada para a banca:
1. **Segurança**: Nenhuma rota privada pode ser acessada sem token JWT válido.
2. **Configuração**: Alterar os dados da empresa reflete imediatamente no cabeçalho dos PDFs gerados.
3. **Precisão Matemática**: Orçamentos calculados conferem centavo por centavo com a realidade da oficina.
4. **Qualidade de Código**: 100% dos testes unitários e de integração passando, com SonarQube verde.
5. **Estabilidade**: Zero bugs impeditivos ou de layout abertos.

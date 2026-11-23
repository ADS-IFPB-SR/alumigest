# 📑 Especificação Funcional Integrada — Sprint 10: Preparação, Segurança e Calibração para a 1ª Entrega

**Período Oficial da Sprint 10**: 24/11/2026 a 07/12/2026  
**Status**: 🟢 Planejada e Calibrada com o Parceiro Social (Alumiportas)  
**Objetivo Geral**: Consolidar a segurança com autenticação de usuário único, a parametrização dos cabeçalhos institucionais com a logomarca oficial da empresa e a **calibração estrita do motor de cálculo com a Linha 45 mm Rometal do ramo moveleiro** (Portas de Giro, Correr, Basculante e Frente de Gaveta com vidros de 4mm e perfis 059/060 Bronze, Fosco e Preto), selando a **Primeira Entrega Oficial (Release 2)** do AlumiGest.

---

## 1. 🎯 Diretrizes do Parceiro Social & Pilares Estratégicos

### 1.1 Pilar 1: Autenticação Segura com Usuário Único (Sem Divisão em 3 Categorias)
* **Definição de Escopo**: O sistema AlumiGest opera no modelo de **Usuário Único / Administrador da Oficina**. Não há necessidade de segregação em 3 categorias de perfis (`ADMIN`, `VENDEDOR`, `OPERADOR`).
* **Comportamento**: Tela de login limpa, geração e validação de tokens JWT (Spring Security 6), interceptor no frontend e proteção de rotas privadas (`ProtectedRoute`). Qualquer tentativa de acesso sem autenticação válida é redirecionada para `/login`.

### 1.2 Pilar 2: Cabeçalho Dinâmico da Empresa & Logotipo Oficial Alumiportas
* **Definição de Escopo**: A empresa já possui um logotipo oficial (`/static/logo-alumiportas.png`). O objetivo é parametrizar dinamicamente as informações cadastrais (Razão Social, Nome Fantasia, CNPJ, Telefone/WhatsApp, Endereço e Cidade-UF) em `tb_company_settings`, eliminando valores fixos (*hardcoded*).
* **Comportamento**: Todos os documentos (Orçamento PDF, Ficha Técnica de Montagem/Corte, Comprovante de O.S., Venda Avulsa e Etiquetas Térmicas) consomem dinamicamente essas informações e estampam a logomarca oficial.

### 1.3 Pilar 3: Calibração com a Linha 45 mm Rometal Moveleira (Perfis 059/060, Vidros 4mm)
* **Definição de Escopo**: A Alumiportas atua fortemente no **ramo moveleiro** (marcenaria fina, móveis sob medida, armários, closets e cozinhas planejadas) utilizando a **Linha 45 mm Rometal**:
  * **Perfis Estruturais de 45 mm**:
    * **RM-060**: Perfil estrutural com **aba frontal baixa**, estética minimalista e clean.
    * **RM-059**: Perfil estrutural com **aba frontal alta**, visual imponente e maior sobreposição.
  * **Acabamentos Homologados**:
    * **Bronze** (Anodizado Bronze 1002/1003)
    * **Fosco** (Anodizado Jateado Fosco / Natural Fosco)
    * **Preto** (Preto Fosco / Pintura Eletrostática a Pó)
  * **Vidros Padronizados**: Estritamente **Vidro 4 mm** (Incolor, Reflecta Bronze, Reflecta Fumê, Espelho Prata, Vidro Acidato).
  * **Acessórios de Montagem Rometal**:
    * Esquadretas de Canto a 45°: **ESQ-041** ou **ESQ-055**.
    * Parafusos de fixação: **M4×8 CC**.
    * Baguete / Borracha de Encaixe para Vidro 4mm: **BG-216**.
  * **Tipologias Moveleiras do Benchmark de Paridade**:
    1. **Porta de Giro Moveleira 45mm** (com dobradiças de caneco para perfil de alumínio).
    2. **Porta de Correr Moveleira 45mm** (com sistema deslizante Rometal sobreposto/embutido).
    3. **Porta Basculante Moveleira 45mm** (com pistão a gás ou articulador para armário superior).
    4. **Frente de Gaveta Moveleira 45mm** (moldura de gaveta com cantoneiras para corrediça).
* **Meta de Paridade**: Divergência $\Delta = \text{R\$} 0{,}00$ entre o cálculo do AlumiGest e as planilhas de corte/orçamento da oficina.

### 1.4 Pilar 4: Saneamento Completo de Bugs & Quality Gate
* Correção definitiva da impressão de etiquetas térmicas na Venda Avulsa ([PR #600](https://github.com/ADS-IFPB-SR/alumigest/pull/600), resolvendo a Issue [#598](https://github.com/ADS-IFPB-SR/alumigest/issues/598)).
* Garantia de 0 bugs, 0 vulnerabilidades e 0 code smells no SonarQube com suíte E2E Cypress aprovada.

---

## 2. 🧪 Fatiamento Atômico & Critérios de Aceitação

---

### 📦 PILAR 1: Segurança & Autenticação de Usuário Único (US-10.1 a US-10.3)

#### US-10.1: Setup de Autenticação, Entidade `User` e Migração Flyway `V27` [1 pt / 2.0h]
- **Escopo**:
  - Script Flyway `V27__create_users_schema.sql` criando a tabela `tb_users` (`id`, `name`, `email`, `password_hash`, `is_active`, `created_at`, `updated_at`). Sem tabela de roles ou enums complexos.
  - Carga do usuário padrão inicial via seed (`admin@alumiportas.com.br` com senha criptografada em BCrypt).
  - Entidade JPA `User` e repositório `UserRepository` com busca por e-mail (`findByEmailIgnoreCaseAndIsActiveTrue`).
- **Critérios de Aceitação**:
  - [ ] Migration executa com sucesso no PostgreSQL e H2.
  - [ ] E-mail possui constraint `UNIQUE`.
  - [ ] Senhas salvas com hash BCrypt (custo 10+).

#### US-10.2: Motor de Autenticação JWT, Spring Security 6 e Endpoints `/api/v1/auth` [2 pts / 3.0h]
- **Escopo**:
  - Configuração do Spring Security 6 stateless (`SessionCreationPolicy.STATELESS`).
  - `JwtService` com token HMAC-SHA256 e expiração configurável (8 horas).
  - Filtro `JwtAuthenticationFilter` interceptando header `Authorization: Bearer <token>`.
  - Endpoints `POST /api/v1/auth/login` e `GET /api/v1/auth/me`.
- **Critérios de Aceitação**:
  - [ ] Login com credenciais válidas retorna HTTP 200 com token JWT e dados do usuário.
  - [ ] Credenciais inválidas retornam HTTP 401 Unauthorized com mensagem em pt-BR.
  - [ ] Endpoints protegidos rejeitam requisições sem token válido com HTTP 401.

#### US-10.3: Tela de Login (`/login`) e Proteção de Rotas (`ProtectedRoute`) no Frontend [2 pts / 3.0h]
- **Escopo**:
  - Página `LoginPage.tsx` utilizando o Design System AlumiGest, cores navy `#041632` e o logotipo oficial Alumiportas.
  - Validação via Zod e React Hook Form.
  - Contexto `useAuth` persistindo o token no `localStorage`.
  - Interceptor Axios injetando o cabeçalho `Bearer` e capturando HTTP 401 para redirecionamento automático ao login.
  - Componente `ProtectedRoute.tsx` bloqueando acessos não autenticados e botão de Logout no `Sidebar.tsx`.
- **Critérios de Aceitação**:
  - [ ] Usuário não logado é redirecionado imediatamente para `/login`.
  - [ ] Logout limpa o token e redireciona para `/login`.
  - [ ] Feedback visual via toast em caso de erro de credenciais.

---

### 📦 PILAR 2: Cabeçalho Dinâmico & Logotipo Oficial Alumiportas (US-10.4 a US-10.6)

#### US-10.4: Entidade `CompanySettings`, Migração `V28` e Endpoints Institucionais [1 pt / 2.0h]
- **Escopo**:
  - Migration `V28__create_company_settings_schema.sql` criando a tabela singleton `tb_company_settings` (`id`, `company_name`, `trade_name`, `cnpj`, `state_registration`, `phone`, `email`, `address`, `city_state`, `updated_at`).
  - Seed com os dados oficiais da Alumiportas LTDA.
  - Endpoints `GET /api/v1/settings/company` e `PUT /api/v1/settings/company`.
- **Critérios de Aceitação**:
  - [ ] DTO valida CNPJ e campos obrigatórios.
  - [ ] Atualização segura retornando código HTTP 200.

#### US-10.5: Tela de Configurações (`/configuracoes`) com Preview do Cabeçalho A4 [2 pts / 3.0h]
- **Escopo**:
  - Criação da página `CompanySettingsPage.tsx` com formulário dos dados da empresa.
  - Exibição da logomarca oficial da Alumiportas no topo do painel.
  - **Preview em tempo real do cabeçalho da folha A4**: reflete instantaneamente qualquer digitação nos campos de Razão Social, CNPJ, Telefone e Endereço.
- **Critérios de Aceitação**:
  - [ ] O preview responde em tempo real à digitação no formulário.
  - [ ] Feedback via toast ao salvar e invalidação de cache via TanStack Query.

#### US-10.6: Injeção dos Dados Dinâmicos da Empresa em Todos os PDFs e Etiquetas [1 pt / 2.5h]
- **Escopo**:
  - Refatoração de todos os 5 serviços de emissão para consumir dinamicamente `CompanySettingsService`:
    1. `BudgetPdfService.java` (Orçamento Proposta A4 com logo oficial);
    2. `OrderReceiptPdfService.java` (Comprovante de O.S.);
    3. `ProductionSheetPdfService.java` (Ficha Técnica A4 de Corte e Montagem Moveleira);
    4. `PartSalePdfService.java` (Venda Avulsa A4);
    5. `ThermalLabelPdfRenderer.java` (Etiquetas Térmicas 100×60mm).
- **Critérios de Aceitação**:
  - [ ] Atualizações nos dados da empresa são refletidas imediatamente nos novos PDFs gerados.
  - [ ] Logotipo oficial carregado via `/static/logo-alumiportas.png` de forma robusta e com escala adequada.

---

### 📦 PILAR 3: Calibração com a Linha 45 mm Rometal Moveleira (US-10.7 e US-10.8)

#### US-10.7: Matriz de Calibração das 4 Tipologias Moveleiras Rometal 45 mm [2 pts / 3.5h]
- **Escopo**:
  - Levantamento e documentação da matriz de calibração para as 4 tipologias do ramo moveleiro:
    1. **Porta de Giro Moveleira 45mm**:
       - Medidas nominais: $2100 \times 450\text{ mm}$.
       - Perfil: **RM-060** (Aba Baixa) ou **RM-059** (Aba Alta) na cor **Preto Fosco**.
       - Vidro: **Vidro Reflecta Bronze 4 mm**.
       - Acessórios: 4 Esquadretas **ESQ-041**, Parafusos M4×8, Baguete **BG-216**, 3 Dobradiças para perfil 45mm.
       - Corte de alumínio: 2 peças de $2100\text{ mm}$ + 2 peças de $450\text{ mm}$ a $45^\circ$. Consumo total $= 5{,}10\text{ m}$.
    2. **Porta de Correr Moveleira 45mm**:
       - Medidas nominais: $2200 \times 800\text{ mm}$.
       - Perfil: **RM-059** (Aba Alta) na cor **Fosco (Natural Jateado)**.
       - Vidro: **Espelho Prata 4 mm** com película protetora.
       - Acessórios: 4 Esquadretas **ESQ-041**, Parafusos M4×8, Baguete **BG-216**, Kit Deslizante Rometal (2 roldanas rolamentadas + guias superiores).
       - Corte de alumínio: 2 peças de $2200\text{ mm}$ + 2 peças de $800\text{ mm}$ a $45^\circ$. Consumo total $= 6{,}00\text{ m}$.
    3. **Porta Basculante Moveleira 45mm**:
       - Medidas nominais: $400 \times 900\text{ mm}$.
       - Perfil: **RM-060** (Aba Baixa) na cor **Bronze**.
       - Vidro: **Vidro Incolor 4 mm** (ou Reflecta Fumê 4mm).
       - Acessórios: 4 Esquadretas **ESQ-041**, Baguete **BG-216**, 2 Dobradiças de topo, 2 Pistões a Gás 80N.
       - Corte de alumínio: 2 peças de $400\text{ mm}$ + 2 peças de $900\text{ mm}$ a $45^\circ$. Consumo total $= 2{,}60\text{ m}$.
    4. **Frente de Gaveta Moveleira 45mm**:
       - Medidas nominais: $180 \times 600\text{ mm}$.
       - Perfil: **RM-060** (Aba Baixa) na cor **Preto Fosco**.
       - Vidro: **Vidro Reflecta Bronze 4 mm**.
       - Acessórios: 4 Esquadretas **ESQ-041**, Baguete **BG-216**, Suportes/cantoneiras de fixação interna para corrediça telescópica.
       - Corte de alumínio: 2 peças de $180\text{ mm}$ + 2 peças de $600\text{ mm}$ a $45^\circ$. Consumo total $= 1{,}56\text{ m}$.
  - Fórmulas de cálculo de desconto do vidro de 4 mm:
    $$\text{Largura Vidro} = W_{\text{porta}} - \Delta_{\text{encaixe}}, \quad \text{Altura Vidro} = H_{\text{porta}} - \Delta_{\text{encaixe}}$$
- **Critérios de Aceitação**:
  - [ ] Planilha de calibração documentada com fórmulas de corte, área faturada de vidro ($m^2 \ge 0{,}25$), esquadretas e parafusos.

#### US-10.8: Ajuste Fino dos Motores de Cálculo para Paridade Centavo a Centavo [1 pt / 3.0h]
- **Escopo**:
  - Ajuste e validação das regras de consumo no `ProfileQuantityCalculator`, `GlassQuantityCalculator` e `HardwareQuantityCalculator`.
  - Suporte específico no catálogo para as referências comerciais **RM-060** e **RM-059** nas cores **Bronze**, **Fosco** e **Preto**.
  - Criação da suíte de testes automatizados `Rometal45FurnitureCalibrationTest.java` comparando os resultados do sistema com as planilhas da Alumiportas.
- **Critérios de Aceitação**:
  - [ ] Divergência entre o cálculo do AlumiGest e as planilhas da oficina igual a **R$ 0,00** nos 4 casos calibrados.
  - [ ] Testes automatizados executando em menos de 1 segundo sem regressões.

---

### 📦 PILAR 4: Saneamento Geral de Bugs & Homologação da 1ª Entrega (US-10.9 e US-10.10)

#### US-10.9: Saneamento do Bug de Etiquetas Térmicas na Venda Avulsa (PR #600) [1 pt / 2.5h]
- **Escopo**:
  - Validação e merge do [PR #600](https://github.com/ADS-IFPB-SR/alumigest/pull/600), resolvendo a Issue [#598](https://github.com/ADS-IFPB-SR/alumigest/issues/598).
  - Emissão limpa da bobina térmica $100 \times 60\text{ mm}$ via endpoint `GET /api/v1/part-sales/{id}/labels-pdf`.
- **Critérios de Aceitação**:
  - [ ] Clique em "Imprimir Etiquetas" na Venda Avulsa faz download/abertura direta do PDF térmico sem acionar `window.print()`.

#### US-10.10: Bateria E2E Cypress, Quality Gate SonarQube e Dossiê de Homologação [1 pt / 3.0h]
- **Escopo**:
  - Execução completa dos testes E2E Cypress.
  - Quality Gate com 0 code smells e 0 débitos técnicos.
  - Geração dos relatórios de governança da disciplina (RTM, RET e TEA da Release 2).
- **Critérios de Aceitação**:
  - [ ] Todos os testes Cypress aprovados.
  - [ ] Documentação de homologação entregue e versionada.

---

## 3. 🛡️ Definition of Done (DoD) da Sprint 10

1. **Segurança**: Rotas privadas protegidas com token JWT e login de usuário único.
2. **Configuração**: Alterar dados institucionais reflete instantaneamente nos PDFs, mantendo o logotipo oficial Alumiportas.
3. **Paridade Moveleira**: Os cálculos da Linha 45 mm Rometal (RM-059 e RM-060, Bronze, Fosco, Preto, com vidros 4mm) batem centavo a centavo ($\Delta = \text{R\$} 0{,}00$) com a prática da Alumiportas.
4. **Qualidade & Estabilidade**: SonarQube verde, 100% dos testes unitários e de integração verdes e bug de etiquetas saneado.

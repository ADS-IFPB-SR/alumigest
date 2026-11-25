## 🎯 Objetivo de Negócio

Como **operador responsável pela empresa**, desejo editar em `/configuracoes` os dados cadastrais da vidraçaria/serralheria (Razão Social, Nome Fantasia, CNPJ, Telefone/WhatsApp, E-mail e Endereço) para que as próximas propostas, comprovantes, fichas e etiquetas emitidos saiam com as informações oficiais atualizadas, operando em uma interface limpa sem menus *placeholder* inacabados.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Consulta e Atualização dos Dados Cadastrais da Empresa (`/configuracoes`)**
  - **Dado que** acesso `/configuracoes` na seção **"Dados da Empresa"**,
  - **Quando** a tela carrega os dados vindos de `GET /api/v1/settings/company`,
  - **Então** visualizo o formulário preenchido (`Razão Social`, `Nome Fantasia`, `CNPJ`, `Inscrição Estadual` opcional, `Telefone / WhatsApp`, `E-mail`, `CEP`, `Endereço` e `Cidade / UF`) com preview do cabeçalho junto à logo fixa (`logo-alumiportas.png`), podendo salvar alterações via `PUT /api/v1/settings/company`.

- [ ] **Cenário 2: Validação Cadastral de Campos Obrigatórios e Formato**
  - **Dado que** edito os dados da empresa em `/configuracoes`,
  - **Quando** informo CNPJ inválido, e-mail malformado ou omito campos essenciais,
  - **Então** o formulário exibe erro inline e o backend rejeita entradas inválidas com **HTTP 400 Bad Request**.

- [ ] **Cenário 3: Consumo Dinâmico nos Novos Documentos PDF (Sem Reprocessamento Retroativo)**
  - **Dado que** salvei novos dados cadastrais em `/configuracoes`,
  - **Quando** emito um documento PDF a partir desse momento (`BudgetPdfService`, `OrderPdfService`, `ProductionSheetPdfService`, `PartSalePdfService` ou `ThermalLabelPdfRenderer`),
  - **Então** o cabeçalho reflete os dados atualizados do banco combinados à logo fixa, sem reprocessar ou reimprimir documentos emitidos anteriormente.

- [ ] **Cenário 4: Higienização de Menus e Placeholders para a Release 1.0**
  - **Dado que** navego pelo AlumiGest ERP na versão `v1.0.0`,
  - **Quando** inspeciono `Sidebar.tsx`, `Topbar.tsx` e `App.tsx`,
  - **Então** os itens não concluídos (`Dashboard`, `Financeiro` e ícones estáticos mortos) estão ocultos da navegação e `/configuracoes` exibe a página real.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Sem Upload de Logo):** Mantém-se o arquivo institucional estático `logo-alumiportas.png` sem upload de logo da empresa ou de clientes.
- **RN-02 (Fallback Seguro):** `CompanySettingsService` aplica fallback limpo para `CompanyProperties` quando necessário, evitando quebras de layout A4/térmico.
- **RN-03 (Sem Reimpressão Retroativa):** Não há reprocessamento de PDFs passados; pedidos aprovados mantêm seu snapshot comercial imutável (`US-14`).

---

## 🛡️ Definition of Done (DoD & Homologação Release 1.0)

- [ ] Testes MockMvc, Vitest e testes de geração PDF validando cabeçalho dinâmico e fallback.
- [ ] Suíte E2E Cypress autenticada (`cy.login()` com `cy.session()`) verde sem regressão nas suítes existentes.
- [ ] Smoke Test Docker integrado da Release `v1.0.0` concluído com SonarQube Quality Gate aprovado.

---

**Estimativa:** 5 Story Points (~11.0h) | **Branch:** `feat/us-50-configuracoes-empresa`

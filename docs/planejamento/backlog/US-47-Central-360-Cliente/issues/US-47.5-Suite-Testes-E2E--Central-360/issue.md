# [US-47.5] Suíte de Testes E2E (Cypress), Integração e Matriz de Casos de Teste da Central 360°

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-47.5`
- **Issue GitHub**: `#556`
- **US Pai**: `US-47: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas`
- **Release**: Sprint 08
- **Fase**: `Quality Assurance & Testing`
- **User Story**: Como Engenheiro de QA/Desenvolvedor, desejo automatizar os testes End-to-End (E2E) e de integração para garantir a estabilidade do Hub 360°, assegurando que as projeções de dados e a interface mestre-detalhe não sofram regressões.
- **Sub-área**: `Qualidade (QA) / Backend / Frontend (Cypress)`
- **Execução Paralela**: ✅ Sim
- **Arquivo / Alvo Principal**: `us47_hub_360_cliente.cy.ts`, `CustomerDashboardControllerIntegrationTest.java`
- **Labels Sugeridas**: `qa`, `testing`, `e2e`, `cypress`, `integration`

---

## 🎯 Objetivo & Descrição

Implementar a suíte abrangente de testes automatizados End-to-End (E2E) no Cypress e testes de integração de API no backend (Spring Boot/MockMvc) para a Central 360° do Cliente. Além disso, homologar a matriz de casos de teste com um roteiro de regressão oficial documentado no repositório.

### Contexto da Fase / Épico
Como a Central 360° integra múltiplos módulos (Cadastros, Vendas e Fabril), ela é suscetível a quebras em cascata. Os testes de integração (validando projeções CQRS) e os testes E2E (simulando a jornada visual) formam o Quality Gate essencial antes do deploy.

---

## 🛠️ Checklist de Implementação

- [ ] **Suíte Cypress E2E (`us47_hub_360_cliente.cy.ts`)**:
    - [ ] **HP**: Busca dinâmica, validação do Hero Card e 3 KPIs (TC-47-HP01).
    - [ ] **HP**: Abas de Orçamentos, PDF e O.S. com detalhamento de esquadrias (TC-47-HP02 a HP04).
    - [ ] **HP**: Abertura interativa de Ficha Técnica e Etiquetas (TC-47-HP05 a HP06).
    - [ ] **SP**: Exibição elegante de Empty States e tratamento de Erro 500 sem quebrar a sidebar (TC-47-SP01, SP02).
    - [ ] **EC**: O.S. volumosa com scroll vertical suave e validação de tokens Dark Mode (TC-47-EC01, EC02).
- [ ] **Script NPM**: Adicionar `test:e2e:us47` no `package.json`.
- [ ] **Testes de Integração Backend**: Validar projeções DTO CQRS em `CustomerDashboardControllerIntegrationTest.java`.
- [ ] **Documentação QA**: Publicar matriz em `docs/qualidade/casos-de-teste-us47-central-360-clientes.md`.

---

## ✅ Critérios de Aceitação

1. Todos os testes E2E devem passar com sucesso localmente e na pipeline CI executando o comando `npm run test:e2e:us47`.
2. Os testes de integração do backend devem executar com sucesso usando Maven (`mvn test`).
3. Não deve haver novos code smells ou apontamentos de vulnerabilidade introduzidos no SonarQube.
4. A documentação da matriz de regressão deve estar consolidada e disponível na pasta `docs/qualidade/`.

---

## 🔗 Referências & Documentos Relacionados

- 📋 **Matriz de Casos de Teste (QA)**: `docs/qualidade/casos-de-teste-us47-central-360-clientes.md`
- 📑 **Especificação Pai**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)
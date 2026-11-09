# [US-46.6] Suíte de Testes E2E (Cypress), Integração e Matriz de Casos de Teste da Venda Avulsa

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-46.6`
- **US Pai**: `US-46: Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas)`
- **Release**: Sprint 08
- **Fase**: `Quality Assurance & Testing`
- **User Story**: Como Engenheiro de QA/Desenvolvedor, desejo automatizar os testes End-to-End (E2E) do módulo de vendas avulsas, para garantir que as lógicas de precificação e bloqueios funcionem corretamente sem regressões antes de cada deploy.
- **Sub-área**: `Qualidade (QA) / Frontend (Cypress)`
- **Execução Paralela**: ✅ Sim
- **Arquivo / Alvo Principal**: `frontend/cypress/e2e/part-sales/us46_venda_avulsa_partes.cy.ts`
- **Labels Sugeridas**: `qa`, `testing`, `e2e`, `cypress`

---

## 🎯 Objetivo & Descrição

Implementar a suíte abrangente de testes automatizados End-to-End (E2E) utilizando Cypress para validar todos os critérios de aceitação estipulados na US-46. A suíte deve garantir que as complexidades matemáticas operadas no front-end (RN-02 e RN-04) estejam operando perfeitamente.

---

## 🛠️ Checklist de Implementação

- [ ] Criar arquivo spec base do Cypress: `us46_venda_avulsa_partes.cy.ts`.
- [ ] Implementar cenários de Caminho Feliz (HP01 a HP05).
- [ ] Implementar cenários de Caminho Triste e Bordas (SP01 a EC02).
- [ ] Implementar função de `teardown` (exclusão em cascata) no bloco `after()`.
- [ ] Adicionar atalhos de inicialização no `package.json` (`test:e2e:us46`).

---

## ✅ Critérios de Aceitação

1. O script de testes E2E deve contemplar ao menos 8 cenários (TC-46-HP01 ao TC-46-EC02) executando de ponta a ponta sem interações manuais.
2. A suíte deve passar com **100% de sucesso (8/8)** no ambiente local.
3. Não deve haver artefatos residuais persistidos na base de dados ao fim da execução.
4. O código TypeScript não deve apresentar infrações reportadas pelo Linter.

---

## 🔗 Referências & Documentos Relacionados
- 📋 **Matriz de Casos de Teste (QA)**: `docs/qualidade/casos-de-teste-us46-venda-avulsa.md`
- 🚀 **Relatório de Execução de Testes**: `docs/sistema/003-teste/RET-Relatorio_Execucao_Testes_Sprint08.md`
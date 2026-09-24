---
name: Solicitação de Funcionalidade (User Story / Feat)
about: Sugerir uma nova funcionalidade ou história de usuário para o backlog do AlumiGest.
title: "[FEAT] "
labels: feat
assignees: ''
---

## 🎯 User Story
**Como** [Papel do Usuário: Vendedor / Operador de Fábrica / Gerente Comercial],  
**Eu quero** [Ação / Funcionalidade / Comportamento esperado],  
**Para que** [Benefício comercial, operacional ou valor de negócio gerado].  

---

## 🧪 Critérios de Aceitação (TEA / BDD)
- [ ] **Cenário 1: [Nome do Cenário Principal]**
  - **Dado que** [contexto inicial e pré-condições]
  - **Quando** [ação executada pelo usuário ou sistema]
  - **Então** [resultado esperado e pós-condições observáveis]
- [ ] **Cenário 2: [Cenário Alternativo / Validação de Limites]**
  - **Dado que** [cenário com dados inválidos ou borda]
  - **Quando** [dispara a validação]
  - **Então** [sistema impede com mensagem amigável e código HTTP apropriado]

---

## 🛡️ Definition of Done (DoD) & Critérios de Homologação Integrada (Release 1)
> *Critérios obrigatórios herdados e diluídos da validação contínua da Release 1 (antiga US-12)*

- [ ] **Pirâmide de Testes Automatizados**:
  - [ ] Testes unitários implementados cobrindo casos de sucesso e exceções (`JUnit 5` / `Vitest`).
  - [ ] Testes de integração de endpoints REST e persistência (`@SpringBootTest` / `H2` / `MockMvc`).
- [ ] **SonarQube Quality Gate**:
  - [ ] Cobertura de testes em código novo $\ge 80\%$ nas classes de serviço de domínio (`*Service`, `*Calculator`).
  - [ ] 0 Vulnerabilidades SAST e 0 Bugs bloqueantes reportados.
  - [ ] Conformidade estrita com o SonarLint pré-PR (Clean as You Code).
- [ ] **Precisão Numérica e Arquitetura**:
  - [ ] Cálculos monetários utilizando `BigDecimal` com escala 2 e arredondamento `RoundingMode.HALF_EVEN`.
  - [ ] DTOs Records Java obrigatórios (nenhuma entidade JPA exposta na API).
  - [ ] Transações com `@Transactional(readOnly = true)` e métodos de mutação anotados.
- [ ] **Validação Operacional Ponta a Ponta**:
  - [ ] Fluxo validado com sucesso conforme guia `quickstart.md`.
  - [ ] Responsividade mobile e feedback visual (`loading` e tratamento de erros) validados.
- [ ] **Governança Docs-as-Code (`alumigest-doc-governor`)**:
  - [ ] Contratos de API REST atualizados em `docs/sistema/001-analise-projeto/API-Especificacao_API_REST.md`.
  - [ ] Modelo de dados / migrations Flyway documentados no MER se aplicável.
  - [ ] Cenários de teste homologados no `TEA-Testes_de_Aceitacao_SprintXX.md`.

# [US-16.4] Testes de Sistema E2E, Validação BDD e Homologação do Quickstart

## 🎯 Objetivo & Valor de Negócio

Validar o funcionamento integral de todas as fatias verticais da Sprint 06 através de testes de sistema e aceitação de ponta a ponta, homologando os cenários BDD/Gherkin descritos na especificação e executando o checklist do quickstart.md.

---

## 📝 Escopo Técnico

- **Frontend / E2E & Sistema**:
  - Testes E2E cobrindo a jornada completa do usuário:
    1. Acessar proposta orçamentária aprovada em `BudgetDetailPage`;
    2. Clicar em 'Aprovar e Gerar Pedido', selecionar canal `WHATSAPP`, confirmar prazo e submeter;
    3. Confirmar redirecionamento para `OrderDetailPage` com código `PED-YYYY-NNNN`;
    4. Verificar exibição dos itens congelados com selo de lock;
    5. Clicar em 'Emitir Comprovante do Pedido' e verificar download do PDF;
    6. Retornar à listagem `/pedidos` e verificar presença do novo pedido com badge correspondente;
    7. Testar cancelamento de pedido com preenchimento de justificativa obrigatória;
    8. Validar na tela do orçamento a opção de reabertura para rascunho (`DRAFT`).
- **Homologação**:
  - Execução e verificação passo a passo de todos os comandos e endpoints listados em `docs/planejamento/sprint-06/quickstart.md`.

---

## 🛠️ Checklist de Implementação

- [ ] Configurar/escrever suite de testes E2E cobrindo o fluxo de conversão, listagem, detalhe e cancelamento
- [ ] Validar visualmente a responsividade das páginas `OrderListPage` e `OrderDetailPage`
- [ ] Executar os passos do guia `quickstart.md` para validação manual dos cenários de teste
- [ ] Validar que a compilação completa do backend (`mvn clean verify`) passa sem erros
- [ ] Validar que o build do frontend (`npm run build`) passa sem erros de tipagem
- [ ] Documentar os resultados da homologação e certificar prontidão para a Release 2

---

## ✅ Definition of Done (DoD)

1. [ ] **Compilação**: Código compila sem erros (`mvn clean compile` e `npm run build`).
2. [ ] **Testes Unitários**: Testes unitários passam com sucesso (`mvn test` e `npx vitest run`).
3. [ ] **Qualidade de Código**: Zero warnings bloqueantes e conformidade com Checkstyle / Oxlint.
4. [ ] **Valor Funcional**: Funcionalidade testável de ponta a ponta no navegador (ou verificação de schema/serviço).
5. [ ] **Documentação Inline**: Javadoc / TSDoc nos métodos públicos e classes relevantes.
6. [ ] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos e verificados.
7. [ ] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em português do Brasil (pt-BR).

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- 📋 **Lista de Tarefas**: [tasks.md](../../tasks.md)
- 📐 **Modelo de Dados**: [data-model.md](../../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-orders.md](../../contracts/api-orders.md)
- ⏱️ **Guia de Estimativa de Horas**: [guia-estimativa-horas.md](../../../guia-estimativa-horas.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 📜 **Constituição do Projeto**: [constitution.md](../../../constitution.md)

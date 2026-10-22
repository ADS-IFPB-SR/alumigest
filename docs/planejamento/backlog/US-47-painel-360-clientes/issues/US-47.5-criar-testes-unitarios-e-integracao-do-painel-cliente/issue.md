# [US-47.5] Criar suíte de testes unitários e de integração no backend (`MockMvc`) e frontend (`Vitest / RTL`)

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-47.5`
- **US Pai**: `US-47: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas`
- **Issue no GitHub**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)
- **Release**: Release 2 (v2.0.0) — Qualidade & Governança
- **Sub-área**: `Qualidade / Testes`
- **Arquivo / Alvo Principal**: `backend/src/test/java/br/edu/ifpb/alumigest/customer/CustomerHubControllerTest.java` e `frontend/src/features/customers/__tests__/CustomerHubPage.test.tsx`
- **Labels Sugeridas**: `release-2`, `testing`, `backend`, `frontend`, `vitest`, `mockmvc`, `quality`

---

## 🎯 Objetivo & Descrição

Criar uma suíte completa de testes automatizados unitários e de integração para blindar as funcionalidades da US-47 tanto no backend quanto no frontend:
1. **Backend Tests**:
   - Teste unitário e de integração do `CustomerHubController` via `MockMvc` validando os status HTTP (200 OK, 404 Not Found), headers e payloads dos endpoints `/dashboard`, `/orders` e `/budgets`.
   - Teste de geração de PDF do `TechnicalSheetPdfServiceTest` validando a integridade dos bytes binários, cálculos de corte e ausência de exceções.
2. **Frontend Tests**:
   - Testes com Vitest e React Testing Library para a página `CustomerHubPage`, simulando a seleção de clientes na barra lateral, alternância entre abas de O.S. e Orçamentos, e abertura dos modais de Ficha Técnica e Etiquetas Térmicas.
   - Garantir que a cobertura combinada das novas classes e componentes atinja $\ge 80\%$.

---

## 🛠️ Checklist de Implementação

- [ ] Implementar `CustomerHubControllerTest.java` com testes de contrato REST cobrindo cenários com e sem dados
- [ ] Implementar `TechnicalSheetPdfServiceTest.java` validando compilação do PDF sem erros
- [ ] Implementar `CustomerHubPage.test.tsx` testando renderização, seleção de cliente e clique nos botões de ação
- [ ] Implementar teste para o hook `useCustomerHub` com `@testing-library/react-hooks`
- [ ] Executar suíte completa do backend: `mvn clean test`
- [ ] Executar suíte completa do frontend: `npm run test`
- [ ] Verificar relatório de cobertura do JaCoCo e Vitest Coverage garantindo $\ge 80\%$

---

## ✅ Critérios de Aceitação

1. Todos os testes devem rodar de forma isolada, rápida e determinística (sem dependência de banco de dados externo ou conexão com a internet).
2. O teste da Ficha Técnica deve validar que os comprimentos de corte e folgas nominais vêm do serviço backend.
3. Nenhum teste regressivo existente no repositório deve falhar.
4. Cobertura mínima de $80\%$ de linhas nas novas classes e componentes.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- 🔌 **Endpoints Backend**: [US-47.1](../US-47.1-criar-endpoints-agregados-customers-orders-budgets/issue.md)
- 🖥️ **Componentes Frontend**: [US-47.4](../US-47.4-implementar-pagina-mestre-detalhe-painel-360-clientes/issue.md)

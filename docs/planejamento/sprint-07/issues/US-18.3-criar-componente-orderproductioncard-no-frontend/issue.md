# [US-18.3] Criar componente `OrderProductionCard` no frontend exibindo dados do pedido, cliente, indicador de prazo (urgência/SLA), contagem de peças e botões de avanço

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-18.3`
- **US Pai**: `US-18: Acompanhar Produção via Painel Kanban de Pedidos de Venda`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sub-área**: `Frontend UI / Cards`
- **Arquivo / Alvo Principal**: `frontend/src/features/production/components/OrderProductionCard.tsx`
- **Labels Sugeridas**: `release-2`, `production`, `frontend`, `react`, `typescript`, `tailwind`, `kanban`

---

## 🎯 Objetivo & Descrição

Criar o componente `OrderProductionCard` responsável por apresentar visualmente as informações de cada pedido dentro das colunas do quadro Kanban.

O card deve incluir:
1. Código do pedido em negrito com link clicável para detalhes (`/pedidos/:id`);
2. Nome do cliente;
3. Quantidade total de esquadrias contratadas (ex: `3 peças`);
4. Data prevista de entrega formatada (`DD/MM/AAAA`);
5. **Badge de urgência de prazo (SLA)**:
   - Verde: entrega com $> 3$ dias de antecedência;
   - Amarelo: entrega entre $0$ e $3$ dias (atenção / crítico);
   - Vermelho: entrega atrasada ($< 0$ dias).
6. Botões contextuais de transição de status (ex: "Iniciar Produção" na primeira coluna e "Concluir Produção" na segunda coluna).

---

## 🛠️ Checklist de Implementação

- [ ] Criar `frontend/src/features/production/components/OrderProductionCard.tsx`
- [ ] Implementar função de cálculo de dias restantes até `dataPrevisaoEntrega`
- [ ] Estilizar badges de SLA de prazo utilizando classes Tailwind (verde, âmbar e vermelho)
- [ ] Exibir atalho rápido para impressão de etiquetas térmicas (`US-17`) diretamente no card
- [ ] Implementar botões de avanço de estágio com estados desabilitados durante a mutação
- [ ] Adicionar micro-animações de hover para elevar a experiência visual do usuário

---

## ✅ Definition of Done (DoD)

1. [ ] **Compilação**: Frontend compila sem erros (`npm run build`).
2. [ ] **Acessibilidade & UI**: Cores contrastantes e tipografia clara para o chão de fábrica.
3. [ ] **Valor Funcional**: Exibe corretamente os dados, badges de SLA e aciona a mutação de status.
4. [ ] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos.
5. [ ] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em pt-BR.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../../data-model.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../../constitution.md)

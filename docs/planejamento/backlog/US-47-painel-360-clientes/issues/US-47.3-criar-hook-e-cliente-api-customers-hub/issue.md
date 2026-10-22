# [US-47.3] Criar cliente de API e hook TanStack Query `useCustomerHub` com tipagem estrita no frontend

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-47.3`
- **US Pai**: `US-47: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas`
- **Issue no GitHub**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)
- **Release**: Release 2 (v2.0.0) — Gestão Comercial & Frontend
- **Sub-área**: `Frontend State / API`
- **Arquivo / Alvo Principal**: `frontend/src/features/customers/hooks/useCustomerHub.ts`
- **Labels Sugeridas**: `release-2`, `customer`, `frontend`, `react`, `typescript`, `tanstack-query`, `api`

---

## 🎯 Objetivo & Descrição

Implementar a camada de integração HTTP e gerenciamento de estado assíncrono para a Central 360° do Cliente no frontend utilizando TanStack Query (React Query) e Axios:
1. Definir interfaces TypeScript estritas correspondentes aos DTOs de leitura do backend (`CustomerDashboard`, `CustomerOrder`, `CustomerBudget`, `CustomerOrderItem`).
2. Criar as funções de cliente HTTP em `frontend/src/features/customers/api/customerHubApi.ts`:
   - `fetchCustomerDashboard(customerId: string)`
   - `fetchCustomerOrders(customerId: string)`
   - `fetchCustomerBudgets(customerId: string)`
   - `downloadTechnicalSheetPdf(orderId: string)`
3. Criar o hook customizado `useCustomerHub(customerId: string)` com caching inteligente, estados de `isLoading`, `isError`, refetch automático e métodos determinísticos de revogação de Blob URLs para downloads de PDF.

---

## 🛠️ Checklist de Implementação

- [ ] Definir interfaces TypeScript imutáveis para todas as entidades de resposta em `frontend/src/features/customers/types/customerHub.ts`
- [ ] Implementar funções de chamada de API no cliente Axios configurado da aplicação
- [ ] Implementar o hook `useCustomerHub` com `queryKey: ['customers', customerId, 'hub']` e `staleTime: 1000 * 60 * 2` (2 minutos)
- [ ] Garantir que o frontend não contenha nenhuma regra de negócio de cálculo de totais ou fórmulas de dedução (estrito cumprimento do SOLID / Clean Architecture)
- [ ] Implementar função utilitária para download e liberação imediata de Blob URLs (`window.URL.revokeObjectURL`)
- [ ] Validar compilação com `npm run build` ou `tsc --noEmit` sem erros de tipagem

---

## ✅ Critérios de Aceitação

1. O hook `useCustomerHub` deve sincronizar dados das 3 fontes (Dashboard, Orders, Budgets) sob a chave do cliente selecionado.
2. Trocar de cliente na interface deve cancelar requisições anteriores em voo (`AbortSignal`) e invalidar o estado de forma limpa.
3. Não deve existir vazamento de memória ao realizar downloads sucessivos de PDFs de Ficha Técnica ou Comprovante.
4. Tipagem 100% estrita sem uso de `any`.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- 🔌 **Endpoints Backend**: [US-47.1](../US-47.1-criar-endpoints-agregados-customers-orders-budgets/issue.md)
- 🖥️ **Protótipo de Interface**: [painel-clientes-360.html](../../../prototipos/painel-clientes-360.html)

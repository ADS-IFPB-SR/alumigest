# Especificação Funcional: US-26 — Modal PIX Interativo no Frontend e Histórico de Transações

**Identificador**: `US-26`  
**Issue GitHub**: [#151](https://github.com/ADS-IFPB-SR/alumigest/issues/151)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Modal com polling/WebSocket para atualização instantânea do pagamento PIX na tela do vendedor/cliente.

---

## 📋 Sub-Tarefas / Issues Vinculadas (7 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-26.1-criar-interfaces-typescript-e-servico-axios-p/issue.md) | Criar interfaces TypeScript e serviço Axios (`pixApi.ts`) em `frontend/src/features/finance/services/pixApi.ts` | 🔲 No Backlog |
| [US](issues/US-26.2-criar-custom-hook-usepixpayment-com-polling-a/issue.md) | Criar custom hook `usePixPayment` com polling automático a cada 3 segundos em `frontend/src/features/finance/hooks/usePixPayment.ts` | 🔲 No Backlog |
| [US](issues/US-26.3-criar-componente-pixpaymentmodal-com-qr-code-/issue.md) | Criar componente `PixPaymentModal` com QR Code, botão "Copiar Chave PIX" e timer regressivo em `frontend/src/features/finance/components/PixPaymentModal.tsx` | 🔲 No Backlog |
| [US](issues/US-26.4-criar-componente-pixpaymentsuccessalert-com-a/issue.md) | Criar componente `PixPaymentSuccessAlert` com animação de confirmação em `frontend/src/features/finance/components/PixPaymentSuccessAlert.tsx` | 🔲 No Backlog |
| [US](issues/US-26.5-integrar-botao-gerar-pix-na-pagina-de-detalhe/issue.md) | Integrar botão "Gerar PIX" na página de detalhes do pedido (`OrderDetailPage.tsx`) e destacar o botão "Liberar para Produção" quando o status for `SINAL_PAGO` | 🔲 No Backlog |
| [US](issues/US-26.6-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | 🔲 No Backlog |
| [US](issues/US-26.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste do `quickstart.md` da Sprint 9 | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

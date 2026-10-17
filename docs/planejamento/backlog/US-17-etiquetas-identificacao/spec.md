# Especificação Funcional: US-17 — Emitir Etiquetas de Identificação de Peças por Item do Pedido

**Identificador**: `US-17`  
**Issue GitHub**: [#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Emitir etiquetas adesivas térmicas de identificação (100x60mm) para cada exemplar físico de esquadria de um pedido de venda aprovado, contendo medidas nominais L x A mm, cor, vidro e identificação do cliente.

---

## 📋 Sub-Tarefas / Issues Vinculadas (5 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-17.1](issues/US-17.1-criar-servico-labelpdfservice-usando-openpdf/issue.md) | Criar serviço `LabelPdfService` usando OpenPDF com layout térmico (100x60mm) contendo dados do pedido, cliente, medidas nominais, cor, vidro e numeração da peça | 🟢 Concluída (#448) |
| [US-17.2](issues/US-17.2-adicionar-endpoint-get-api-orders-orderid-labels-pdf/issue.md) | Adicionar endpoint `GET /api/orders/{orderId}/labels-pdf` no backend retornando documento `application/pdf` | 🟢 Concluída (#449) |
| [US-17.3](issues/US-17.3-criar-teste-unitario-do-labelpdfservice/issue.md) | Criar teste unitário do `LabelPdfService` validando geração de bytes e paginação exata por quantidade de peças | 🟢 Concluída (#450) |
| [US-17.4](issues/US-17.4-adicionar-botao-imprimir-etiquetas-no-frontend/issue.md) | Adicionar botão "Imprimir Etiquetas" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx`) | 🟢 Concluída (#451) |
| [US-17.5](issues/US-17.5-testes-e2e-validacao-cenarios-aceitacao-etiquetas/issue.md) | Testes E2E — Validação dos Cenários de Aceitação de Etiquetas Térmicas de Identificação ([#474](https://github.com/ADS-IFPB-SR/alumigest/issues/474)) | 🟢 Concluída (#474) |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

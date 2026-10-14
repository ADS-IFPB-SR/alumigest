# [US-17.2] Adicionar endpoint `GET /api/orders/{orderId}/labels-pdf` no backend retornando documento `application/pdf`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-17.2`
- **US Pai**: `US-17: Emitir Etiquetas de Identificação de Peças por Item do Pedido`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sub-área**: `Backend REST / API`
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/orders/controller/OrderController.java`
- **Labels Sugeridas**: `release-2`, `orders`, `backend`, `java`, `rest`, `pdf`

---

## 🎯 Objetivo & Descrição

Expor o endpoint REST `GET /api/orders/{orderId}/labels-pdf` no `OrderController`, integrando-o ao `LabelPdfService`. O endpoint deve retornar o fluxo binário do PDF com cabeçalhos apropriados (`Content-Type: application/pdf` e `Content-Disposition: inline; filename="etiquetas-PED-YYYY-NNNN.pdf"`), tratando cenários de pedido não encontrado (HTTP 404) ou sem itens (HTTP 422).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar o contrato em `docs/planejamento/sprint-07/contracts/api-production.md`
- [ ] Injetar `LabelPdfService` no `OrderController`
- [ ] Adicionar método `@GetMapping("/{id}/labels-pdf")`
- [ ] Recuperar pedido ativo por ID via `OrderRepository` ou `OrderService`
- [ ] Invocar `labelPdfService.generateLabelsPdf(order)`
- [ ] Configurar `HttpHeaders`:
  - `CONTENT_TYPE = MediaType.APPLICATION_PDF_VALUE`
  - `CONTENT_DISPOSITION = "inline; filename=\"etiquetas-" + order.getCodigo() + ".pdf\""`
- [ ] Retornar `ResponseEntity<byte[]>` com status `200 OK`
- [ ] Adicionar anotações Swagger/OpenAPI `@Operation`, `@ApiResponse`

---

## ✅ Definition of Done (DoD)

1. [ ] **Compilação**: Código compila sem erros (`mvn clean compile`).
2. [ ] **Testes Unitários**: Testes unitários do controller passam com sucesso (`mvn test`).
3. [ ] **Qualidade de Código**: Zero warnings bloqueantes e conformidade com Checkstyle.
4. [ ] **Valor Funcional**: Endpoint responde com 200 OK e stream binário do PDF quando chamado via curl.
5. [ ] **Documentação Inline**: Documentação OpenAPI e Javadoc no método do controller.
6. [ ] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos.
7. [ ] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em pt-BR.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../../plan.md)
- 🔌 **Contrato de API**: [contracts/api-production.md](../../contracts/api-production.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../../constitution.md)

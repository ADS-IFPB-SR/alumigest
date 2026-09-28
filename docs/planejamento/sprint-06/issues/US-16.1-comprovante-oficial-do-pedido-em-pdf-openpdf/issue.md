# [US-16.1] Comprovante Oficial do Pedido de Venda em PDF via OpenPDF (Full-Stack)

## 🎯 Objetivo & Valor de Negócio

Gerar documento PDF oficial A4 do Pedido de Venda contendo cabeçalho institucional da Alumiportas, número do pedido (`PED-YYYY-NNNN`), dados do cliente, esquadrias com medidas e cores, valores congelados, cronograma prometido e campos de assinatura.

---

## 📝 Escopo Técnico

- **Backend (OpenPDF)**:
  - `OrderPdfService.java`: Geração do PDF A4 com OpenPDF:
    - Cabeçalho institucional com dados da empresa e código do pedido;
    - Dados do cliente e endereço de entrega;
    - Tabela de esquadrias contratadas (quantidade, tipologia, medidas em mm, acabamentos, valores unitários e subtotais);
    - Resumo financeiro (total bruto, taxas de frete/instalação, descontos, valor líquido);
    - Condições de pagamento acertadas e observações comerciais;
    - Paginação fluida com rodapé institucional 'Página X de Y';
    - Seção de assinaturas da empresa e do cliente.
  - `OrderController.java`: Endpoint `GET /api/orders/{id}/pdf/comprovante` retornando `byte[]` com `MediaType.APPLICATION_PDF` e header `Content-Disposition: inline; filename="comprovante-pedido-PED-YYYY-NNNN.pdf"`.
- **Frontend**:
  - Ação 'Emitir Comprovante do Pedido' na `OrderDetailPage.tsx` com estado de carregamento e download via Blob/URL.

---

## 🛠️ Checklist de Implementação

- [ ] Criar serviço `OrderPdfService` com layout institucional A4 estruturado usando OpenPDF
- [ ] Implementar cabeçalho oficial com dados da Alumiportas e código do pedido
- [ ] Construir tabela detalhada dos itens com dimensões, acabamentos e valores financeiros congelados
- [ ] Adicionar bloco de condições de pagamento, observações e campos para assinaturas
- [ ] Configurar evento de quebra fluida de páginas e rodapé numerado 'Página X de Y'
- [ ] Criar endpoint `GET /api/orders/{id}/pdf/comprovante` no `OrderController`
- [ ] Integrar botão 'Emitir Comprovante do Pedido' na página `OrderDetailPage.tsx` no frontend
- [ ] Escrever suite de testes unitários no `OrderPdfServiceTest`

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

# [US-17.3] Criar bateria de testes unitários do `LabelPdfService` validando geração de bytes, contagem exata de páginas por peças físicas e tratamento de exceções

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-17.3`
- **US Pai**: `US-17: Emitir Etiquetas de Identificação de Peças por Item do Pedido`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sub-área**: `Testes Unitários / QA`
- **Arquivo / Alvo Principal**: `backend/src/test/java/br/edu/ifpb/alumigest/orders/service/LabelPdfServiceTest.java`
- **Labels Sugeridas**: `release-2`, `orders`, `backend`, `java`, `tests`, `junit5`

---

## 🎯 Objetivo & Descrição

Criar uma suíte completa de testes unitários com JUnit 5 e AssertJ para o serviço `LabelPdfService`. Os testes devem assegurar que:
1. Um pedido com múltiplos itens e quantidades gera um PDF com o número de páginas estritamente igual à soma das quantidades físicas ($\sum \text{quantidade}$);
2. Os bytes gerados começam com o magic number de PDF (`%PDF-`);
3. Pedidos nulos ou sem itens disparam as devidas exceções de negócio com mensagens claras.

---

## 🛠️ Checklist de Implementação

- [ ] Criar classe de teste `LabelPdfServiceTest` em `src/test/java/br/edu/ifpb/alumigest/orders/service/`
- [ ] Implementar teste com pedido válido contendo 2 itens (item 1 com qtd 2, item 2 com qtd 1):
  - Validar que o array de bytes não é nulo e tamanho > 0
  - Validar que o cabeçalho contém os bytes `%PDF-`
  - Utilizar leitor de PDF (ex: `PdfReader` do OpenPDF) para inspecionar `reader.getNumberOfPages() == 3`
  - Validar dimensões da página (`getPageSize().getWidth() == 283.46f` e `getHeight() == 141.73f` com tolerância delta)
- [ ] Implementar teste com pedido sem itens: verificar que lança `BusinessException`
- [ ] Implementar teste com itens contendo valores nulos opcionais (ex: sem vidro especificado) para garantir ausência de `NullPointerException`

---

## ✅ Definition of Done (DoD)

1. [ ] **Compilação**: Testes compilam sem erros (`mvn test-compile`).
2. [ ] **Execução**: Todos os testes da classe passam com 100% de sucesso (`mvn test -Dtest=LabelPdfServiceTest`).
3. [ ] **Qualidade de Código**: Código de teste limpo, legível e seguindo padrão AAA (Arrange, Act, Assert).
4. [ ] **Valor Funcional**: Blindagem completa do gerador de etiquetas contra regressões e erros de paginação.
5. [ ] **Documentação Inline**: Nomes de métodos de teste descritivos em português (ex: `deveGerarUmaPaginaPorUnidadeFisicaDePeca`).
6. [ ] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos.
7. [ ] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em pt-BR.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../../data-model.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../../constitution.md)

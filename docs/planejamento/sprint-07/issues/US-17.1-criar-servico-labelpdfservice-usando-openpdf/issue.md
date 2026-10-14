# [US-17.1] Criar serviço `LabelPdfService` usando OpenPDF com layout térmico (100x50mm) contendo dados do pedido, cliente, medidas nominais, cor, vidro e numeração da peça

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-17.1`
- **US Pai**: `US-17: Emitir Etiquetas de Identificação de Peças por Item do Pedido`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sub-área**: `Backend Core / PDF`
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/orders/service/LabelPdfService.java`
- **Labels Sugeridas**: `release-2`, `orders`, `production`, `backend`, `java`, `pdf`, `labels`

---

## 🎯 Objetivo & Descrição

Criar o serviço `LabelPdfService` utilizando a biblioteca **OpenPDF**, configurando um tamanho de página personalizado para etiquetas térmicas adesivas industriais (**100 mm de largura por 50 mm de altura**, equivalente a $283.46 \times 141.73 \text{ pt}$).

O serviço deve receber a entidade `Order` com seus itens congelados (`OrderItem`) e gerar um fluxo de bytes PDF onde cada exemplar físico de esquadria é impresso em uma página dedicada. Se um item tiver `quantidade = 3`, serão geradas 3 páginas sequenciais indicando "Peça 1 de 3", "Peça 2 de 3" e "Peça 3 de 3".

---

## 🛠️ Checklist de Implementação

- [ ] Analisar as dimensões e modelo no documento de dados (`docs/planejamento/sprint-07/data-model.md`)
- [ ] Criar classe `LabelPdfService` no pacote `br.edu.ifpb.alumigest.orders.service`
- [ ] Configurar o documento OpenPDF com `new Rectangle(283.46f, 141.73f)` e margens de 10 pt
- [ ] Iterar sobre cada `OrderItem` e sobre a quantidade de cada item ($1 \dots \text{quantidade}$)
- [ ] Renderizar layout contendo:
  - Cabeçalho: Empresa ("ALUMIPORTAS") e Código do Pedido (`PED-YYYY-NNNN`)
  - Cliente: Nome e Data Prevista de Entrega
  - Modelo/Descrição do Item
  - Medidas Nominais em destaque: `Largura x Altura mm`
  - Cor do perfil, tipo de vidro e orientação de abertura
  - Rodapé: Identificação da peça (ex: "Peça X de Y")
- [ ] Retornar `byte[]` pronto para escrita na resposta HTTP
- [ ] Tratar caso de pedido sem itens lançando `BusinessException` com mensagem em pt-BR

---

## ✅ Definition of Done (DoD)

1. [ ] **Compilação**: Código compila sem erros (`mvn clean compile`).
2. [ ] **Testes Unitários**: Testes unitários passam com sucesso (`mvn test`).
3. [ ] **Qualidade de Código**: Zero warnings bloqueantes e conformidade com Checkstyle.
4. [ ] **Valor Funcional**: Geração correta do PDF com dimensões 100x50 mm e paginação exata por peça física.
5. [ ] **Documentação Inline**: Javadoc nos métodos públicos explicando parâmetros e dimensões.
6. [ ] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos.
7. [ ] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em pt-BR.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../../data-model.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../../constitution.md)

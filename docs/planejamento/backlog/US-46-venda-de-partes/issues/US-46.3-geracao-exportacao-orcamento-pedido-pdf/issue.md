# [US-46.3] Geração e Exportação do Orçamento/Pedido em PDF (Back & Front)

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-46.3`
- **US Pai**: `US-46: Módulo de Venda Avulsa de Partes (Vidro em m² e Alumínio em Metro Linear)`
- **Release**: Backlog Comercial & Estoque
- **Sub-área**: `Fullstack (Backend & Frontend)`
- **Execução Paralela**: ⚠️ Sim (Depende do modelo de dados de `US-46.1`)
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/partsale/service/PartSalePdfService.java` e `frontend/src/modules/part-sales/components/PartSalePdfExportButton.tsx`
- **Labels Sugeridas**: `backend`, `frontend`, `pdf`, `openpdf`, `jasperreports`, `reports`, `react`, `typescript`

---

## 🎯 Objetivo & Descrição

Disponibilizar a emissão e download em tempo real do documento formal em PDF do orçamento ou pedido de venda de partes avulsas com layout corporativo da Alumiportas, apresentando o detalhamento dimensional e financeiro dos insumos agrupados por categoria (Vidros e Alumínios).

Esta issue contempla o motor de renderização gráfica vetorial no backend e a integração do botão de download via blob no frontend, assegurando tempo de resposta rápido ($\le 1,5\text{s}$) e layout conforme identidade visual da empresa.

---

## 🛠️ Checklist de Implementação

- [ ] Implementar o serviço de geração de documento PDF `PartSalePdfService`:
  - Utilizar OpenPDF ou JasperReports já integrados à stack do projeto.
  - Configurar página no padrão A4 Retrato com margens de $10\text{ mm}$.
  - Renderizar cabeçalho institucional (logotipo Alumiportas, Razão Social, CNPJ, dados de contato e código `PART-YYYY-NNNN`).
  - Renderizar dados do cliente, data de emissão, validade da proposta e condições de pagamento.
  - Estruturar tabela de itens agrupada por seções:
    - **Seção VIDROS**: Descrição, espessura, dimensões ($L \times A\text{ mm}$), área total ($\text{m}^2$), quantidade, preço unitário por m² e total.
    - **Seção ALUMÍNIOS**: Descrição, cor/acabamento, comprimento nominal ($\text{mm}$), metragem faturada com perda ($\text{m}$), quantidade de barras, preço unitário por metro e total.
  - Renderizar bloco de resumo financeiro (Subtotal, Desconto e Valor Total faturado).
  - Incluir rodapé institucional com campo para assinatura do cliente e observações de tolerância técnica de corte.
- [ ] Expor o endpoint REST `GET /api/v1/part-sales/{id}/pdf` no `PartSaleController` retornando `application/pdf` com cabeçalho `Content-Disposition: attachment; filename="Orcamento_Partes_PART-YYYY-NNNN.pdf"`.
- [ ] Criar o componente `PartSalePdfExportButton.tsx` no frontend:
  - Botão estilizado com ícone `FileText` do Lucide (`variant="outline"`).
  - Gestão de estado de loading com spinner durante a requisição de download.
  - Tratamento de stream e download automático de blob através de `URL.createObjectURL(blob)`.
- [ ] Implementar testes unitários e de integração validando geração de bytes válidos do PDF e cabeçalhos HTTP adequados.

---

## ✅ Critérios de Aceitação

1. O download do arquivo PDF deve iniciar de forma transparente ao acionar o botão "Exportar PDF" na interface.
2. O documento exportado deve conter todos os blocos institucionais, cliente, itens agrupados por categoria e totalizadores financeiros.
3. O tempo de geração e retorno do documento deve ser inferior a $1,5\text{ segundo}$.
4. A numeração do documento deve seguir estritamente o código da venda (`PART-YYYY-NNNN`).
5. A exportação deve ser bloqueada caso a cotação não possua nenhum item associado.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 📄 **Exemplo de Layout de PDF Técnico**: [../../../projeto-001/001-atas-reuniao/](../../../projeto-001/001-atas-reuniao/)

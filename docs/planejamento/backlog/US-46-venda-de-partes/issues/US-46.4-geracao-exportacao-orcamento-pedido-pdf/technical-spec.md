# Especificação Técnica de Apoio: US-46.4 — Geração e Exportação do Orçamento em PDF A4

Este documento detalha os aspectos de arquitetura, classes e contratos técnicos para a implementação da fatia vertical **US-46.4**.

---

## ☕ 1. Backend Core & Serviço OpenPDF

- **Pacote:** `br.edu.ifpb.alumigest.partsale.service`
- **Classe:** `PartSalePdfService.java`
  - Utiliza biblioteca OpenPDF (Java 21).
  - Formato: A4 Retrato, margens de 10 mm.
  - **Estrutura Gráfica do Documento:**
    1. **Cabeçalho:** Logotipo institucional da Alumiportas, Razão Social, CNPJ, dados de contato e código da venda (`PART-YYYY-NNNN`).
    2. **Dados do Cliente:** Nome/Razão Social, CPF/CNPJ, Telefone, Endereço e Data de Emissão.
    3. **Tabelas Agrupadas por Categoria (omitindo seções sem itens):**
       - **Seção VIDROS:** Descrição, espessura, dimensões ($L \times A$ mm), área total ($m^2$), quantidade, valor unitário por $m^2$ e total.
       - **Seção ALUMÍNIOS:** Descrição/acabamento, comprimento nominal (mm), metragem total faturada (m), quantidade de barras, preço por metro e total.
       - **Seção FERRAGENS:** Descrição da peça, quantidade (`un`), preço unitário e total (sem colunas dimensionais vazias).
       - **Seção PELÍCULAS:** Descrição/tonalidade, dimensões ($L \times A$ mm), área faturada com perda ($m^2$), quantidade, valor unitário e total.
    4. **Resumo Financeiro & Rodapé:** Subtotal, Desconto, Valor Total, espaço para assinatura e notas técnicas de tolerância de corte.
- **Endpoint REST (`PartSaleController.java`):**
  - `GET /api/v1/part-sales/{id}/pdf`
  - Retorna `application/pdf` com `Content-Disposition: attachment; filename="Orcamento_Partes_PART-YYYY-NNNN.pdf"`.
  - Desempenho esperado: tempo de compilação inferior a 1,5 segundo.

---

## ⚛️ 2. Frontend UI & Componentes

- **Módulo:** `frontend/src/modules/part-sales/components/`
- **Componente:** `PartSalePdfExportButton.tsx`
  - Botão com ícone `FileText` (`variant="outline"`).
  - Estado de loading durante o streaming de bytes com ícone `Loader2`.
  - Tratamento de blob:
    ```typescript
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Orcamento_Partes_${code}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    ```

---

## 🧪 3. Estratégia de Testes (QA)

- `PartSalePdfServiceTest.java`:
  - Teste com proposta contendo as 4 categorias populadas, validando integridade do PDF gerado (bytes não nulos, tamanho $> 10\text{ KB}$).
  - Teste com proposta contendo apenas ferragens, validando que seções de vidros, alumínios e películas são omitidas.
- `PartSaleControllerTest.java` (MockMvc):
  - Validação do status HTTP 200 OK, `Content-Type: application/pdf` e headers de download.
- `PartSalePdfExportButton.test.tsx` (Vitest):
  - Teste de clique e transição de estado de loading.

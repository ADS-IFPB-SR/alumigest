# [US-46.1] Engine de Cálculo de Preços e Modelo de Dados para Venda por Medida (Backend)

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-46.1`
- **US Pai**: `US-46: Módulo de Venda Avulsa de Partes (Vidro em m² e Alumínio em Metro Linear)`
- **Release**: Backlog Comercial & Estoque
- **Sub-área**: `Backend`
- **Execução Paralela**: ❌ Não (Fatia base de persistência e cálculo para as fatias de UI, PDF e Estoque)
- **Arquivo / Alvo Principal**: `backend/src/main/resources/db/migration/V46__create_part_sales_schema.sql` e pacote `br.edu.ifpb.alumigest.partsale`
- **Labels Sugeridas**: `backend`, `java`, `spring-boot`, `postgresql`, `flyway`, `pricing`, `solid`, `clean-architecture`

---

## 🎯 Objetivo & Descrição

Disponibilizar a estrutura de dados relacional e a engine de cálculo no backend para precificação precisa de vidros (m²) e perfis de alumínio (metro linear ou barras), considerando metragem mínima faturável, margens de perda e regras de validação dimensional física.

Esta tarefa faz parte da **US-46** do AlumiGest. Deve seguir rigorosamente os princípios **SOLID** (com separação entre cálculo comercial `PartCalculationService` e persistência `PartSaleService`), diretrizes da Constituição do Projeto (Clean Architecture, Records Java 21, DTOs imutáveis, validações com Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Criar a migration Flyway `V46__create_part_sales_schema.sql` contendo as tabelas `tb_part_sales` e `tb_part_sale_items` com constraints e índices adequados.
- [ ] Criar enums em inglês técnico: `PartSaleStatus` (`DRAFT`, `QUOTED`, `APPROVED`, `DELIVERED`, `CANCELLED`) e `PartMaterialType` (`GLASS`, `ALUMINUM_PROFILE`).
- [ ] Criar entidades JPA `PartSale` e `PartSaleItem` com mapeamento de relacionamentos e campos de auditoria (`created_at`, `updated_at`).
- [ ] Criar repositórios Spring Data JPA `PartSaleRepository` e `PartSaleItemRepository`.
- [ ] Implementar o serviço de cálculo `PartCalculationService`:
  - Fórmula de área para vidro com fração mínima faturável:
    $$\text{Área Unitária } (\text{m}^2) = \max\left(\frac{L \times A}{1.000.000}, \text{Área Mínima}\right)$$
  - Fórmula para alumínio em metro linear:
    $$\text{Metragem Total (m)} = \frac{\text{Comprimento (mm)}}{1.000} \times \text{Quantidade}$$
  - Aplicação do fator de perda e arredondamento financeiro com `BigDecimal` (`RoundingMode.HALF_UP`).
- [ ] Criar DTOs em Java Records: `CalculatePartItemRequest`, `CalculatePartItemResponse`, `CreatePartSaleRequest`, `PartSaleResponse`.
- [ ] Implementar endpoints REST no `PartSaleController`:
  - `POST /api/v1/part-sales/calculate-item` (cálculo sem persistência).
  - `POST /api/v1/part-sales` (criação / rascunho de cotação).
  - `GET /api/v1/part-sales/{id}` (detalhes da venda e itens).
  - `PATCH /api/v1/part-sales/{id}/status` (transições de status com snapshot imutável em `APPROVED`).
- [ ] Criar testes unitários em `PartCalculationServiceTest` cobrindo cenários de vidro, alumínio, perda e frações mínimas com cobertura $\ge 85\%$.

---

## ✅ Critérios de Aceitação

1. O endpoint de cálculo deve processar vidro temperado retornando área em m² e valor faturável com respeito à área mínima faturável.
2. O cálculo de perfis de alumínio deve computar metragem líquida e bruta com acréscimo da margem de perda.
3. Dimensões operacionais que excedam limites cadastrais do insumo devem disparar `BusinessException` com HTTP 422.
4. Quando o status da venda mudar para `APPROVED`, os valores e medidas devem ser gravados em snapshot imutável.
5. Nenhuma lógica contábil/cálculo de preço deve depender de processamento no frontend.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 📐 **Padrões de Código**: [../../../projeto-001/PAD-Padroes_de_Codigo.md](../../../projeto-001/PAD-Padroes_de_Codigo.md)

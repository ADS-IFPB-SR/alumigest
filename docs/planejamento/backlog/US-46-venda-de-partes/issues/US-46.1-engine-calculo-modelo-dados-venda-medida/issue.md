# [US-46.1] Engine de Cálculo de Preços e Modelo de Dados para Venda por Medida e Unidade (Backend)

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-46.1`
- **US Pai**: `US-46: Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas)`
- **Release**: Backlog Comercial & Estoque
- **Sub-área**: `Backend`
- **Execução Paralela**: ❌ Não (Fatia base de persistência e cálculo para as fatias de UI, PDF e Estoque)
- **Arquivo / Alvo Principal**: `backend/src/main/resources/db/migration/V46__create_part_sales_schema.sql` e pacote `br.edu.ifpb.alumigest.partsale`
- **Labels Sugeridas**: `backend`, `java`, `spring-boot`, `postgresql`, `flyway`, `pricing`, `solid`, `clean-architecture`

---

## 🎯 Objetivo & Descrição

Disponibilizar a estrutura de dados relacional e a engine de cálculo no backend para precificação precisa de vidros (m²), perfis de alumínio (metro linear), ferragens (preço por unidade) e películas de proteção solar (m²), considerando metragem mínima faturável, margens de perda e regras de validação dimensional física.

Esta tarefa faz parte da **US-46** do AlumiGest. Deve seguir rigorosamente os princípios **SOLID** (com separação entre cálculo comercial `PartCalculationService` e persistência `PartSaleService`), diretrizes da Constituição do Projeto (Clean Architecture, Records Java 21, DTOs imutáveis, validações com Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Criar a migration Flyway `V46__create_part_sales_schema.sql` contendo as tabelas `tb_part_sales` e `tb_part_sale_items`:
  - `material_type`: VARCHAR(30) (`GLASS`, `ALUMINUM_PROFILE`, `HARDWARE`, `FILM`).
  - `width_mm`: INT NULL (obrigatório para vidro e película, nulo para ferragem).
  - `height_mm`: INT NULL (obrigatório para vidro e película, comprimento para alumínio, nulo para ferragem).
  - `calculated_unit_measure`: NUMERIC(10, 4) (área em m² para vidro/película, comprimento em metros para alumínio, ou 1.0000 para ferragem).
- [ ] Criar enums em inglês técnico: `PartSaleStatus` (`DRAFT`, `QUOTED`, `APPROVED`, `DELIVERED`, `CANCELLED`) e `PartMaterialType` (`GLASS`, `ALUMINUM_PROFILE`, `HARDWARE`, `FILM`).
- [ ] Criar entidades JPA `PartSale` e `PartSaleItem` com mapeamento de relacionamentos e campos de auditoria (`created_at`, `updated_at`).
- [ ] Criar repositórios Spring Data JPA `PartSaleRepository` e `PartSaleItemRepository`.
- [ ] Implementar o serviço de cálculo `PartCalculationService`:
  - **Vidro (`GLASS`):** Área com fração mínima faturável:
    $$\text{Área Unitária } (\text{m}^2) = \max\left(\frac{L \times A}{1.000.000}, \text{Área Mínima}\right)$$
  - **Alumínio (`ALUMINUM_PROFILE`):** Metro linear com fator de perda:
    $$\text{Metragem Total (m)} = \frac{\text{Comprimento (mm)}}{1.000} \times \text{Quantidade}$$
  - **Ferragens (`HARDWARE`):** Multiplicação direta por unidade:
    $$\text{Valor Total Item} = \text{Quantidade (un)} \times \text{Preço Base (un)}$$
  - **Películas (`FILM`):** Área em m² com fator de perda da bobina:
    $$\text{Área Unitária } (\text{m}^2) = \frac{L \times A}{1.000.000}$$
    $$\text{Valor Total Item} = \text{Área Unitária } (\text{m}^2) \times \text{Quantidade} \times \text{Preço Base (m}^2) \times (1 + \text{Fator Perda})$$
- [ ] Criar DTOs em Java Records: `CalculatePartItemRequest`, `CalculatePartItemResponse`, `CreatePartSaleRequest`, `PartSaleResponse`.
- [ ] Implementar endpoints REST no `PartSaleController`:
  - `POST /api/v1/part-sales/calculate-item` (cálculo sem persistência com suporte a todos os 4 tipos de insumos).
  - `POST /api/v1/part-sales` (criação / rascunho de cotação).
  - `GET /api/v1/part-sales/{id}` (detalhes da venda e itens).
  - `PATCH /api/v1/part-sales/{id}/status` (transições de status com snapshot imutável em `APPROVED`).
- [ ] Criar testes unitários em `PartCalculationServiceTest` cobrindo cenários de vidro, alumínio, ferragens por unidade e películas em m² com cobertura $\ge 85\%$.

---

## ✅ Critérios de Aceitação

1. O endpoint de cálculo deve suportar e precificar adequadamente os 4 tipos de insumos (`GLASS`, `ALUMINUM_PROFILE`, `HARDWARE`, `FILM`).
2. Para ferragens, o cálculo não deve exigir largura e altura, multiplicando apenas quantidade inteira pelo valor unitário.
3. Para películas, o cálculo deve apurar a área em m² e aplicar o fator de perda configurado.
4. Dimensões operacionais que excedam limites cadastrais do insumo devem disparar `BusinessException` com HTTP 422.
5. Quando o status da venda mudar para `APPROVED`, os valores e medidas devem ser gravados em snapshot imutável.
6. Nenhuma lógica contábil/cálculo de preço deve depender de processamento no frontend.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 📐 **Padrões de Código**: [../../../projeto-001/PAD-Padroes_de_Codigo.md](../../../projeto-001/PAD-Padroes_de_Codigo.md)

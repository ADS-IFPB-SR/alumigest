# Research: Sprint 6 — Pedidos de Venda, Lock de Preços e Comprovante Oficial

**Feature**: `002-pedidos-lock-precos`  
**Período da Sprint 06**: 29/09/2026 a 12/10/2026  
**Status**: APPROVED  

## R1: Estratégia de Lock de Preços e Imutabilidade Cadastral

### Decisão: Clonagem Profunda (*Deep Copy*) em Tabela Própria `order_items`
**Rationale**:
- A tabela `order_items` replica fisicamente todos os valores monetários unitários e totais, além de medidas nominais (L x A mm), cores, ferragens e especificações de vidro vigentes no momento da conversão.
- Reajustes futuros no catálogo de insumos ou nos templates paramétricos não afetam pedidos convertidos, garantindo segurança jurídica ao contrato com o cliente.
- A clonagem profunda dentro de `@Transactional` atômica assegura que todo o pedido é gravado com sucesso ou a operação é revertida por completo.

## R2: Geração Sequencial de Código Anual (`PED-YYYY-NNNN`)

### Decisão: Sequencial Anual Formatado
**Rationale**:
- Padrão oficial: `PED-2026-0001`, `PED-2026-0002`, etc.
- Reinicia anualmente baseado na data de aprovação do pedido.
- Consulta atômica no banco de dados com lock ou query sequencial por ano para evitar duplicidade em concorrência.

## R3: Comprovante do Pedido em PDF com OpenPDF

### Decisão: Template A4 Institucional
**Rationale**:
- Reutiliza a dependência OpenPDF consolidada nas Sprints 4 e 5.
- Layout padronizado com identidade visual da Alumiportas, numeração de páginas "Página X de Y", dados do cliente e discriminação dos itens contratados com valores congelados.
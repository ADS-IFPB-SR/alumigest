# Research: Sprint 07 — Gestão Fabril: Etiquetas de Identificação de Peças & Painel Kanban de Produção

**Feature**: `003-etiquetas-kanban-producao`  
**Período da Sprint 07**: 13/10/2026 a 27/10/2026  
**Status**: APPROVED  

---

## R1: Padrão Dimensional e Paginação de Etiquetas Térmicas (OpenPDF)

### Decisão: PageSize customizado em OpenPDF com `new Rectangle(283.46f, 141.73f)`
**Rationale**:
- Impressoras de etiquetas térmicas industriais comuns no mercado brasileiro (Zebra ZD220, Elgin L42 Pro, Argox OS-214 Plus) utilizam rolos padrão de etiquetas adesivas de **100 mm de largura por 50 mm de altura**.
- No OpenPDF, a unidade de medida padrão é o ponto tipográfico ($72 \text{ DPI}$):
  - $100 \text{ mm} = \frac{100}{25.4} \times 72 \approx 283.46 \text{ pt}$.
  - $50 \text{ mm} = \frac{50}{25.4} \times 72 \approx 141.73 \text{ pt}$.
- Cada exemplar físico de peça gera exatamente uma página no documento PDF. Se um pedido tiver 2 itens com quantidades 2 e 3, o documento terá $2 + 3 = 5$ páginas individuais.
- Ao mandar imprimir pelo leitor PDF ou navegador, o operador seleciona a impressora térmica e as etiquetas saem continuamente sem quebra de página indevida ou corte de margens.

---

## R2: Arquitetura de Transição do Kanban vs Sobrecarga de Modelo

### Decisão: Utilização direta de `tb_orders(status)` com preenchimento de `data_conclusao`
**Rationale**:
- A entidade `Order` criada na Sprint 06 já possui o enum `OrderStatus` com os valores `CRIADO`, `AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO` e `CANCELADO`, além da coluna `data_conclusao`.
- Evita complexidade desnecessária (*overengineering*) de tabelas auxiliares de histórico nesta etapa, garantindo performance ótima, queries diretas com indexação em `status` e simplicidade no frontend.
- O endpoint dedicado `PATCH /api/orders/{id}/production-status` encapsula as regras de validação fabril, mantendo o controle centralizado no `OrderService`.

---

## R3: Interação e Usabilidade no Chão de Fábrica (Mobile/Desktop)

### Decisão: Ações por Botões de Avanço de Estágio + Cálculo de Urgência de Prazo no Frontend
**Rationale**:
- Em ambientes de chão de fábrica, operadores frequentemente utilizam tablets industriais ou telas touchscreen com luvas. Ações baseadas em botões grandes e visuais ("Iniciar Produção ➔", "Concluir Produção ✔") são muito mais estáveis e imunes a erros de arraste do que drag-and-drop puro em dispositivos táteis.
- O cálculo do indicador de prazo (SLA) categoriza os pedidos em 3 faixas visuais intuitivas:
  - **Verde**: Entrega prevista com mais de 3 dias de margem;
  - **Amarelo**: Entrega prevista entre 0 e 3 dias (prazo crítico);
  - **Vermelho**: Pedido com prazo de entrega vencido (atraso fabril).

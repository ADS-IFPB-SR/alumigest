# [US-46.5] Adicionar Listagem de Tipo do Material

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-46.5`
- **US Pai**: `US-46: Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas)`
- **Release**: Sprint 08
- **Fase**: `Desenvolvimento Comercial / Integração de Catálogo`
- **User Story**: Como vendedor, desejo pesquisar e selecionar dinamicamente materiais específicos do catálogo para que o sistema carregue seus preços e UUIDs automaticamente no formulário de venda.
- **Sub-área**: `Backend & Frontend`
- **Execução Paralela**: ✅ Sim
- **Arquivo / Alvo Principal**: `MaterialAutocomplete.tsx`, `PartSaleForm.tsx`, Endpoint `GET /api/v1/materials`
- **Labels Sugeridas**: `feature`, `frontend`, `backend`, `catalog`

---

## 🎯 Objetivo & Descrição

Implementar a listagem dinâmica e seleção de materiais específicos cadastrados no banco de dados para o formulário de Venda Avulsa. A tarefa substitui a seleção genérica por um *autocomplete* inteligente que vincula a variação do material (ex: "Vidro Temperado 8mm - Fumê") e seu respectivo UUID e preço base à requisição de cálculo.

### Contexto da Fase / Épico
O motor de cálculo (`PartCalculatorFactory`) exige um `materialId` válido para buscar o custo base da matéria-prima. Esta issue conecta a interface de venda ao módulo de Catálogo de Materiais já existente.

---

## 🛠️ Checklist de Implementação

- [ ] **Endpoint de Listagem por Categoria (Backend)**:
    - [ ] Implementar/Garantir rota `GET /api/v1/materials?category={categoryType}`.
    - [ ] Retornar atributos essenciais (`id`, `name`, `category`, `unitPrice`, `unitOfMeasure`, variações).
- [ ] **Componentes Especialistas (Frontend)**:
    - [ ] Criar `MaterialAutocomplete.tsx` / `MaterialSelectModal.tsx` com filtro por texto.
    - [ ] Exibir preço unitário do banco no seletor.
    - [ ] Integrar em `GlassItemFields.tsx`, `FilmItemFields.tsx`, etc.
- [ ] **Integração de Fluxo e Validação**:
    - [ ] Atualizar estado global de `PartSaleForm.tsx` para armazenar o `materialId` (UUID).
    - [ ] Atualizar `usePartCalculation.ts` para injetar o UUID no payload.
    - [ ] Limpar a seleção atual quando a categoria principal for trocada.
- [ ] **Testes Automatizados**:
    - [ ] Testes unitários do frontend (`MaterialAutocomplete.tsx`) e backend (endpoint de filtro).

---

## ✅ Critérios de Aceitação

1. Ao selecionar a categoria (Vidro, Película, Alumínio ou Ferragem), a interface exibe dinamicamente o campo de seleção contendo apenas os materiais cadastrados no banco pertencentes àquela categoria.
2. Cada item da lista de seleção exibe nome do material, variação (ex: cor/espessura) e o preço unitário cadastrado no banco.
3. A seleção de um material vincula obrigatoriamente seu UUID ao payload de cálculo e submissão da venda.
4. Tentar submeter um item para cálculo sem selecionar um material (UUID ausente) deve emitir alerta visual de campo obrigatório e bloquear a requisição.
5. A alteração da categoria principal no formulário deve limpar a seleção anterior e recarregar os materiais correspondentes à nova categoria.

---

## 🔗 Referências & Documentos Relacionados

- 🎨 **Protótipo Canônico**: `.prototipos/telas/prot_tipo_vendas_vidra_aria.html`
- 📑 **Especificação Pai**: [#477](https://github.com/ADS-IFPB-SR/alumigest/issues/477)
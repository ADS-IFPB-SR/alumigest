# Especificação Funcional: US-46 — Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas)

**Identificador**: `US-46`  
**Issue GitHub**: [#477](https://github.com/ADS-IFPB-SR/alumigest/issues/477)  
**Status**: 🟢 Em Fechamento (6/7 issues concluídas)

---

## 🎯 Objetivo de Negócio
Como consultor comercial e encarregado de almoxarifado da Alumiportas, desejo que o sistema AlumiGest permita orçar e vender insumos e partes individualizadas — chapas e peças de vidro sob medida por m², perfis de alumínio por metro linear ou barra cortada, ferragens avulsas por unidade (roldanas, puxadores, fechaduras, braços de articulação) e películas de controle solar/segurança sob medida por m² —, especificando acabamento, medidas nominais (L×A mm) e quantidade, com cálculo automático de preços e faturamento, sem a obrigatoriedade de compor uma esquadria completa.

---

## 📋 Sub-Tarefas / Issues Vinculadas (7 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-46.1](issues/US-46.1-venda-avulsa-ferragens-unidade/README.md) | Venda Avulsa de Ferragens por Unidade (#527) | 🟢 Closed |
| [US-46.2](issues/US-46.2-venda-perfis-aluminio-metro/README.md) | Venda de Perfis de Alumínio em Metro Linear (#528) | 🟢 Closed |
| [US-46.3](issues/US-46.3-venda-vidros-peliculas-m2/README.md) | Venda de Vidros e Películas em m² com Área Mínima (#529) | 🟢 Closed |
| [US-46.4](issues/US-46.4-geracao-exportacao-orcamento-pdf/README.md) | Geração e Exportação do Orçamento em PDF A4 (#530) | 🟢 Closed |
| [US-46.5](issues/US-46.5-adicionar-listagem-tipo-material/README.md) | Adicionar Listagem de Tipo do Material (#551) | 🟢 Closed |
| [US-46.6](issues/US-46.6-suite-testes-e2e-venda-avulsa/README.md) | Suíte de Testes E2E (Cypress), Integração e Matriz de Casos (#555) | 🟡 Open |
| [US-47.3](issues/US-47.3-emissao-ficha-tecnica-a4-producao/README.md) | Emissão da Ficha Técnica A4 de Produção com Lista de Corte (#533) | 🟢 Closed |

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- **Cenário 1: Venda Avulsa de Ferragens por Unidade Inteira (US-46.1)**
    - **Dado que** o vendedor está na tela de nova cotação de partes e seleciona uma ferragem do catálogo (ex.: "Roldana Dupla 112"),
    - **Quando** informa a quantidade de peças desejadas (ex.: 10 un),
    - **Então** os campos dimensionais de largura e altura são desabilitados com indicação clara de cobrança por unidade,
    - **E** o valor total do item é apurado instantaneamente multiplicando quantidade pelo preço unitário cadastrado.

- **Cenário 2: Venda de Perfis de Alumínio em Metro Linear com Fator de Perda (US-46.2)**
    - **Dado que** o vendedor seleciona um perfil de alumínio vendido por metro linear (ex.: "Perfil U Linha Suprema"),
    - **Quando** informa o comprimento em milímetros (ex.: 2500 mm) e a quantidade de barras cortadas (ex.: 4 barras),
    - **Então** a interface exibe a etiqueta indicativa de metro linear e oculta a largura,
    - **E** o sistema converte o comprimento para metros lineares, aplica a taxa de perda de corte homologada e calcula o subtotal em tempo real.

- **Cenário 3: Venda de Vidros em m² com Aplicação de Área Mínima Faturável (US-46.3)**
    - **Dado que** o vendedor seleciona uma chapa de vidro sob medida e informa dimensões que resultam em área física menor que o piso mínimo da oficina (ex.: peça de $300 \times 400\text{ mm} = 0,12\text{ m}^2$),
    - **Quando** o cálculo do item é processado,
    - **Então** o sistema aplica automaticamente a fração mínima faturável da indústria vidreira ($0,25\text{ m}^2$) para proteger a margem da oficina,
    - **E** para peças com área superior ao piso, fatura a área real proporcional em metros quadrados.

- **Cenário 4: Venda de Películas em m² com Perda de Bobina (US-46.3)**
    - **Dado que** o vendedor seleciona uma película de controle solar/segurança por metro quadrado,
    - **Quando** informa largura, altura em milímetros e quantidade de peças,
    - **Então** o sistema apura a metragem quadrada total aplicando o fator de perda configurado sobre o insumo,
    - **E** valida se a largura informada é compatível com a largura máxima da bobina cadastrada no catálogo.

- **Cenário 5: Emissão e Download do Orçamento em PDF A4 (US-46.4)**
    - **Dado que** a proposta de partes possui itens cadastrados,
    - **Quando** o usuário clica no botão "Exportar PDF",
    - **Então** o sistema gera em menos de 1,5 segundo um documento A4 padronizado com cabeçalho da Alumiportas, numeração oficial da cotação e dados do cliente,
    - **E** os itens são agrupados automaticamente em seções temáticas (Vidros, Alumínios, Ferragens e Películas), ocultando blocos de categorias não contratadas.

- **Cenário 6: Validações e Prevenção de Inconsistências Operacionais**
    - **Dado que** o operador tenta salvar uma cotação com quantidades zeradas, medidas zeradas ou dimensões que excedam os limites físicos da matéria-prima,
    - **Quando** os dados são submetidos,
    - **Então** a interface emite alertas visuais claros nos campos correspondentes e impede o avanço ou aprovação da venda.

---

## 📋 Regras de Negócio e Restrições
- **RN-01 (Venda Desacoplada de Estoque)**: A venda opera comercialmente consultando os insumos cadastrados no catálogo de materiais (`tb_materials`). O sistema não bloqueia o orçamento ou a venda comercial por falta de estoque enquanto o módulo de estoque físico não estiver implantado.
- **RN-02 (Piso Mínimo de Vidro)**: Peças de vidro com área física inferior a $0,25\text{ m}^2$ são tarifadas pela fração mínima de $0,25\text{ m}^2$ para cobrir custos de corte, forno e lapidação.
- **RN-03 (Imutabilidade de Valores)**: Ao aprovar a cotação, os preços unitários e dimensões ficam congelados nos itens da proposta, blindando o cliente contra reajustes posteriores de tabela.
- **RN-04 (Segregação de Responsabilidades)**: Toda a apuração matemática de áreas, metros lineares, perdas e frações mínimas é centralizada no backend via *Strategy Pattern*, atuando o frontend exclusivamente na coleta e exibição reativa.

---

## 🔗 Referências & Governança
- 📑 **Especificação Técnica Integrada da Sprint 08**: `docs/planejamento/sprint-08/spec.md`
- 📝 **Ata de Planejamento da Sprint 08**: `docs/projeto-001/001-atas-reuniao/ATA-Sprint_08_Planning.md`
- 🏛️ **Constituição e Padrões Arquiteturais**: `docs/planejamento/constitution.md`
- 🔀 **Branch de Feature**: `feat/us-46-venda-de-partes`
# Especificação Funcional: US-47 — Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas

**Identificador**: `US-47`  
**Issue GitHub**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)  
**Status**: 🟢 Concluído (5/5 issues)

---

## 🎯 Objetivo de Negócio
Como vendedor, operador comercial ou encarregado de produção da Alumiportas, desejo uma interface integrada "Central 360° do Cliente" em layout mestre-detalhe limpo e contínuo, onde ao selecionar um cliente eu visualize instantaneamente todos os seus orçamentos vinculados, todas as suas Ordens de Serviço (O.S.) e os itens físicos/esquadrias da O.S. ativa com suas medidas nominais em milímetros (L×A mm), podendo acionar diretamente dali a impressão de etiquetas térmicas (100x60mm Elgin L42), a emissão da Ficha Técnica de Produção (A4), o download de comprovantes PDF e a abertura do fluxo de produção no Kanban, eliminando a fragmentação entre módulos e acelerando o atendimento e a expedição.

---

## 📋 Sub-Tarefas / Issues Vinculadas (6 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-47.1](issues/US-47.1-hub-base-kpis-gestao-orcamentos/issue.md) | Hub 360° Base, KPIs e Gestão de Orçamentos (#531) | 🟢 Closed |
| [US-47.2](issues/US-47.2-gestao-ordens-servico-esquadrias/issue.md) | Gestão de Ordens de Serviço (O.S.) e Detalhamento de Esquadrias (#532) | 🟢 Closed |
| [US-47.3](issues/US-47.3-emissao-ficha-tecnica-a4/issue.md) | Emissão da Ficha Técnica A4 de Produção com Lista de Corte (#533) | 🟢 Closed |
| [US-47.4](issues/US-47.4-impressao-etiquetas-termicas-hub/issue.md) | Impressão de Etiquetas Térmicas (100x60mm) da O.S. no Hub (#534) | 🟢 Closed |
| [US-47.5](issues/US-47.5-suite-testes-e2e-central-360/issue.md) | Suíte de Testes E2E (Cypress), Integração e Matriz de Casos da Central 360° (#556) | 🟢 Closed |
| [US-47.6](issues/US-47.6-edicao-dados-cadastrais/issue.md) | Edição de Dados Cadastrais do Cliente no Hub 360° (#558) | 🟢 Closed |
---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- **Cenário 1: Seleção de Cliente e Carregamento Automático do Hub 360° (US-47.1)**
    - **Dado que** o operador visualiza a lista lateral de clientes com busca dinâmica,
    - **Quando** clica sobre um cliente específico,
    - **Então** o cliente recebe destaque ativo imediato e o painel de trabalho exibe dados de contato e os 3 indicadores de faturamento (Total Contratado, Quantidade de O.S. e Orçamentos).

- **Cenário 2: Visualização de Orçamentos Comerciais e Ações Rápidas (US-47.1)**
    - **Dado que** o cliente está selecionado e a aba "Orçamentos" está ativa,
    - **Quando** a listagem de propostas for exibida,
    - **Então** apresenta código, data, validade, valor e status, disponibilizando botões rápidos para PDF e reenvio por WhatsApp.

- **Cenário 3: Listagem de Ordens de Serviço Sem Compressão Visual (US-47.2)**
    - **Dado que** o cliente possui Ordens de Serviço registradas,
    - **Quando** o operador acessa a aba "Ordens de Serviço (O.S.)",
    - **Então** a tabela mantém visibilidade integral de todas as colunas sem cortes de texto ou compressão em diferentes resoluções.

- **Cenário 4: Inspeção Detalhada de Esquadrias e Medidas Nominais (US-47.2)**
    - **Dado que** o operador clica sobre uma linha de O.S. na tabela,
    - **Quando** o cartão de esquadrias for carregado,
    - **Então** exibe cada peça física da ordem com título, acabamento, vidro e etiqueta com medidas nominais em milímetros (ex.: 📐 350 x 1470 mm), exibindo botões contextuais para Ficha Técnica e Etiquetas.

- **Cenário 5: Emissão da Ficha Técnica A4 com Lista de Corte e Folgas (US-47.3)**
    - **Dado que** o operador clica na ação "📋 Ficha Técnica" de uma O.S.,
    - **Quando** o modal interativo for aberto,
    - **Então** exibe a pré-visualização da folha técnica A4 com a lista paramétrica de corte de perfis, deduções de folgas e lista de acessórios, permitindo envio para impressora ou download.

- **Cenário 6: Impressão de Etiquetas Térmicas (100x60mm) da O.S. no Hub (US-47.4)**
    - **Dado que** o operador clica na ação "🏷️ Etiquetas" de uma O.S.,
    - **Quando** a janela de impressão térmica for exibida,
    - **Então** renderiza a pré-visualização das etiquetas no formato 100x60mm permitindo filtro por peça e disparo de impressão completa (Elgin L42).

- **Cenário 7: Disparo de Novo Orçamento com Cliente Pré-selecionado (US-47.1)**
    - **Dado que** o cliente está selecionado na tela 360°,
    - **Quando** o operador clica no botão "➕ Novo Orçamento",
    - **Então** o sistema navega para o formulário de orçamentos com o cliente pré-preenchido e travado para edição.

---

## 📋 Regras de Negócio e Restrições
- **RN-01 (Segregação Estrita de Responsabilidades - SRP/SOLID)**: O frontend atua exclusivamente como camada de renderização. Nenhuma regra de negócio de plano de corte ou dedução de folgas reside no frontend. O backend é a única fonte da verdade (CQRS).
- **RN-02 (Projeções Otimizadas de Leitura - CQRS)**: O backend disponibiliza projeções DTO leves (`ClientDashboardDto`, `OrderResponseDto`, `ClientBudgetSummaryDto`), evitando carregar grafos pesados de entidades JPA.
- **RN-03 (Imutabilidade da Ficha Técnica)**: A Ficha Técnica reflete os parâmetros congelados do pedido na sua aprovação.
- **RN-04 (Design System AlumiGest)**: Tipografia canônica (Hanken Grotesk, Inter, JetBrains Mono), paleta azul profundo (`#041632`) com azul vibrante (`#2563eb`), espaçamentos modulares e cards sem poluição visual.

---

## 🔗 Referências & Governança
- 🖥️ **Protótipo Interativo**: `docs/planejamento/prototipos/painel-clientes-360.html`
- 🏷️ **Protótipo de Impressão Térmica (US-17)**: `docs/planejamento/prototipos/prototipo_etiquetas.html`
- 📑 **Especificação Técnica Sprint 08**: `docs/planejamento/sprint-08/spec.md`
- 📝 **Ata de Planejamento**: `docs/projeto-001/001-atas-reuniao/ATA-Sprint_08_Planning.md`
- 🏛️ **Constituição**: `docs/planejamento/constitution.md`
- 🔀 **Branch de Feature**: `feat/us-47-painel-360-clientes`
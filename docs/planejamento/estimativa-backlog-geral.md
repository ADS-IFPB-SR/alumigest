# 📊 Matriz Mestre de Estimativas do Product Backlog (US-01 a US-45)

Este documento consolida a **estimativa completa do Product Backlog** do projeto **AlumiGest**, abrangendo todas as **45 User Stories ativas** distribuídas pelas **16 Sprints (Releases 1, 2, 3 e Sustentação)**.

> 🎯 **Objetivo**: Atender à exigência formal do acompanhamento ágil da disciplina e do projeto, servindo como base técnica para a dinâmica de **Planning Poker** da equipe.
> 
> 📝 **Instrução de Uso**: A coluna **"Sugerida (pts)"** apresenta a recomendação técnica prévia baseada no escopo, complexidade e arquitetura de cada módulo. A coluna **"Estimativa da Equipe (pts)"** está em branco para preenchimento com o consenso final do time durante a reunião de Planning.

---

## 📐 1. Critérios de Calibração (Escala Fibonacci: 1, 2, 3, 5, 8, 13)

A atribuição de Story Points considera **Complexidade do Domínio**, **Incerteza Técnica** e **Esforço de Implementação (Backend + Frontend + QA)**:

| Pontos | Nível de Complexidade | Descrição do Escopo e Características | Exemplos de Referência |
| :---: | :--- | :--- | :--- |
| **1 pt** | **Trivial** | Tarefa pontual de infraestrutura, setup de biblioteca, script isolado ou monitoramento sem lógica de negócio. | — |
| **2 pts** | **Muito Baixa** | Funcionalidade simples com baixo acoplamento, visualização de histórico ou tela informativa com poucas validações. | `US-45` (Actuator e Healthcheck) |
| **3 pts** | **Baixa** | CRUD padrão com validação Jakarta/Bean Validation, 1 ou 2 telas reativas e endpoints REST diretos. | `US-01` (Setup), `US-04` (Clientes), `US-26` (Modal PIX), `US-29` (Extrato), `US-33` (PDF OS), `US-36` (Export CSV), `US-42` (Manuais) |
| **5 pts** | **Média** | Módulo com múltiplas entidades relacionadas, regras de negócio financeiras/fiscais, filtros complexos ou wizards em etapas. | `US-02` (Materiais), `US-03` (Fichas), `US-08` (CI/CD), `US-09` (Descontos), `US-11` (PDF Oficina), `US-13` (Conversão Pedido), `US-15` (Status), `US-16` (Comprovante), `US-17` (Etiquetas), `US-18` (Kanban), `US-20` (Ficha Montagem), `US-22` (Kardex), `US-27` (Parcelamento), `US-28` (Contas a Receber), `US-30` (Fluxo Mensal), `US-32` (Calendário), `US-39` (Compressão), `US-40` (Carga CSV), `US-43` (Backup), `US-44` (Auditoria) |
| **8 pts** | **Alta** | Módulos com alta complexidade algorítmica, renderização gráfica paramétrica (SVG), fórmulas matemáticas, relatórios PDF milimétricos, lock imutável ou modo offline com sincronização. | `US-05` (Templates Paramétricos), `US-07` (Motor de Cálculo), `US-06` (Orçamentos), `US-10` (PDF Orçamento), `US-14` (Lock de Preços), `US-19` (Lista de Corte), `US-21` (Reserva/Baixa Estoque), `US-24` (Cobrança PIX), `US-25` (Webhook PIX), `US-31` (OS em Campo PWA), `US-34` (Dashboard), `US-35` (DRE), `US-37` (PWA Offline), `US-38` (Fila Offline) |
| **13 pts** | **Muito Alta / Épica** | Histórias com múltiplos pontos de integração ponta a ponta, dependências externas críticas ou homologação geral de release cobrindo regressão de múltiplos módulos. | `US-12` (Homologação R1), `US-23` (Homologação R2), `US-41` (Homologação R3) |

---

## 🗺️ 2. Tabela Geral de Estimativas: 45 User Stories Ativas

### 🚀 Release 1 (v1.0.0) — Catálogo, Motor de Orçamentos e Homologação Inicial

| ID | Issue GitHub | User Story (Título Funcional) | Sprint | Complexidade / Justificativa Arquitetural | Sugerida (pts) | Estimativa da Equipe (pts) |
| :---: | :---: | :--- | :---: | :--- | :---: | :---: |
| **US-01** | [#122](https://github.com/ADS-IFPB-SR/alumigest/issues/122) | Configurar Infraestrutura Monorepo, Docker e Governança do Projeto | `Sprint 01` | Setup do monorepo, Docker Compose (Postgres 16 + pgAdmin), CI baseline e convenções. | **3** | |
| **US-02** | [#123](https://github.com/ADS-IFPB-SR/alumigest/issues/123) | Gerenciar Catálogo de Materiais Genérico (Vidros, Perfis, Ferragens) | `Sprint 02` | CRUD genérico em abas, regras de precificação por m², kg, barras e unidades, soft-delete. | **5** | |
| **US-03** | [#124](https://github.com/ADS-IFPB-SR/alumigest/issues/124) | Gerenciar Produtos e Fichas Técnicas de Esquadrias | `Sprint 02` | Associação dinâmica de insumos para composição de ficha técnica de esquadrias padrão. | **5** | |
| **US-04** | [#125](https://github.com/ADS-IFPB-SR/alumigest/issues/125) | Gerenciar Clientes PF e PJ | `Sprint 03` | CRUD de clientes com validação de CPF/CNPJ, máscara reativa e busca instantânea. | **3** | |
| **US-05** | [#126](https://github.com/ADS-IFPB-SR/alumigest/issues/126) | Refatorar Produtos com Templates Paramétricos de Esquadrias | `Sprint 03` | Configuração JSONB no PostgreSQL, renderização paramétrica SVG (Porta, Janela, Maxim-ar). | **8** | |
| **US-06** | [#127](https://github.com/ADS-IFPB-SR/alumigest/issues/127) | Criar e Gerenciar Orçamentos de Venda | `Sprint 03` | Máquina de estados (Rascunho ➔ Enviado ➔ Aprovado ➔ Cancelado) e Wizard em etapas. | **8** | |
| **US-07** | [#128](https://github.com/ADS-IFPB-SR/alumigest/issues/128) | Motor de Cálculo Físico e Precificação de Orçamentos | `Sprint 03` | Fórmulas físicas e matemáticas paramétricas (vidros m², perfis 4W+6H, sobras e rateio). | **8** | |
| **US-08** | [#129](https://github.com/ADS-IFPB-SR/alumigest/issues/129) | Pipeline CI/CD com SonarQube e Testes E2E Cypress | `Sprint 03` | Quality Gate automatizado no GitHub Actions, relatórios de cobertura e suíte E2E. | **5** | |
| **US-09** | [#133](https://github.com/ADS-IFPB-SR/alumigest/issues/133) | Aplicar Descontos e Condições Comerciais no Orçamento | `Sprint 04` | Descontos em % e R$, taxas de frete/instalação, prazos de validade e recálculo em memória. | **5** | |
| **US-10** | [#134](https://github.com/ADS-IFPB-SR/alumigest/issues/134) | Emitir e Exportar Orçamento em PDF - Via Comercial e WhatsApp | `Sprint 04` | Geração de PDF oficial OpenPDF, layout comercial institucional e cópia WhatsApp. | **8** | |
| **US-11** | [#135](https://github.com/ADS-IFPB-SR/alumigest/issues/135) | Emitir Orçamento em PDF - Via Técnica de Oficina | `Sprint 04` | Layout técnico para serralheria com cotas, sentidos de abertura e supressão de valores. | **5** | |
| **US-12** | [#136](https://github.com/ADS-IFPB-SR/alumigest/issues/136) | Homologação Integrada e Validação da Release 1 (v1.0.0) | `Sprint 04` | Testes integrados ponta a ponta (Insumo ➔ Produto ➔ Orçamento ➔ PDF), carga de homologação. | **13** | |

---

### 🏭 Release 2 (v2.0.0) — Pedidos, Produção, Corte e Estoque

| ID | Issue GitHub | User Story (Título Funcional) | Sprint | Complexidade / Justificativa Arquitetural | Sugerida (pts) | Estimativa da Equipe (pts) |
| :---: | :---: | :--- | :---: | :--- | :---: | :---: |
| **US-13** | [#137](https://github.com/ADS-IFPB-SR/alumigest/issues/137) | Aprovar Orçamento e Converter em Pedido de Venda | `Sprint 05` | Formalização de canal, geração de código sequencial (PED-YYYYMMDD-NNNN) e transição de estado. | **5** | |
| **US-14** | [#138](https://github.com/ADS-IFPB-SR/alumigest/issues/138) | Snapshot Imutável e Lock de Preços do Pedido | `Sprint 05` | Cópia profunda JSONB/entidade imutável dos custos unitários e totais do momento da venda. | **8** | |
| **US-15** | [#139](https://github.com/ADS-IFPB-SR/alumigest/issues/139) | Gestão de Status, Prazos e Cancelamento de Pedidos | `Sprint 05` | Ciclo de vida do pedido (Criado ➔ Produção ➔ Concluído), prazos de entrega e cancelamento. | **5** | |
| **US-16** | [#140](https://github.com/ADS-IFPB-SR/alumigest/issues/140) | Emissão do Comprovante do Pedido de Venda | `Sprint 05` | Documento contratual em PDF com itens contratados, datas acordadas e assinatura do cliente. | **5** | |
| **US-17** | [#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142) | Emitir Etiquetas de Identificação de Peças por Item do Pedido | `Sprint 06` | Geração de etiquetas adesivas técnicas por item com medidas, acabamento e sentido de abertura. | **5** | |
| **US-18** | [#143](https://github.com/ADS-IFPB-SR/alumigest/issues/143) | Acompanhar Produção via Painel Kanban de Pedidos de Venda | `Sprint 06` | Quadro visual de chão de fábrica com cartões de pedidos e itens por estágio de produção. | **5** | |
| **US-19** | [#144](https://github.com/ADS-IFPB-SR/alumigest/issues/144) | Consolidar Lista Linear e Plana de Corte do Pedido | `Sprint 07` | Agrupamento de perfis de alumínio e vidros com medidas nominais para os serralheiros. | **8** | |
| **US-20** | [#145](https://github.com/ADS-IFPB-SR/alumigest/issues/145) | Gerar Ficha Técnica de Montagem por Item do Pedido | `Sprint 07` | Roteiro passo a passo com orientações, ferragens e componentes necessários por peça. | **5** | |
| **US-21** | [#146](https://github.com/ADS-IFPB-SR/alumigest/issues/146) | Reservar e Baixar Matéria-Prima no Estoque Automaticamente | `Sprint 08` | Reserva automática na confirmação e baixa real definitiva no início da produção dos itens. | **8** | |
| **US-22** | [#147](https://github.com/ADS-IFPB-SR/alumigest/issues/147) | Consultar Posição de Estoque e Kardex de Movimentações | `Sprint 08` | Histórico cronológico auditável de movimentações, saldo físico/reservado/disponível e alertas. | **5** | |
| **US-23** | [#148](https://github.com/ADS-IFPB-SR/alumigest/issues/148) | Homologação Integrada e Validação da Release 2 (v2.0.0) | `Sprint 08` | Validação integrada do ciclo produtivo completo (Orçamento ➔ Pedido ➔ Chão de Fábrica ➔ Estoque). | **13** | |

---

### 💳 Release 3 (v3.0.0) — Financeiro (PIX/Caixa), Campo PWA Offline e Gestão

| ID | Issue GitHub | User Story (Título Funcional) | Sprint | Complexidade / Justificativa Arquitetural | Sugerida (pts) | Estimativa da Equipe (pts) |
| :---: | :---: | :--- | :---: | :--- | :---: | :---: |
| **US-24** | [#149](https://github.com/ADS-IFPB-SR/alumigest/issues/149) | Gerar Cobrança PIX com QR Code Dinâmico e Copia e Cola | `Sprint 09` | Integração com gateway PIX, geração de payload EMVCo dinâmico com valor e expiração. | **8** | |
| **US-25** | [#150](https://github.com/ADS-IFPB-SR/alumigest/issues/150) | Confirmar Pagamento PIX via Webhook com Liberação Automática | `Sprint 09` | Endpoint seguro de webhook com validação HMAC/assinatura, idempotência e baixa em tempo real. | **8** | |
| **US-26** | [#151](https://github.com/ADS-IFPB-SR/alumigest/issues/151) | Modal PIX Interativo no Frontend e Histórico de Transações | `Sprint 09` | Modal com polling/SSE para feedback instantâneo de "PIX Pago" e tela de conciliação. | **3** | |
| **US-27** | [#152](https://github.com/ADS-IFPB-SR/alumigest/issues/152) | Desdobrar e Gerenciar Parcelamento de Pedidos | `Sprint 10` | Divisão em parcelas (entrada + N parcelas), títulos a receber e cronograma de vencimentos. | **5** | |
| **US-28** | [#153](https://github.com/ADS-IFPB-SR/alumigest/issues/153) | Controlar Contas a Receber, Vencimentos e Inadimplência | `Sprint 10` | Painel financeiro de títulos em aberto, controle de atrasos e status de quitação. | **5** | |
| **US-29** | [#154](https://github.com/ADS-IFPB-SR/alumigest/issues/154) | Emitir Extrato Financeiro do Cliente e Recibo de Quitação | `Sprint 10` | Emissão de recibos de quitação e extrato financeiro detalhado em PDF. | **3** | |
| **US-30** | [#155](https://github.com/ADS-IFPB-SR/alumigest/issues/155) | Acompanhar Fluxo de Caixa Mensal | `Sprint 11` | Visão mensal consolidada de receitas realizadas, saídas e comparativo do exercício anual. | **5** | |
| **US-31** | [#156](https://github.com/ADS-IFPB-SR/alumigest/issues/156) | Executar e Concluir OS em Campo com Registro Fotográfico (PWA) | `Sprint 12` | Schema de OS, checklist de entrega via PWA, upload de fotos de evidência e aceite da obra. | **8** | |
| **US-32** | [#157](https://github.com/ADS-IFPB-SR/alumigest/issues/157) | Visualizar Calendário de Instalações e Prevenção de Conflitos | `Sprint 12` | Calendário visual interativo com alocação de equipes por turno e prevenção de sobreposição. | **5** | |
| **US-33** | [#158](https://github.com/ADS-IFPB-SR/alumigest/issues/158) | Emitir Ordem de Serviço (OS) em PDF | `Sprint 12` | Layout A4 OpenPDF da OS com via técnica, dados de rota e termo de garantia do cliente. | **3** | |
| **US-34** | [#159](https://github.com/ADS-IFPB-SR/alumigest/issues/159) | Visualizar Dashboard Executivo e Indicadores (KPIs) Comerciais | `Sprint 13` | Gráficos analíticos: Ticket Médio, Taxa de Conversão de Orçamentos, Faturamento Mensal. | **8** | |
| **US-35** | [#160](https://github.com/ADS-IFPB-SR/alumigest/issues/160) | Apurar DRE Gerencial (Competência e Caixa) | `Sprint 13` | Demonstrativo de Resultado com Receita Bruta, Custos de Materiais (CMV), Margem e Lucro Líquido. | **8** | |
| **US-36** | [#161](https://github.com/ADS-IFPB-SR/alumigest/issues/161) | Exportar Relatórios Executivos em PDF e Planilhas CSV/Excel | `Sprint 13` | Exportação em lote de dados operacionais e financeiros em PDF e planilhas estruturadas. | **3** | |
| **US-37** | [#162](https://github.com/ADS-IFPB-SR/alumigest/issues/162) | Instalar PWA e Consultar Pedidos e OS Offline via IndexedDB | `Sprint 14` | Service Workers, cache de assets e armazenamento local no IndexedDB via Dexie.js. | **8** | |
| **US-38** | [#163](https://github.com/ADS-IFPB-SR/alumigest/issues/163) | Sincronizar Fila de Alterações e Fotos em Segundo Plano | `Sprint 14` | Background Sync e fila offline resiliente para envio automático de fotos e status reconectados. | **8** | |
| **US-39** | [#164](https://github.com/ADS-IFPB-SR/alumigest/issues/164) | Comprimir Imagens no Dispositivo e Otimizar Performance Web | `Sprint 14` | Compressão de imagens antes do envio no PWA, lazy loading de rotas e performance web. | **5** | |
| **US-40** | [#165](https://github.com/ADS-IFPB-SR/alumigest/issues/165) | Executar Carga Inicial de Dados e Importador de Clientes via CSV | `Sprint 15` | Parser CSV em lote com validações de duplicidade e carga mestre de materiais via Flyway. | **5** | |
| **US-41** | [#166](https://github.com/ADS-IFPB-SR/alumigest/issues/166) | Homologação Integrada Ponta a Ponta da Release 3 (v3.0.0) | `Sprint 15` | Homologação funcional E2E completa: Orçamento ➔ Pedido ➔ PIX ➔ OS Campo ➔ DRE. | **13** | |
| **US-42** | [#167](https://github.com/ADS-IFPB-SR/alumigest/issues/167) | Disponibilizar Guias de Treinamento por Perfil e Central de Ajuda | `Sprint 15` | Manuais operacionais em PDF embarcados na aplicação para cada perfil de usuário. | **3** | |

---

### 🛡️ Sustentação e Governança Final

| ID | Issue GitHub | User Story (Título Funcional) | Sprint | Complexidade / Justificativa Arquitetural | Sugerida (pts) | Estimativa da Equipe (pts) |
| :---: | :---: | :--- | :---: | :--- | :---: | :---: |
| **US-43** | [#168](https://github.com/ADS-IFPB-SR/alumigest/issues/168) | Executar Rotinas de Backup Automático e Disaster Recovery | `Sprint 16` | Rotinas agendadas de backup do PostgreSQL com retenção e scripts de restauração rápida. | **5** | |
| **US-44** | [#169](https://github.com/ADS-IFPB-SR/alumigest/issues/169) | Registrar Trilha de Auditoria Imutável para Ações Críticas | `Sprint 16` | Interceptor Spring AOP capturando autoria, IP e timestamps de alterações de preços e exclusões. | **5** | |
| **US-45** | [#170](https://github.com/ADS-IFPB-SR/alumigest/issues/170) | Monitorar Saúde do Sistema com Actuator e Publicar Documentação | `Sprint 16` | Endpoints de liveness/readiness, métricas JVM com Actuator e consolidação arquitetural final. | **2** | |

---

## 🚫 3. Histórias Descartadas por Decisão de Negócio (Registro de Governança)

As 7 histórias a seguir foram analisadas pelo time e descontinuadas do escopo ativo do projeto para manter o foco na entrega enxuta e de alto valor:

| ID Original (PO) | Título Original | Sprint Original | Motivo do Descarte |
| :---: | :--- | :---: | :--- |
| **US-17** | Gerar Ordens de Produção (OP) Individuais por Peça | Sprint 06 | Produção gerenciada diretamente a partir do Pedido de Venda e seus itens no Kanban. |
| **US-19** | Atualizar Status de Produção via Scanner de QR Code | Sprint 06 | Atualização operacional direta via cartões no painel Kanban da fábrica. |
| **US-23** | Emitir Romaneio de Oficina em PDF com Checklist de Conferência | Sprint 07 | Substituído pela Lista de Corte consolidada e Ficha Técnica por item na tela do pedido. |
| **US-25** | Apontar Perdas, Quebras e Descarte de Sucata | Sprint 08 | Controle de perdas simplificado, mantendo o controle patrimonial via Kardex de movimentações. |
| **US-34** | Realizar Baixa Financeira Manual com Parciais, Juros e Descontos | Sprint 11 | Foco em recebimentos automatizados via PIX dinâmico e gestão de títulos a receber. |
| **US-36** | Emitir Relatório de Fechamento de Caixa Diário em PDF | Sprint 11 | Foco estratégico e consolidado no **Fluxo de Caixa Mensal**. |
| **US-37** | Agendar Instalação e Gerar Ordem de Serviço (OS) | Sprint 12 | Agendamento manual avulso desnecessário; controle vinculado diretamente ao fluxo do pedido. |

---

## 📈 4. Resumo Consolidado das Estimativas Sugeridas

* **Total de User Stories Ativas**: **45 Histórias**
* **Soma Total dos Story Points Sugeridos**: **279 Pontos**
* **Distribuição de Complexidade Sugerida**:
  * **2 pontos (Muito Baixa)**: 1 história (2%)
  * **3 pontos (Baixa Complexidade)**: 7 histórias (16%)
  * **5 pontos (Média Complexidade)**: 20 histórias (44%)
  * **8 pontos (Alta Complexidade)**: 14 histórias (31%)
  * **13 pontos (Muito Alta / Homologação)**: 3 histórias (7%)
* **Média de Pontos por Sprint**: **~17.4 Story Points por Sprint** *(ritmo ideal para uma equipe de 5 desenvolvedores com capacidade média entre 16 e 20 pts por ciclo quinzenal)*.

---

## 📋 5. Próximos Passos para a Reunião de Planning

1. Abrir este documento durante a sessão de **Planning Poker** da equipe.
2. Analisar cada User Story funcional (`US-01` a `US-45`) considerando a estimativa técnica sugerida.
3. Preencher a coluna **"Estimativa da Equipe (pts)"** com o consenso alcançado.
4. Para as histórias da sprint corrente de desenvolvimento, utilizar a estimativa em pontos para calibrar o desdobramento das sub-tarefas técnicas em horas no Kanban/Burndown.

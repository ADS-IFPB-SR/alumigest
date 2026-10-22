# 📋 Especificação da User Story: `US-47`
## Painel 360° de Clientes — Central Integrada de Orçamentos, Ordens de Serviço e Ações Fabris

| Campo | Valor |
|---|---|
| **Identificador** | `US-47` (PBL) |
| **Título** | Central 360° do Cliente: Gestão Consolidada de Orçamentos, O.S. e Ações Rápidas |
| **Épico** | `EP-02: Gestão Comercial & CRM de Clientes` / `EP-06: Gestão de Pedidos e Ordens de Serviço` |
| **Sprint Sugerida** | Sprint 08 (ou Sprint de Consolidação CRM/Fabril) |
| **Product Owner** | José Guylherme dos Santos Melo (Alumiportas) |
| **Tech Lead** | Guilherme Kauã Matos da Silva |
| **Status da Especificação** | 🟡 Proposta e Planejada (Pronta para Refinamento) |

---

## 1. 🎯 Descrição da História de Usuário

**Como** vendedor, atendente comercial ou gerente de produção da Alumiportas,  
**Quero** visualizar uma central única (visão 360°) de cada cliente com a listagem dos seus orçamentos e das suas Ordens de Serviço em uma única tela integrada com padrão mestre-detalhe,  
**Para que** eu possa consultar rapidamente o histórico financeiro e fabril de um cliente específico, emitir etiquetas térmicas de suas O.S., baixar comprovantes, navegar para o Kanban fabril filtrado e criar novos orçamentos sem precisar trocar de módulos ou perder o contexto.

---

## 2. 💡 Contexto e Justificativa de Negócio

No modelo operacional legado e no chão de fábrica da vidraçaria/serralheria (conforme evidência de tela legada da Alumiportas), o operador necessita de uma tela centralizada onde:
1. Ao selecionar um cliente em um grid superior, a parte inferior da tela carrega instantaneamente:
   - Os **Orçamentos** daquele cliente (com situação, valores e itens);
   - As **Ordens de Serviço (O.S.)** daquele cliente (com status de produção, datas e valores);
   - Os **Itens/Esquadrias** da O.S. selecionada (com medidas nominais em mm, tipologia, cor e vidro).
2. O operador precisa disparar **ações contextuais diretas** a partir dessa tela:
   - 🏷️ **Imprimir Etiquetas Térmicas (100x60mm)** da O.S. selecionada para colagem nas peças;
   - 📄 **Baixar Comprovante Oficial da O.S.** em PDF;
   - 📊 **Acessar o Painel Kanban** filtrado para aquele cliente;
   - ➕ **Criar Novo Orçamento** já com os dados cadastrais do cliente pré-carregados;
   - 💬 **Compartilhar orçamentos via WhatsApp** ou gerar a Via Técnica de oficina.

Atualmente no AlumiGest, o cadastro de clientes existe de forma isolada (`/clientes`), os orçamentos ficam em `/orcamentos` e as ordens em `/ordens-servico`. A **US-47** une esses três pilares em uma **experiência fluida e ágil**.

---

## 3. 🏗️ Arquitetura e Segregação de Camadas (Padrões SOLID & Clean Code)

> [!IMPORTANT]
> **Regra Arquitetural Obrigatória:** Nenhuma regra de negócio de cálculo de totais, validação de transição fabril ou dedução de folhas de etiquetas será processada no frontend. O frontend atua estritamente como camada de apresentação e despacho de intenções.

### 3.1 Backend — Endpoints Especializados (CQRS / Projeção Leve)

Para evitar chamadas redundantes e *over-fetching*, o backend expõe endpoints de leitura agregada:

* **`GET /api/v1/customers/{id}/dashboard`**:
  * Retorna o resumo consolidado do cliente:
    - Dados cadastrais (Nome, Documento, Telefone, Endereço, Bairro);
    - Indicadores-chave: Data da última compra, Total de orçamentos (ativos/aprovados), Total de O.S. (em produção/concluídas), Valor total contratado.
* **`GET /api/v1/customers/{id}/orders`**:
  * Retorna as Ordens de Serviço do cliente específico com paginação, código da O.S. (`OS-YYYY-NNNN`), data de aprovação, previsão de entrega, valor total, status fabril (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`, `CANCELLED`) e lista simplificada de itens.
* **`GET /api/v1/customers/{id}/budgets`**:
  * Retorna o histórico de orçamentos vinculados com código, data, validade, status (`RASCUNHO`, `ENVIADO`, `APROVADO`, `RECUSADO`) e valor total.

### 3.2 Frontend — Estrutura de Componentes

Localizado em `frontend/src/features/customers/`:
* `CustomerHubPage.tsx`: Página mestre-detalhe (Master-Detail) com split responsivo;
* `CustomerMasterTable.tsx`: Tabela superior com filtros rápidos (Nome, Documento, Telefone, Bairro);
* `CustomerOverviewCard.tsx`: Card de destaque do cliente ativo com métricas e CTA de "Novo Orçamento";
* `CustomerOrdersTab.tsx`: Tabela de O.S. do cliente com coluna de ações contextuais (Etiquetas, Comprovante, Kanban);
* `CustomerBudgetsTab.tsx`: Tabela de Orçamentos do cliente com ações (PDF Comercial, WhatsApp, Converter em O.S.);
* `CustomerItemDetailDrawer.tsx`: Inspeção lateral/inferior das esquadrias da O.S. selecionada com destaque para medidas em milímetros (`L x A mm`).

---

## 4. 🧪 Critérios de Aceitação (BDD — Gherkin)

```gherkin
Funcionalidade: Painel 360° do Cliente no AlumiGest
  Como atendente comercial ou operador de fábrica
  Quero gerenciar orçamentos e ordens de serviço de um cliente em uma visão unificada
  Para agilizar o atendimento, a emissão de etiquetas e o acompanhamento de produção

  Contexto:
    Dado que o usuário está autenticado no AlumiGest com permissão de visualização
    E acessa o módulo "Central de Clientes" através do menu lateral

  Cenário 1: Seleção de Cliente e Carregamento Automático do Painel Contextual
    Dado que a lista exibe os clientes cadastrados com nome, documento, fone e bairro
    Quando o usuário clica sobre a linha do cliente "Antônio Alfredo Figueiredo"
    Então a linha do cliente recebe destaque visual de seleção ativa
    E o painel inferior carrega instantaneamente o histórico de Ordens de Serviço e Orçamentos desse cliente
    E exibe os cards com total de pedidos ativos, valor total acumulado e data da última compra

  Cenário 2: Impressão de Etiquetas Térmicas Direta da Tela do Cliente
    Dado que o cliente selecionado possui a Ordem de Serviço "OS-2026-0001"
    E a aba "Ordens de Serviço" está visível
    Quando o usuário clica no botão "Etiquetas" na linha da O.S. "OS-2026-0001"
    Então o sistema abre o modal "ThermalLabelModal" pré-configurado para a ordem "OS-2026-0001"
    E exibe as etiquetas térmicas (100x60mm) com medidas nominais em mm, cor e tipo de vidro
    E permite o download do PDF ou envio direto da impressão sem sair da tela do cliente

  Cenário 3: Navegação Contextual para o Painel Kanban da O.S. do Cliente
    Dado que a O.S. "OS-2026-0001" está no status "EM_PRODUCAO"
    Quando o usuário clica na ação "Ver no Kanban"
    Então o sistema redireciona para a página "/producao"
    E aplica automaticamente o filtro pelo código da O.S. ou nome do cliente

  Cenário 4: Disparo de Novo Orçamento com Cliente Pré-selecionado
    Dado que o cliente "Antônio Alfredo Figueiredo" está selecionado na tela
    Quando o usuário aciona o botão "+ Novo Orçamento" no topo do painel do cliente
    Então o sistema navega para o Wizard de Orçamentos ("/orcamentos/novo")
    E o campo de cliente já inicia automaticamente preenchido e travado com "Antônio Alfredo Figueiredo"

  Cenário 5: Inspeção Rápida de Itens e Medidas Nominais da O.S.
    Dado que o usuário clicou na O.S. "OS-2026-0001"
    Quando o painel de itens é exibido
    Então cada peça da esquadria apresenta descrição, quantidade, medidas "Largura x Altura mm", acabamento e tipo de vidro
```

---

## 5. 🧩 Fatias Verticais de Implementação (Tarefas Técnicas)

| Subtarefa | Descrição Técnica | Camada | Horas Estimadas | Responsável Sugerido |
|:---:|---|---|:---:|---|
| **`US-47.1`** | Criar endpoint `GET /api/v1/customers/{id}/orders` e `GET /api/v1/customers/{id}/budgets` com projeções JPA otimizadas | Backend Core / REST | 3.0h | Backend Dev |
| **`US-47.2`** | Criar hook React Query `useCustomerHub` com cache inteligente para agregação de orçamentos e ordens do cliente | Frontend State | 2.0h | Frontend Dev |
| **`US-47.3`** | Implementar componente `CustomerHubPage` com layout mestre-detalhe responsivo seguindo o Design System do AlumiGest | Frontend UI / Layout | 3.5h | Frontend Dev |
| **`US-47.4`** | Integrar o `ThermalLabelModal` e botão de comprovante PDF diretamente na tabela de O.S. do cliente | Frontend Integration | 2.5h | Frontend Dev |
| **`US-47.5`** | Criar suíte de testes unitários no backend (`MockMvc`) e testes E2E com Cypress para o fluxo mestre-detalhe | Qualidade / Testes | 3.0h | QA / Dev |
| **Total** | **Implementação Completa da US-47** | **Fullstack** | **14.0h** | **Equipe** |

---

## 6. ✅ Definition of Done (DoD)

- [ ] Endpoints documentados com Swagger / OpenAPI v3;
- [ ] Testes unitários com cobertura $\ge 80\%$ no backend e frontend (Vitest);
- [ ] Interface 100% responsiva operando com o design system do AlumiGest (Hanken Grotesk, JetBrains Mono, cores canônicas);
- [ ] Emissão de etiquetas térmicas e comprovante PDF testados e homologados diretamente da tela do cliente;
- [ ] Aprovado no SonarQube Quality Gate sem novos code smells ou vulnerabilidades.

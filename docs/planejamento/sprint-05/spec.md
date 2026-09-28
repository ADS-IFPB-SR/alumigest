# Feature Specification: Sprint 5 — Descontos Comerciais (Parte 2), Emissão de PDFs (Comercial e Técnico de Oficina) e Transição para Pedidos

**Feature**: `001-orcamento-descontos-pdf` & `002-pedidos-lock-precos`  
**Release**: Release 1 (Homologação Final v0.5.0) & Transição para Release 2 (v2.0.0)  
**Período da Sprint 05**: 15/09/2026 a 28/09/2026  
**Created**: 2026-08-27  
**Last Updated**: 2026-09-24  
**Status**: 🟢 Concluída / Em Homologação (US-09 Parte 2, US-10 e US-11 entregues)

---

## 1. Visão Geral & Contexto de Negócio

A **Sprint 05** representa o marco de consolidação comercial e fabril do AlumiGest, finalizando a esteira de orçamentos e viabilizando a emissão documental oficial em duas vias:

1. **Conclusão de Descontos e Condições Comerciais (US-09 Parte 2)**:
   - Implementação da regra de negócio de validade padrão de 15 dias corridos (PR #275).
   - Integração da condição de pagamento ao resumo financeiro do orçamento (PR #292).
   - Listagem paginada e filtros dinâmicos de orçamentos (PR #280 / PR #293).
2. **Emissão de Orçamento em PDF - Via Comercial e WhatsApp (US-10)**:
   - Geração de documento PDF oficial com OpenPDF contendo dados do cliente, cabeçalho institucional, discriminação de itens e totais líquidos.
   - Formatação e cópia de resumo para WhatsApp via Clipboard API.
3. **Emissão de Orçamento em PDF - Via Técnica de Oficina (US-11)**:
   - Geração de documento PDF voltado para o chão de fábrica com **estrito sigilo comercial** (zero menções a valores monetários em R$), detalhando dimensões nominais (L x A mm), modelos, perfis, vidros, ferragens e opções construtivas (PR #322 mergeado em 23/09/2026).
4. **Transição para Gestão de Pedidos de Venda (US-13 a US-16)**:
   - Especificação e alinhamento do mecanismo de conversão 1-para-1, snapshot imutável (Lock de Preços) e máquina de estados de produção para a Release 2.
5. **Homologação Integrada da Release 1 (v1.0.0) Incorporada no DoD de US-10 e US-11**:
   - Conforme pactuado entre o Product Owner e a equipe de Engenharia, atividades de homologação e validação de release **não constituem User Stories**, pois não implementam features autônomas.
   - Dessa forma, os critérios da homologação integrada da Release 1 foram **divididos e incorporados como Definition of Done (DoD) e Critérios de Aceitação (TEA)** de **US-10** (Homologação Comercial & WhatsApp) e **US-11** (Homologação Fabril & Sigilo de Oficina). A aprovação de ambas as histórias homologa 100% da Release 1.

---

## 2. 👥 Histórias de Usuário da Sprint 05

### 📌 US-09 (Parte 2): Conclusão de Descontos Comerciais, Validade e Listagem Paginada (Priority: P1)
**Status**: 🟢 Concluída na Sprint 05 ([Issue #133](https://github.com/ADS-IFPB-SR/alumigest/issues/133) / PRs #275, #292, #293)

#### 🎯 Objetivo de Negócio
> **Como** vendedor da Alumiportas,  
> **Desejo** visualizar o resumo financeiro atualizado instantaneamente ao selecionar condições de pagamento e descontos, contar com prazo de validade de 15 dias corridos preenchido automaticamente e consultar orçamentos através de listagem paginada com filtros por status e cliente,  
> **Para que** a negociação comercial seja ágil, organizada e livre de erros manuais de cálculo.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [x] **Cenário 1: Definição automática de validade padrão de 15 dias corridos e indicador de expiração**
  - **Dado que** um novo orçamento é criado no sistema
  - **Quando** a data de emissão é registrada
  - **Então** o campo `dataValidade` é preenchido automaticamente com a data de emissão $+ 15$ dias corridos
  - **E** caso a data atual ultrapasse a validade, a listagem e o detalhe exibem o badge visual `EXPIRED`.
- [x] **Cenário 2: Sincronização da condição de pagamento com o resumo financeiro**
  - **Dado que** o vendedor está na tela de detalhes ou edição do orçamento
  - **Quando** seleciona a condição de pagamento (ex: "50% Entrada + 50% na Entrega")
  - **Então** o resumo financeiro computa os valores das parcelas e reflete as condições em tempo real na interface.
- [x] **Cenário 3: Listagem paginada e filtros dinâmicos de orçamentos**
  - **Dado que** existem dezenas de propostas salvas no banco de dados
  - **Quando** o usuário navega pela tela `/orcamentos` e pesquisa por nome do cliente ou filtra por status (`DRAFT`, `APPROVED`)
  - **Então** a API `GET /api/budgets` retorna a página de resultados ordenada por data de criação com metadados de paginação.

#### 🛡️ Definition of Done (DoD) — Módulo Comercial de Descontos
- [x] **Cálculos Matemáticos de Precisão**: Regras de desconto e parcelamento validadas com `BigDecimal` e escala 2 em 100% dos testes.
- [x] **Persistência Relacional e Migrações**: Esquema de orçamentos e itens persistido via Flyway sem falhas de integridade referencial.
- [x] **SonarQube Quality Gate**: Cobertura de código novo $\ge 80\%$ nas classes do módulo `budgets` e zero vulnerabilidades SAST.

---

### 📌 US-10: Emitir e Exportar Orçamento em PDF - Via Comercial e WhatsApp (Priority: P1)
**Status**: 🟢 Concluída na Sprint 05 ([Issue #134](https://github.com/ADS-IFPB-SR/alumigest/issues/134) / PRs #294 a #313)

#### 🎯 Objetivo de Negócio
> **Como** vendedor ou cliente da Alumiportas,  
> **Desejo** emitir e baixar o orçamento em formato PDF oficial com layout profissional e responsivo, contendo cabeçalho institucional, dados do cliente, especificações completas dos itens com valores discriminados, descontos, totais e condições comerciais, além de poder copiar o resumo para o WhatsApp,  
> **Para que** a proposta formal seja entregue com clareza, transparência e agilidade ao cliente.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [x] **Cenário 1: Emissão e Download do PDF Comercial com Sucesso**
  - **Dado que** o usuário visualiza um orçamento válido e calculado
  - **Quando** aciona o botão "Emitir PDF Comercial" na página `BudgetDetailPage`
  - **Então** o sistema gera o arquivo `application/pdf` em menos de 2 segundos com download direto do documento
  - **E** o documento exibe cabeçalho oficial com logotipo da Alumiportas, número do orçamento, datas de emissão e validade, dados do cliente, itens com medidas nominais (L x A mm), cor do alumínio, vidro, valor unitário, desconto, valor total e condição de pagamento.
- [x] **Cenário 2: Paginação e Rodapé Padronizado para Múltiplas Páginas**
  - **Dado que** um orçamento possui muitos itens ultrapassando uma página A4
  - **Quando** o PDF comercial é renderizado pelo motor OpenPDF
  - **Então** o documento realiza a quebra automática de páginas com rodapé numerado "Página X de Y" e repetição do cabeçalho simplificado.
- [x] **Cenário 3: Cópia do Resumo Formatado para WhatsApp**
  - **Dado que** o vendedor está na página de detalhes do orçamento
  - **Quando** clica no botão "Copiar Resumo Comercial"
  - **Então** o texto formatado para WhatsApp com emojis e destaques em negrito é copiado para a área de transferência (Clipboard API)
  - **E** uma notificação visual (*toast* de sucesso) é exibida na interface.
- [x] **Cenário 4: Tratamento de Dados Incompletos do Cliente**
  - **Dado que** o cliente vinculado ao orçamento não possui CPF/CNPJ ou endereço completo informado
  - **Quando** o PDF comercial é emitido
  - **Então** o documento é renderizado normalmente exibindo "Não informado" nos campos ausentes sem falhas de layout.
- [x] **Cenário 5: Tratamento de Erro para Orçamento Inexistente**
  - **Dado que** uma requisição informa um identificador inexistente
  - **Quando** o endpoint `GET /api/budgets/{id}/pdf` for invocado
  - **Então** o backend responde com status HTTP `404 Not Found` no formato padronizado `ErrorResponse`.
- [x] **Cenário 6: Preservação de Sigilo na Via Comercial**
  - **Dado que** o documento emitido é a via comercial
  - **Quando** o PDF é gerado
  - **Então** os valores monetários de venda são exibidos, mas quaisquer custos internos de matéria-prima, fórmulas de usinagem e listas de corte permanecem estritamente omitidos.

#### 🛡️ Definition of Done & Homologação Comercial da Release 1 (v1.0.0)
> *Critérios de homologação da jornada comercial absorvidos da Release 1*
- [x] **Homologação E2E da Jornada Comercial (Quickstart R1)**: Fluxo ponta a ponta validado com sucesso (Insumo ➔ Produto ➔ Orçamento com Desconto ➔ Emissão do PDF Comercial e cópia para WhatsApp).
- [x] **Performance de Renderização**: Emissão de documentos PDF em menos de 2 segundos para propostas de até 20 itens.
- [x] **Resiliência a Falhas de Entrada**: Geração correta do PDF mesmo com dados cadastrais incompletos do cliente ("Não informado").
- [x] **Auditoria de Responsividade Mobile**: Telas de orçamento, botão de PDF e link de WhatsApp operando fluidamente em smartphones/tablets ($\le 768px$).
- [x] **Conformidade de CI/CD & SonarQube**: Build Maven e suíte Vitest/Cypress 100% verdes sem regressões, com New Code Coverage $\ge 80\%$ no SonarQube.

---

### 📌 US-11: Emitir Orçamento em PDF - Via Técnica de Oficina (Priority: P2)
**Status**: 🟢 Concluída na Sprint 05 ([Issue #135](https://github.com/ADS-IFPB-SR/alumigest/issues/135) / PR #322)

#### 🎯 Objetivo de Negócio
> **Como** serralheiro, montador ou encarregado de produção da oficina da Alumiportas,  
> **Desejo** emitir e baixar uma via técnica detalhada do orçamento em formato PDF oficial com layout voltado para produção (chão de fábrica), contendo identificação da proposta, dados do cliente e especificações físicas completas das esquadrias, sob **estrito sigilo comercial** (sem exibir preços unitários, totais ou descontos),  
> **Para que** a equipe de fabricação execute o corte, usinagem e montagem de forma segura sem acesso a dados financeiros confidenciais da negociação.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [x] **Cenário 1: Emissão e Download da Ficha Técnica com Sucesso (Chão de Fábrica)**
  - **Dado que** o operador acessa um orçamento válido na página `BudgetDetailPage`
  - **Quando** clica no botão "Via Técnica"
  - **Então** o sistema gera e disponibiliza para download o arquivo `application/pdf` em menos de 2 segundos
  - **E** o documento exibe cabeçalho oficial com logotipo da Alumiportas, badge destacado "VIA TÉCNICA - USO INTERNO / OFICINA", código do orçamento, data de emissão, dados do cliente e instruções de produção.
- [x] **Cenário 2: Sigilo Comercial Rigoroso (Zero Valores Financeiros em R$)**
  - **Dado que** o documento emitido é a Ficha Técnica de Oficina
  - **Quando** o PDF é renderizado pelo motor OpenPDF
  - **Então** nenhuma seção, linha ou tabela deve conter valores monetários (sem preço unitário, subtotal, taxa de mão de obra, percentual de desconto, valor de desconto ou valor total da proposta)
  - **E** as únicas informações numéricas exibidas devem ser dimensões físicas milimétricas (L x A mm), quantidades de peças e áreas nominais ($m^2$).
- [x] **Cenário 3: Detalhamento Técnico das Esquadrias e Opções Construtivas**
  - **Dado que** o orçamento contém esquadrias configuradas (janelas, portas, basculantes)
  - **Quando** a tabela técnica é gerada
  - **Então** cada item discrimina: tipologia/modelo, dimensões nominais (Largura x Altura em mm), quantidade, cor do perfil de alumínio, especificação do vidro (tipo e espessura em mm), lado/sentido de abertura, puxadores e ferragens previstas.
- [x] **Cenário 4: Paginação, Rodapé de Oficina e Campo de Visto Técnico**
  - **Dado que** uma ordem técnica possui muitos itens ultrapassando uma página A4
  - **Quando** o PDF é compilado
  - **Então** o documento realiza a quebra automática de página com rodapé numerado "Página X de Y" e campo para visto/assinatura do encarregado de qualidade da oficina.
- [x] **Cenário 5: Bloqueio de Emissão para Orçamentos Cancelados**
  - **Dado que** um orçamento possui status `CANCELLED`
  - **Quando** o usuário visualiza a página de detalhes
  - **Então** o botão "Via Técnica" permanece desabilitado (`disabled`) com tooltip explicativo
  - **E** caso uma requisição HTTP direta seja disparada contra `GET /api/budgets/{id}/technical-pdf`, o backend retorna status HTTP `422 Unprocessable Entity`.
- [x] **Cenário 6: Feedback Visual de Download e Prevenção de Múltiplos Cliques**
  - **Dado que** o operador clica no botão "Via Técnica"
  - **Quando** a requisição de geração do PDF estiver em processamento (`isPending`)
  - **Então** o botão entra em estado de carregamento com ícone animado de rotação e texto "Gerando..."
  - **E** novos cliques são desabilitados até a conclusão do download.
- [x] **Cenário 7: Tratamento de Erro para Orçamento Inexistente**
  - **Dado que** é solicitada a via técnica informando um identificador inválido ou não cadastrado
  - **Quando** o endpoint `GET /api/budgets/{id}/technical-pdf` for invocado
  - **Então** o backend responde com status HTTP `404 Not Found` no payload padronizado `ErrorResponse`.

#### 🛡️ Definition of Done & Homologação Fabril da Release 1 (v1.0.0)
> *Critérios de homologação da jornada de chão de fábrica absorvidos da Release 1*
- [x] **Homologação de Estrito Sigilo Comercial**: Validação automatizada e manual de que nenhuma seção, coluna ou rodapé exibe valores monetários (zero R$, sem descontos, sem preços unitários ou totais).
- [x] **Homologação da Ficha de Montagem & Corte**: Discriminação rigorosa das medidas nominais milimétricas ($W \times H$ mm), cor do alumínio, vidro, sentido de abertura e espaço para visto técnico do encarregado de qualidade.
- [x] **Validação de Invariante de Máquina de Estados**: Bloqueio HTTP 422 e desabilitação do botão visual para orçamentos cancelados (`CANCELLED`).
- [x] **Teste Automatizado de Extração de Texto**: Teste unitário OpenPDF extraindo texto e afirmando a ausência de termos monetários.
- [x] **Aprovação Global da Release 1**: Conclusão formal da esteira de fabricação com SonarQube Quality Gate verde, selando a baseline v1.0.0.

---

## 3. Transição para a Sprint 06

Com a conclusão da Release 1 na Sprint 05 (US-09 Parte 2, US-10 e US-11 homologados via PRs #275 a #322), o ciclo comercial formalizou a base para a gestão de pedidos e fábrica.

A conversão de orçamentos aprovados em pedidos de venda vinculantes, lock de preços e emissão documental de pedidos passam a compor oficialmente a **[Sprint 06](../sprint-06/spec.md)** (período de **29/09/2026 a 12/10/2026**), contemplando as User Stories **US-13, US-14, US-15 e US-16**.
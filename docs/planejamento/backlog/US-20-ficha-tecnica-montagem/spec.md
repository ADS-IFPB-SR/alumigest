# Especificação Funcional: US-20 — Gerar Ficha Técnica de Montagem por Item da Ordem de Serviço (O.S.)

**Identificador**: `US-20`  
**Issue GitHub**: [#145](https://github.com/ADS-IFPB-SR/alumigest/issues/145)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como montador e serralheiro de bancada da Alumiportas, desejo consultar a Ficha Técnica de Montagem detalhada por item da Ordem de Serviço (`OS-YYYY-NNNN`), contendo orientações milimétricas de usinagem, furação, puxadores, fixação de ferragens, acabamento de cor e diagrama de montagem das esquadrias, para garantir a precisão milimétrica e padronização na bancada da oficina.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Exibição Completa das Cotas de Usinagem e Furação na Bancada**
  - **Dado que** o montador acessa o card da O.S. no Kanban ou na tela de detalhes da ordem,
  - **Quando** clica no ícone "Ver Ficha Técnica / Cortes" de um item específico,
  - **Então** o modal `OrderTechnicalSheetModal` é aberto exibindo:
    1. Código da O.S. (`OS-YYYY-NNNN`) e identificador do item (`description`);
    2. Medidas nominais ($L \times A$ mm), linha (`Linha Gold` / `Linha Suprema`) e cor (`aluminumColor`);
    3. Tabela de perfis com medidas de corte e ângulos;
    4. Especificações de puxadores (`handleConfig`), posições de furação e sentido de abertura (`openingDirection`);
    5. Ferragens e acessórios exigidos para a montagem.

- [ ] **Cenário 2: Orientações Críticas de Montagem e Alertas Construtivos**
  - **Dado que** o template paramétrico do item possui regras especiais de usinagem (ex: roldana blindada de alta carga, fechadura bico de papagaio, folha direita usinada),
  - **Quando** a ficha técnica é renderizada,
  - **Então** o sistema destaca uma caixa visual de atenção ("Atenção na Montagem") em tom âmbar com as orientações operacionais específicas da tipologia.

- [ ] **Cenário 3: Impressão da Ficha de Bancada em Folha Única**
  - **Dado que** a oficina necessita anexar a ficha física à bancada de montagem,
  - **Quando** o operador clica em "Imprimir Ficha",
  - **Então** o navegador imprime uma folha única A4 estilizada, limpa e legível para a oficina.

- [ ] **Cenário 4: Tratamento para Item de O.S. Inexistente**
  - **Dado que** é informada uma referência inválida de item,
  - **Quando** o endpoint `GET /api/v1/order-items/{id}/assembly-sheet` for acionado,
  - **Então** o backend responde com status HTTP `404 Not Found` no payload padronizado `ErrorResponse`.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Imutabilidade Operacional):** Os dados da ficha técnica devem ser extraídos unicamente do snapshot gravado em `tb_order_items` (`template_config`, `handle_config`, `drilling_config`).
- **RN-02 (Dicionário Vernáculo na UI):** Termos técnicos de usinagem e puxadores armazenados em inglês (ex: `SHELL_LOCK`, `TUBULAR`, `CUSTOM_DISTANCES`) devem ser apresentados em pt-BR na interface, prevenindo a reocorrência do `BUG-026`.
- **RN-03 (Diretriz de Idioma em Variáveis):** Estruturas de dados em Java e DTOs devem utilizar inglês técnico (`assemblySheet`, `drillingConfig`, `hardwareList`).

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Endpoint:** `GET /api/v1/order-items/{orderItemId}/assembly-sheet`
- **DTOs:** `AssemblySheetResponseDTO` (`orderItemId`, `orderCode`, `description`, `widthMm`, `heightMm`, `aluminumColor`, `glassType`, `hardware`, `profiles`, `machiningNotes`)
- **Service:** `AssemblySheetService.generateAssemblySheet(UUID orderItemId)`

### Frontend (React 19 / Vite / TanStack Query / Tailwind)
- **Componentes:** `OrderTechnicalSheetModal.tsx` e `AssemblySheetView.tsx` (conforme validado no `prototipo_kambam.html`)
- **Hook:** `useAssemblySheet(orderItemId)`
- **Integração:** Botão "Ficha de Bancada" em cada linha de esquadria na `OrderDetailPage.tsx` e no card do `OrderProductionCard.tsx`

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `AssemblySheetServiceTest` validando extração de dados nominais, perfis e acessórios.
- [ ] Teste de integração REST validando retorno HTTP 200 e erro HTTP 404 em item inexistente.
- [ ] Componente visual `OrderTechnicalSheetModal.tsx` testado com dados mockados e realistas.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (4 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-20.1](issues/US-20.1-implementar-metodo-gerarfichamontagem-long-or/issue.md) | Implementar método `generateAssemblySheet(UUID orderItemId)` no `AssemblySheetService` | 🔲 No Backlog |
| [US-20.2](issues/US-20.2-adicionar-endpoint-get-api-order-i/issue.md) | Adicionar endpoint `GET /api/v1/order-items/{id}/assembly-sheet` no controller de produção | 🔲 No Backlog |
| [US-20.3](issues/US-20.3-criar-componente-assemblysheetview-no-fronten/issue.md) | Criar componente `AssemblySheetView` no frontend exibindo as orientações e acessórios da peça | 🔲 No Backlog |
| [US-20.4](issues/US-20.4-integrar-a-visualizacao-da-ficha-tecnica-na-t/issue.md) | Integrar a visualização da Ficha Técnica na página de detalhes do Item (`OrderDetailPage.tsx`) e no modal do Kanban | 🔲 No Backlog |

---

**Branch:** `feat/us-20-ficha-tecnica-montagem`

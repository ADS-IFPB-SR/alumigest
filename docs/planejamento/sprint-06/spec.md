# Feature Specification: Sprint 6 — Ordens de Produção (OP), Rastreamento de Status e Etiquetas QR Code

**Feature**: `003-ordens-producao-qrcode`
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Após a conversão de um orçamento em Pedido de Venda (`Order`), o AlumiGest inicia a gestão do chão de fábrica da Alumiportas. 

A fabricação de esquadrias de alumínio e vidros temperados exige controle rigoroso de cada peça individualmente desde o corte dos perfis até a montagem e expedição. Para eliminar papéis soltos e peças perdidas na oficina, esta sprint introduz:
1. **Geração de Ordens de Produção (OP) Individuais por Peça**: Cada esquadria física do pedido recebe seu próprio código sequencial (`OP-YYYY-NNNN-XX`) e ciclo de vida independente.
2. **Rastreamento de Etapas de Fabricação**: Controle de status em tempo real (`AGUARDANDO_CORTE`, `EM_CORTE`, `EM_MONTAGEM`, `CONTROLE_QUALIDADE`, `PRONTO_EXPEDICAO`, `EXPEDIDO`).
3. **Etiquetas com QR Code (100x50mm)**: Emissão de etiquetas adesivas térmicas contendo medidas nominais (L x A mm), cor do perfil, tipo de vidro, código do pedido e QR Code de alta densidade.
4. **Scanner Rápido de Chão de Fábrica (PWA)**: Leitura de QR Code via câmera do smartphone/tablet para transicionar o status da peça em 1 toque com seleção simplificada do operador.

---

## 2. Histórias de Usuário (User Stories)

### User Story 1 (P1) — Geração de Ordens de Produção Individuais por Peça 🎯 MVP

**Como** Gerente de Produção da Alumiportas,
**Quero** gerar as Ordens de Produção individuais para todas as peças de um pedido de venda aprovado,
**Para que** cada esquadria física seja rastreada de forma autônoma na fábrica.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Geração de OPs individuais para itens com múltiplas quantidades
  Dado que existe um pedido "PED-2026-0001" no status "AGUARDANDO_PRODUCAO" com 1 item "Janela 2F" (quantidade = 2) e 1 item "Porta Giro" (quantidade = 1)
  Quando o encarregado clica em "Liberar para Produção"
  Então o sistema deve criar 3 Ordens de Produção individuais:
    | Código           | Descrição  | Peça   |
    | OP-2026-0001-01  | Janela 2F  | 1 de 2 |
    | OP-2026-0001-02  | Janela 2F  | 2 de 2 |
    | OP-2026-0001-03  | Porta Giro | 1 de 1 |
  E o status de cada OP deve ser "AGUARDANDO_CORTE"
  E o status do pedido pai "PED-2026-0001" deve mudar para "EM_PRODUCAO"
```

---

### User Story 2 (P1) — Emissão de Etiquetas com QR Code (100x50mm) 🎯 MVP

**Como** Operador de Fábrica / Cortador,
**Quero** imprimir o lote de etiquetas adesivas térmicas de 100x50mm contendo o QR Code para colar no perfil de cada esquadria,
**Para que** a peça seja identificada visualmente e possa ser escaneada em qualquer etapa da fábrica.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Impressão do lote de etiquetas térmicas do pedido
  Dado que as OPs do pedido "PED-2026-0001" foram geradas
  Quando o usuário clica em "Imprimir Etiquetas com QR Code"
  Então o sistema deve gerar um PDF formatado em páginas de 100x50mm (ou folha A4 com etiquetas individuais)
  E cada etiqueta deve conter: Código da OP, Pedido, Cliente, Descrição, Largura x Altura (mm), Cor, Vidro e o QR Code nítido
```

---

### User Story 3 (P1) — Atualização de Status via Scanner de QR Code 🎯 MVP

**Como** Montador ou Inspetor de Qualidade,
**Quero** apontar a câmera do celular/tablet para a etiqueta da peça e avançar a etapa de fabricação com 1 clique,
**Para que** o sistema registre o progresso em tempo real sem atrito operacional.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Avanço de etapa por leitura de QR Code no PWA
  Dado que a OP "OP-2026-0001-01" está no status "EM_CORTE"
  Quando o operador escaneia o QR Code no PWA
  E seleciona o operador "Carlos Silva" e clica em "Avançar para Montagem"
  Então o status da OP deve ser atualizado para "EM_MONTAGEM"
  E o histórico de movimentação deve salvar a data/hora e o nome do operador
```

---

### User Story 4 (P2) — Painel de Acompanhamento da Produção (Quadro Kanban)

**Como** Diretor de Operações e Gerente de Produção,
**Quero** visualizar o quadro Kanban de produção com todas as peças distribuídas por estágio de fabricação,
**Para que** eu identifique gargalos, peças atrasadas e saiba exatamente quando o pedido estará concluído.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Conclusão de 100% das OPs atualiza o Pedido de Venda
  Dado que um pedido possui 3 OPs e 2 já estão "PRONTO_EXPEDICAO"
  Quando a terceira OP for marcada como "PRONTO_EXPEDICAO"
  Então o status geral do Pedido de Venda "PED-2026-0001" deve mudar automaticamente para "CONCLUIDO"
```

---

## 3. Requisitos Funcionais

1. **RF01 - Decomposição Individual de Peças**: Para cada `OrderItem` com `quantidade = N`, o sistema deve gerar $N$ registros em `ProductionOrder` com sufixo sequencial (`-01`, `-02`, etc.).
2. **RF02 - Rastreabilidade com Pedido**: Cada OP mantém chave estrangeira obrigatória para `OrderItem` e `Order`.
3. **RF03 - Máquina de Estados da OP**:
   - `AGUARDANDO_CORTE` → `EM_CORTE` → `EM_MONTAGEM` → `CONTROLE_QUALIDADE` → `PRONTO_EXPEDICAO` → `EXPEDIDO`.
4. **RF04 - Geração de QR Code**: Geração de imagem QR Code em alta resolução (ZXing no backend ou canvas no frontend) contendo link para o endpoint de detalhe da OP.
5. **RF05 - Impressão Térmica 100x50mm**: Layout de PDF de etiqueta em tamanho exato de 100x50mm para impressoras térmicas (Zebra/Argox/Elgin).
6. **RF06 - Scanner de Câmera no Frontend**: Componente de scanner contínuo usando HTML5 `getUserMedia` com feedback sonoro e visual ao bipar.
7. **RF07 - Sincronização Automática com o Pedido**: Quando todas as OPs de um pedido forem concluídas (`PRONTO_EXPEDICAO` ou `EXPEDIDO`), o status do pedido pai é atualizado automaticamente para `CONCLUIDO`.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Granularidade das OPs)**: 1 OP individual por peça física (`OP-2026-0001-01`, `OP-2026-0001-02`), permitindo rastreamento autônomo de cada esquadria.
- **Q2 (Formato da Etiqueta)**: Etiqueta térmica adesiva 100x50mm com QR Code de alta densidade + visualização em PDF.
- **Q3 (Identificação do Operador)**: Avanço rápido de 1 clique com seleção simples de operador em lista suspensa na tela do scanner.
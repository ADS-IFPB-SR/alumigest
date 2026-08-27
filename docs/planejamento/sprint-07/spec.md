# Feature Specification: Sprint 7 — Lista de Corte & Ficha Técnica de Montagem (Romaneio de Oficina)

**Feature**: `004-lista-corte-ficha-montagem`
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Na rotina da serralheria e vidraçaria da Alumiportas, após a geração das Ordens de Produção (Sprint 6), os cortadores e montadores necessitam de um documento operacional claro e sem ambiguidades para transformar os perfis de alumínio e chapas de vidro nos produtos finais.

> **Importante (Diretriz de Escopo)**: Conforme alinhamento do projeto, **não há cálculo automatizado com fórmulas matemáticas de desconto/nesting**. A funcionalidade é um **Romaneio de Oficina e Ficha Técnica de Montagem**, detalhando:
> - Medidas nominais das esquadrias (Largura x Altura em mm) e quantidades
> - Especificação do tipo de material (perfis de alumínio, chapas de vidro, ferragens e acessórios)
> - Cores e acabamentos dos perfis (branco, preto, bronze, fosco, etc.)
> - Especificação detalhada dos vidros (tipo, cor, espessura)
> - Lado e sentido de abertura (Direita, Esquerda, Correr, Maxim-ar, Basculante, Pivotante)
> - Relação de ferragens e componentes necessários por peça
> - Checklist físico para conferência de corte e montagem na oficina

---

## 2. Histórias de Usuário (User Stories)

### User Story 1 (P1) — Lista Consolidada de Corte do Pedido de Venda 🎯 MVP

**Como** Cortador de Alumínio e Vidro da Alumiportas,
**Quero** visualizar a Lista Consolidada de Corte do Pedido contendo todas as peças a serem cortadas com suas medidas nominais, acabamentos e cores,
**Para que** eu possa separar as barras de perfil e chapas de vidro do estoque e realizar os cortes do pedido com organização.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Visualização do Romaneio Consolidado de Corte
  Dado que existe um pedido "PED-2026-0001" em produção com 3 itens (Janelas e Portas)
  Quando o cortador acessa o "Romaneio de Corte do Pedido"
  Então o sistema deve exibir a tabela consolidada agrupando os itens por tipo de material
  E cada linha deve detalhar: Código da OP, Descrição do Produto, Medidas Nominais (LxA mm), Quantidade, Cor do Alumínio, Especificação do Vidro e Lado de Abertura
```

---

### User Story 2 (P1) — Ficha Técnica de Montagem por Ordem de Produção 🎯 MVP

**Como** Montador de Esquadrias na bancada da oficina,
**Quero** consultar a Ficha Técnica de Montagem de uma OP específica (na tela do PWA ou no papel),
**Para que** eu identifique com precisão o lado de abertura, posicionamento de fechos/puxadores, ferragens e vidros a serem montados naquela peça.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Ficha de Montagem detalhada por OP
  Dado que o montador acessa a OP "OP-2026-0001-01"
  Quando ele abre a "Ficha Técnica de Montagem"
  Então o sistema deve apresentar os dados completos:
    | Campo                | Valor Exemplo                 |
    | OP                   | OP-2026-0001-01 (Peça 1 de 2) |
    | Modelo               | Janela 2 Folhas Correr        |
    | Medida Nominal       | 1200 x 1000 mm                |
    | Cor do Alumínio      | Preto                         |
    | Vidro                | Temperado 8mm Fume            |
    | Sentido de Abertura  | Correr (Folha Direita Móvel)  |
    | Ferragens/Acessórios | 1x Fecho Concha, 2x Roldanas  |
```

---

### User Story 3 (P2) — Emissão de Romaneio de Oficina em PDF com Checklist de Conferência

**Como** Encarregado de Produção,
**Quero** emitir o PDF do Romaneio de Oficina em folha A4 contendo colunas de conferência com checkboxes (`[ ] Cortado`, `[ ] Montado`),
**Para que** os operadores assinalem fisicamente com caneta o avanço das peças na prancheta de trabalho.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Download do PDF do Romaneio de Oficina
  Dado que o pedido "PED-2026-0001" existe
  Quando o usuário clica em "Emitir Romaneio de Oficina (PDF)"
  Então o sistema gera um PDF profissional em folha A4 contendo:
    - Cabeçalho com dados do pedido, cliente e prazo de entrega
    - Tabela de itens com medidas nominais (LxA mm), cores, vidros e aberturas
    - Relação de ferragens e acessórios necessários
    - Colunas de visto manual "[ ] Cortado" e "[ ] Montado"
```

---

## 3. Requisitos Funcionais

1. **RF01 - Dupla Visualização Operacional**: Fornecer endpoint e tela para a Lista Consolidada de Corte do Pedido e para a Ficha Técnica Individual por OP.
2. **RF02 - Mapeamento Completo de Atributos**: Exibir em todas as visões os atributos essenciais: Medidas Nominais (LxA mm), Cor do Alumínio, Tipo de Vidro, Sentido de Abertura e Lista de Ferragens.
3. **RF03 - Sem Fórmulas de Otimização**: O sistema exibe os dados nominais contratados e descritivos cadastrados no item do pedido, sem dependência de fórmulas complexas de nesting.
4. **RF04 - PDF Estruturado para Prancheta**: Geração de PDF A4 com OpenPDF formatado com caixas de visto manual para chão de fábrica.
5. **RF05 - Integração com o Scanner**: A Ficha Técnica de Montagem de uma peça pode ser aberta diretamente após a leitura do QR Code da etiqueta (Sprint 6).

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Visões de Produção)**: Ambas as visões disponíveis (Lista Consolidada de Corte do Pedido inteiro + Ficha Técnica Individual por OP).
- **Q2 (Medidas e Cálculos)**: Exibição das medidas nominais contratadas (LxA mm) e especificações completas de materiais/cores/aberturas, sem fórmulas no template.
- **Q3 (Layout do PDF)**: PDF A4 estruturado com colunas de conferência física (`[ ] Cortado`, `[ ] Montado`) para visto manual dos operadores.
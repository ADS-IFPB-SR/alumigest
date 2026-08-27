# ESQ — Especificação Técnica de Templates de Esquadrias, Orçamentos e Romaneio

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Documento** | Especificação Técnica e Arquitetural de Templates, Orçamentos e Romaneio |
| **Versão** | 1.0 (Sprint 3) |
| **Data** | 21/08/2026 |
| **Autor** | Equipe de Engenharia AlumiGest |

---

## 1. 🎯 Visão Geral do Módulo

Este documento especifica a modelagem técnica, arquitetura de dados, endpoints REST e regras visuais/gráficas para o desenvolvimento da **Sprint 3**, abrangendo:
1. **Templates de Produtos (Esquadrias Paramétricas)**: Modelos de portas, janelas e fachadas com desenho vetorial SVG, furação e puxadores.
2. **Requisitos de Categorias de Insumos**: Vínculo dinâmico por categorias de material (`GLASS`, `PROFILE`, `HARDWARE`, `FILM`).
3. **Orçamentos Comerciais**: Montagem de propostas, seleção de insumos específicos por categoria, cálculo automático e gestão de status.
4. **Relatório Comercial e Romaneio de Oficina**: Visualização detalhada para cliente e lista de corte/fabricação com exportação/impressão em folha A4.

---

## 2. 🚪 Modelagem dos Templates de Esquadria

### 2.1 Tipos de Esquadria Suportados (`DoorTemplateType`)

| Enum | Descrição Técnica | Sentido de Abertura Suportado |
| :--- | :--- | :--- |
| `SLIDING_DOOR_2F` | Porta de Correr 2 Folhas (1 Fixa + 1 Móvel) | `LEFT_TO_RIGHT`, `RIGHT_TO_LEFT` |
| `SLIDING_DOOR_4F` | Porta de Correr 4 Folhas (2 Fixas Laterais + 2 Móveis Centrais) | `CENTER_TO_SIDES` |
| `PIVOTING_DOOR` | Porta Pivotante com Eixo Deslocado | `OUTSIDE`, `INSIDE` |
| `SWING_DOOR_1F` | Porta de Giro / Abrir 1 Folha | `OUTSIDE`, `INSIDE` |
| `SWING_DOOR_2F` | Porta de Giro / Abrir 2 Folhas | `OUTSIDE`, `INSIDE` |
| `SLIDING_WINDOW_2F` | Janela de Correr 2 Folhas | `LEFT_TO_RIGHT`, `RIGHT_TO_LEFT` |
| `SLIDING_WINDOW_4F` | Janela de Correr 4 Folhas | `CENTER_TO_SIDES` |
| `MAXIM_AR_WINDOW` | Janela Maxim-Ar com Projeção Superior | Basculante |
| `GLASS_BOX_FRONTAL` | Box de Banheiro Frontal F1 (1 Fixo + 1 Correr) | `LEFT_TO_RIGHT`, `RIGHT_TO_LEFT` |
| `GLASS_BOX_CORNER` | Box de Banheiro em Canto (L) | Central / Canto |
| `FIXED_GLASS_FACADE` | Painel Fixo / Fachada em Vidro | Fixo |

---

### 2.2 Estrutura de Configuração Paramétrica (`TemplateConfig`)

```json
{
  "templateType": "SLIDING_DOOR_2F",
  "aluminumColor": "BLACK",
  "glassFinish": "CLEAR",
  "openingDirection": "LEFT_TO_RIGHT",
  "handleType": "BAR_TUBULAR",
  "handleConfig": {
    "handleType": "BAR_TUBULAR",
    "side": "BOTH_SIDES",
    "coverage": "PIECE",
    "pieceLengthCm": 40
  },
  "drillingConfig": {
    "holeCount": 2,
    "divisionType": "EQUAL",
    "customDistancesMm": [150, 450]
  },
  "isSlatted": false,
  "hasFixedPanel": true
}
```

#### Regras de Furação e Puxadores:
- **Puxador:** Localizado na folha móvel, no lado de abertura. Pode ser `BAR_TUBULAR` (Inox), `SHELL_LOCK` (Fecho concha) ou `LEVER_HANDLE` (Maçaneta). Cobertura pode ser `FULL` (extensão inteira) ou `PIECE` (pedaço em cm). Lados: `ONE_SIDE` (1 lado) ou `BOTH_SIDES` (ambos os lados).
- **Furação:** Renderizada com retículos `Ø` na **borda externa da folha**, obrigatoriamente no **lado oposto ao puxador**.
- **Inversão de Abertura:** Quando o sentido de abertura é invertido (Direita $\leftrightarrow$ Esquerda), o template SVG inverte dinamicamente as posições da folha móvel, puxador, folha fixa, furação e setas de indicação.

---

## 3. 🧩 Desacoplamento por Categorias de Insumos

Ao cadastrar um Produto/Template, o usuário **NÃO fixa materiais específicos**, mas sim as **Categorias Obrigatórias** que devem ser cotadas no momento do orçamento:

```json
[
  { "id": "req-vidro", "categoryType": "GLASS", "label": "Vidro das Folhas", "isOptional": false },
  { "id": "req-perfil", "categoryType": "PROFILE", "label": "Perfis e Trilhos de Alumínio", "isOptional": false },
  { "id": "req-ferragem", "categoryType": "HARDWARE", "label": "Kit de Ferragens e Fechos", "isOptional": false },
  { "id": "req-pelicula", "categoryType": "FILM", "label": "Película Protetora/Decorativa", "isOptional": true }
]
```

No momento da criação do Orçamento:
1. O usuário escolhe o Template (ex: *Box Frontal F1*).
2. O sistema lista cada categoria requerida.
3. Para `GLASS`, o usuário escolhe a espessura/acabamento (ex: *Temperado 8mm Incolor*).
4. Para `PROFILE`, o usuário escolhe a linha/cor (ex: *Perfil Linha Box Preto*).
5. Para `HARDWARE`, o usuário escolhe o kit (ex: *Kit Box Frontal Alumínio*).
6. Para `FILM`, o usuário escolhe se aplica película ou não.

---

## 4. 🧮 Modelagem e Ciclo de Vida do Orçamento (`Budget`)

### 4.1 Máquina de Estados do Orçamento
```
[DRAFT] (Rascunho)
   │
   ▼
[SENT] (Enviado ao Cliente)
   ├──► [APPROVED] (Aprovado pelo Cliente ➔ Libera Romaneio e Pedido)
   ├──► [REJECTED] (Rejeitado pelo Cliente)
   └──► [CANCELLED] (Cancelado)
```

### 4.2 Entidades e Relacionamentos

```
Client (1) ──────────◄ (N) Budget (1) ──────────◄ (N) BudgetItem (1) ──────────◄ (N) BudgetItemOption
                             │
                             ├─ code: "ORC-2026-001"
                             ├─ subtotal, discountPercent, total
                             ├─ status: DRAFT | SENT | APPROVED | REJECTED
                             └─ validUntil: Date
```

---

## 5. 🖨️ Especificação de Relatório Comercial, Romaneio e Impressão A4

### 5.1 Relatório Comercial (Proposta do Cliente)
- **Cabeçalho Timbrado:** Razão Social, CNPJ, telefone, e-mail da vidraçaria, código do orçamento e data/validade.
- **Dados do Cliente e Obra:** Nome, telefone, CPF/CNPJ e endereço completo da instalação.
- **Tabela de Itens:** Miniatura técnica SVG de cada esquadria, cotas em mm ($L \times A$), área em $m^2$, quantidade, especificações de materiais, puxadores, furação e valor subtotal.
- **Resumo Financeiro:** Subtotal, percentual e valor de desconto aplicado, e valor total líquido.
- **Condições Comerciais & Aceite:** Campo de observações, prazos de entrega/pagamento e linhas para assinatura do cliente e do responsável técnico.

### 5.2 Romaneio de Peças (Oficina)
- **Gabarito de Fabricação:** Desenho SVG ampliado com cotas de corte, indicação de furos e posição de puxadores.
- **Lista de Peças e Insumos:** Tabela com nome de cada insumo, unidade física ($m^2$, $m$, $un$, $par$), quantidade total multiplicada pelo número de esquadrias, tipo/especificação e cor.
- **Observações de Produção:** Instruções especiais para a equipe de corte e montagem.

### 5.3 Regras de Impressão e Exportação PDF (`@media print`)
1. **Ocultação de Chrome:** `aside`, `header`, `nav`, botões de ação e tabs recebem `display: none !important`.
2. **Container Reset:** Remove `overflow: hidden` e alturas fixas de modo a permitir paginação nativa contínua em folhas A4 (`@page { size: A4 portrait; margin: 12mm 10mm 15mm 10mm; }`).
3. **Não-Corte de Elementos (`break-inside: avoid`):**
   - Cada linha `<tr>` de produto ou card de esquadria possui `page-break-inside: avoid !important`.
   - As imagens SVG nunca são seccionadas no meio da página.
   - Cabeçalhos de tabela repetem no início de cada folha (`thead { display: table-header-group; }`).
   - Bloco de totais e assinaturas não se quebram isoladamente.

---

## 6. 🔗 Rastreabilidade e Documentação Relacionada

- [Documento de Requisitos (REQ)](../000-requisitos/REQ-Documento_de_Requisitos.md) — RF-022 a RF-035 (Módulo de Orçamentos) e RF-016 a RF-021 (Catálogo).
- [Regras de Cálculo (RN)](../000-requisitos/RN-Regras_de_Calculo.md) — Fórmulas de $m^2$, metros lineares e composição.
- [Especificação de API REST (API)](API-Especificacao_API_REST.md) — Contratos dos endpoints `/api/produtos`, `/api/clientes` e `/api/orcamentos`.
- [Requisitos Técnicos de Portas e Esquadrias (PDF)](../../requisitos_produto_portas_final.pdf) — Catálogo de tipos de portas e perfis.

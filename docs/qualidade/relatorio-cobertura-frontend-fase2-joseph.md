# Relatório de Garantia da Qualidade (QA) - Fase 2: Elevação de Cobertura de Testes Frontend

**Autor:** Joseph Nichollas (`nichollascavalcante@gmail.com`)  
**Data:** 24 de Setembro de 2026  
**Branch:** `test/cobertura-catalogo-cad-joseph`  
**Base:** `feat/us-11-emitir-orcamento-pdf-via-tecnica-oficina`  
**Stack de Testes:** Vitest v8, `@testing-library/react`, `@testing-library/user-event`, Oxlint  

---

## 1. Sumário Executivo

Este documento consolida as atividades da **Fase 2** de blindagem e expansão da cobertura de testes automatizados do ecossistema Frontend do **AlumiGest**.  
O foco desta fase consistiu em:
1. **Catálogo Geral (`CatalogView.tsx`)**: Cobertura integral das abas de insumos (Vidros, Perfis, Ferragens, Películas), modais de criação/edição por tipo e modal de detalhes.
2. **Mecânica CAD no Builder de Orçamentos**:
   - `HandleConfigSection.tsx`: Vinculação de materiais do catálogo (perfis e ferragens), tipos de puxadores, regras de aplicação (lado, comprimento, orientação) e badges de advertência.
   - `DrillingConfigSection.tsx`: Limites de furação (clamping 0 a 20 furos), botões de atalho rápido (`Sem furos`, `2`, `3`, `4`, `6`), botão de limpeza e tipos de distribuição (`EQUAL`, `CUSTOM_DISTANCE`).
   - `OpeningDirectionSelector.tsx`: Seleção de sentidos de abertura (`OUTSIDE`, `INSIDE`, `CENTER_TO_SIDES`, `LEFT_TO_RIGHT`, `RIGHT_TO_LEFT`) e fallback resiliente de renderização.
3. **Componentes e Utilitários de Apoio**:
   - `Select.tsx`: Validação de acessibilidade, renderização de options, obrigatoriedade (`required`) e exibição de mensagens de erro.
   - `formatters.ts`: Formatação e conversão de moeda BRL (`formatCurrencyInput`, `parseCurrencyString`), peso em kg (`formatWeightInput`, `parseWeightString`), números inteiros e strings em caixa alta.
   - `BudgetsView.tsx`: Propagação e debounce na busca por cliente/código.

---

## 2. Métricas de Cobertura (Vitest v8)

### Comparativo Antes vs. Depois

| Métrica | Fase 1 (PR #325) | Fase 2 (Atual) | Variação |
| :--- | :---: | :---: | :---: |
| **Linhas Totais (Lines)** | 80.55% | **82.35%** | **+1.80%** |
| **Declarações (Statements)** | 77.21% | **79.64%** | **+2.43%** |
| **Ramificações (Branches)** | 62.40% | **65.13%** | **+2.73%** |
| **Funções (Functions)** | 77.01% | **79.72%** | **+2.71%** |
| **Total de Testes Unitários** | 517 | **551** | **+34 novos testes** |
| **Arquivos de Teste** | 68 | **73** | **+5 arquivos** |
| **Taxa de Sucesso (Pass Rate)** | 100% | **100% (551/551)** | **Verde absoluto** |
| **Erros de Lint (Oxlint)** | 0 | **0** | **100% limpo** |

---

## 3. Cobertura Específica por Módulo Focado

| Componente / Módulo | Linhas (%) | Branches (%) | Funções (%) | Status |
| :--- | :---: | :---: | :---: | :---: |
| `CatalogView.tsx` | **100%** | **90.00%** | **100%** | Blindado |
| `HandleConfigSection.tsx` | **100%** | **89.24%** | **100%** | Blindado |
| `DrillingConfigSection.tsx` | **100%** | **94.44%** | **100%** | Blindado |
| `OpeningDirectionSelector.tsx` | **100%** | **100%** | **100%** | Blindado |
| `steps/mechanics` (Subdiretório CAD) | **100%** | **91.72%** | **100%** | Blindado |
| `components/ui/Select.tsx` | **100%** | **100%** | **100%** | Blindado |
| `utils/formatters.ts` | **100%** | **100%** | **100%** | Blindado |

---

## 4. Técnicas ISTQB Aplicadas

1. **Particionamento de Equivalência (EP)**:
   - Quantidades de furos: zero (sem furação), classes válidas (1 a 20) e entradas vazias ou caracteres não numéricos.
   - Formatação monetária e de peso: valores inteiros, fracionários, vazios ou contendo apenas caracteres alfabéticos.
2. **Análise de Valor Limite (BVA)**:
   - Limite inferior de furação (0 furos) e limite superior de furação (20 furos), testando clampeamento para valores $\ge 21$.
   - Quantidade de caracteres máximos suportados pelas máscaras (10 dígitos para moeda, 7 dígitos para peso).
3. **Teste de Transição de Estados**:
   - `CatalogView`: Aba Inativa $\to$ Aba Ativa $\to$ Abertura Modal Tipo $\to$ Submodal Form $\to$ Fechamento $\to$ Retorno.
   - `MaterialDetailsModal` $\to$ Disparo do evento `onEdit` $\to$ Fechamento do detalhe e abertura imediata do formulário preenchido.
4. **Cobertura de Decisão / Ramificação (Branch Coverage)**:
   - Cobertura de todas as opções de direção de abertura (`LEFT_TO_RIGHT`, `RIGHT_TO_LEFT`, `OUTSIDE`, `INSIDE`, `CENTER_TO_SIDES` e valor desconhecido/fallback).
   - Cobertura das restrições de puxador para perfis (`PROFILE_HANDLE`, `BAR_TUBULAR`, etc.) vs. ferragens normais.

---

## 5. Matriz de Rastreabilidade (RTM)

| ID do Caso | Arquivo de Teste | Componente Alvo | Requisito / Comportamento Verificado |
| :--- | :--- | :--- | :--- |
| `RTM-CAT-01` | `CatalogView.test.tsx` | `CatalogView` | Renderização de cabeçalho, filtro, busca e abas |
| `RTM-CAT-02` | `CatalogView.test.tsx` | `CatalogView` | Alternância e propagação de filtros entre abas |
| `RTM-CAT-03` | `CatalogView.test.tsx` | `CatalogView` | Abertura/fechamento dos 4 modais de formulário |
| `RTM-CAT-04` | `CatalogView.test.tsx` | `CatalogView` | Ação de edição e detalhes para Perfis, Películas e Ferragens |
| `RTM-CAD-01` | `HandleConfigSection.test.tsx` | `HandleConfigSection` | Seleção de puxador de catálogo por optgroup (Perfis/Ferragens) |
| `RTM-CAD-02` | `HandleConfigSection.test.tsx` | `HandleConfigSection` | Orientação (horizontal/vertical) e posicionamento |
| `RTM-CAD-03` | `DrillingConfigSection.test.tsx` | `DrillingConfigSection` | Clamping de furos (0-20), atalhos rápidos e botão limpar |
| `RTM-CAD-04` | `DrillingConfigSection.test.tsx` | `DrillingConfigSection` | Seleção de divisão (EQUAL vs CUSTOM_DISTANCE) |
| `RTM-CAD-05` | `OpeningDirectionSelector.test.tsx`| `OpeningDirectionSelector`| Sentidos de abertura e resiliência de fallback |
| `RTM-UI-01` | `Select.test.tsx` | `Select` | Acessibilidade, opções, indicação de obrigatório e erros |
| `RTM-UT-01` | `formatters.test.ts` | `formatters` | Parsing e formatação de moeda, peso e texto |

---

## 6. Conclusão e Próximos Passos

A suíte de testes da Fase 2 foi implementada com 100% de conformidade com os padrões da equipe e arquitetura limpa do repositório AlumiGest.
- Todas as suítes passam sem nenhum erro ou timeout.
- Os linters e verificadores estáticos foram executados com taxa de erro zero.
- Recomenda-se a integração à branch `feat/us-11-emitir-orcamento-pdf-via-tecnica-oficina` para consolidação dos relatórios no SonarCloud.

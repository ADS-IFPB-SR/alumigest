# 🛠️ RRF — Relatório de Resolução de Falha / Bug — QA-06 / Issue #345

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçarias e Serralherias de Alumínio |
| **Documento** | Relatório de Resolução de Defeito (RRF) — Issue #345 |
| **Demanda / Issue** | [Issue #345](https://github.com/ADS-IFPB-SR/alumigest/issues/345) — `[BUG] [US-11.2] Cota e rótulo do puxador cortados na margem lateral do esquema técnico de usinagem` |
| **User Story Pai** | [Issue #135](https://github.com/ADS-IFPB-SR/alumigest/issues/135) — `US-11: Emitir Orçamento em PDF - Via Técnica de Oficina` |
| **Sub-task Vinculada** | [Issue #296](https://github.com/ADS-IFPB-SR/alumigest/issues/296) — `US-11.2: Esquema cotado de usinagem e puxadores` |
| **Sprint** | 05 — Integração End-to-End, Fechamento de Orçamentos e Exportação PDF |
| **Branch de Trabalho** | `fix/345-cota-rotulo-puxador-cortados` |
| **Data de Resolução** | 29/09/2026 |
| **Responsável Técnico** | Equipe de Engenharia e QA AlumiGest |
| **Status** | 🟢 **CONCLUÍDO E VALIDADO** (95 testes do módulo PDF aprovados, 0 regressões, Checkstyle 100% OK) |

---

## 1. 🎯 Contexto e Sintomas Relatados

Durante a homologação técnica da **Ficha Técnica de Oficina (US-11.2)**, constatou-se uma falha de layout e extrapolação geométrica no canvas de usinagem:

1. **Extrapolação e Truncamento de Legenda:**  
   No esquema técnico de usinagem e corte da Ficha Técnica (renderizado na coluna de usinagem do PDF), o texto contendo a identificação e a cota do puxador (ex.: `Puxador (600mm)` ou `Puxador (250mm)`) ficava colado na margem direita ou ultrapassava os limites do canvas de 126 pt, ficando parcialmente coberto pela linha de contorno da tabela ou truncado.
2. **Impacto Visual e Operacional:**  
   Em esquadrias onde o puxador se posiciona na borda lateral direita da esquadria, o cálculo de coordenadas horizontais somava o offset da moldura e da folha (`startX + drawW + 3.5f`), projetando o texto e a máscara de proteção para além da largura total disponível da célula.
3. **Legibilidade no Chão de Fábrica:**  
   O serralheiro de esquadrias necessita da leitura inequívoca do tamanho do puxador a ser usinado e furado no perfil, de modo que nenhum caractere numérico ou unidade de medida (`mm`) pode ser cortado pela grade da tabela.

---

## 2. 🔍 Causa Raiz Técnica

1. **Ausência de Clamping Geométrico no Helper de Desenho:**  
   No método [`desenharRotuloPuxadorComMascara`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/pdf/BudgetPdfDrawingHelper.java), as coordenadas `boxX` e `textX` eram calculadas unicamente em função da posição do puxador (`puxadorX`), sem considerar a largura total do canvas (`totalWidth = 126f`) nem as margens mínimas de segurança (`minX = 1.5f`, `maxX = totalWidth - 1.5f`).
2. **Espaçamento e Quebra de Linha Subótima:**  
   Quando o texto era extenso (ex.: `Puxador (600mm)`), o tamanho da fonte fixo (`5.5f`) e a ausência de quebra inteligente entre o tipo de componente e sua dimensão entre parênteses causavam largura superior à folga lateral remanescente entre a esquadria e a borda da tabela.

---

## 3. ⚙️ Alterações Implementadas

| Arquivo Modificado | Linhas Principais | Descrição da Solução |
|---|---|---|
| [`BudgetPdfDrawingHelper.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/pdf/BudgetPdfDrawingHelper.java) | L210–L240, L290–L380 | 1. Propagado `totalWidth` para `desenharRotuloPuxadorComMascara`.<br>2. Implementado método auxiliar `ajustarCoordenadasParaLimites(boxX, boxW, textX, totalWidth)` que garante clamping estrito nos limites `[1.5f, totalWidth - 1.5f]`, deslocando a pílula de fundo e o texto conjuntamente.<br>3. Modularização em `renderizarRotuloLinhaUnica` e `renderizarRotuloDuasLinhas` para manter complexidade cognitiva baixa (Clean as You Code / SonarQube compliant).<br>4. Quebra inteligente preferencial no delimitador `" ("` e auto-escalonamento de fonte de `5.5f` para até `4.8f` em caso de margem crítica. |
| [`BudgetPdfDrawingHelperTest.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/test/java/br/edu/ifpb/alumigest/budgets/service/pdf/BudgetPdfDrawingHelperTest.java) | L140–L185 | Adicionados testes unitários específicos: `deveDesenharPuxadorExtensoSemEstouroCanvas()` e `deveDesenharPuxadorEsquerdaEDireitaComClamping()`, validando ausência de exceções e integridade de renderização em diferentes posições extremas. |
| [`BudgetEndToEndIntegrationTest.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/test/java/br/edu/ifpb/alumigest/budgets/BudgetEndToEndIntegrationTest.java) | L690–L725 | Atualizado teste integrado E2E com Item 02 configurado com puxador longo de 600mm (`Puxador (600mm)`), validando o fluxo completo de geração do documento PDF e exportação de amostra. |

---

## 4. 🧪 Cobertura e Resultados dos Testes Automatizados

Comandos de validação executados:
```bash
./mvnw.cmd test -Dtest=BudgetPdfDrawingHelperTest,BudgetEndToEndIntegrationTest
./mvnw.cmd checkstyle:check test-compile
```

**Resultado Consolidado:**
- **95 testes automatizados executados na suíte de PDF e E2E**
- **0 falhas / 0 erros**
- **0 violações de Checkstyle**
- **100% de sucesso** em compilação e execução

---

## 5. 📷 Evidência Visual

A evidência visual em alta resolução (300 DPI) foi gerada e registrada no repositório:
- **Caminho:** [`docs/projeto-001/003-teste/sprint-05/evidencias/evidencia-fix-345-ficha-tecnica.png`](file:///c:/Users/italo/Desktop/Projects/alumigest/docs/projeto-001/003-teste/sprint-05/evidencias/evidencia-fix-345-ficha-tecnica.png)

A imagem comprova:
1. **Contenção Estrita nas Margens:** O rótulo `Puxador (600mm)` no Item 02 está completamente contido dentro do canvas de usinagem, com margem de segurança de mais de 5 pt em relação à borda da tabela.
2. **Sem Cortes ou Sobreposições:** O fundo opaco arredondado (*pill background*) e o texto preservam legibilidade cristalina sem sofrer corte ou fatiamento pela linha perimetral da célula.
3. **Padronização em Milímetros:** Dimensões expressas estritamente em milímetros (`mm`), conforme ABNT NBR 10821 e diretrizes fabris do AlumiGest.

---

*Documento homologado pela Equipe de Engenharia e QA — AlumiGest — Setembro/2026*

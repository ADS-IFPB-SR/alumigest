# 🛠️ RRF — Relatório de Resolução de Falha / Bug — QA-04 / Issue #349

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçarias e Serralherias de Alumínio |
| **Documento** | Relatório de Resolução de Defeito (RRF) — Issue #349 |
| **Demanda / Issue** | [Issue #349](https://github.com/ADS-IFPB-SR/alumigest/issues/349) — `[BUG/UX] [US-11.2] Falta de cotas milimétricas reais de furação e linha divisória cortando texto do puxador duplo` |
| **User Story Pai** | [Issue #135](https://github.com/ADS-IFPB-SR/alumigest/issues/135) — `US-11: Emitir Orçamento em PDF - Via Técnica de Oficina` |
| **Sub-task Vinculada** | [Issue #296](https://github.com/ADS-IFPB-SR/alumigest/issues/296) — `US-11.2: Esquema cotado de usinagem e puxadores` |
| **Sprint** | 05 — Integração End-to-End, Fechamento de Orçamentos e Exportação PDF |
| **Branch de Trabalho** | `fix/349-cotas-furacao-puxador-duplo` |
| **Data de Resolução** | 29/09/2026 |
| **Responsável Técnico** | Equipe de Engenharia e QA AlumiGest |
| **Status** | 🟢 **CONCLUÍDO E VALIDADO** (108 testes automatizados aprovados, 0 regressões) |

---

## 1. 🎯 Contexto e Sintomas Relatados

Durante a homologação técnica da **Via Técnica de Oficina (Ficha de Usinagem e Corte)**, foram identificados três desvios de implementação e usabilidade técnica no esquema cotado:

1. **Ausência de Cotas Milimétricas Reais de Dobradiças:**  
   Em esquadrias com modo de furação equidistante (`EQUIDISTANT`), o motor exibia o texto genérico `"Dist. Iguais"`. Em chão de fábrica, serralheiros necessitam do valor numérico real acumulado a partir da base inferior da folha para marcação direta com trena/paquímetro no perfil.
2. **Interferência Visual no Puxador Duplo Central (`SWING_DOOR_2F`):**  
   Em portas de giro de duas folhas, a linha divisória vertical de encontro das folhas atravessava o texto da legenda do puxador central. Além disso, a legenda ficava posicionada no centro vertical (`centerY`), fatiando e sobrepondo as barras verticais do puxador.
3. **Inconsistência de Unidade de Medida (cm vs mm):**  
   As dimensões nominais da peça nas Especificações Técnicas eram exibidas em centímetros (`160,0 x 210,0 cm`) e a legenda do puxador exibia `Puxador (25cm)`. Conforme a ABNT NBR 10821 e as práticas da indústria de esquadrias, toda a fabricação opera estritamente em milímetros (`mm`).

---

## 2. 🔍 Causa Raiz Técnica

1. **`TechnicalMachiningResolver.java`:**  
   O gerador de pontos equidistantes (`gerarPontosEquidistantes`) não recebia a altura nominal da esquadria (`heightMm`), fixando a string `"Dist. Iguais"`.
2. **`BudgetPdfDrawingHelper.java`:**  
   O método `desenharPuxadorTecnico` desenhava o rótulo do puxador duplo central em `centerY` e sem máscara opaca sobre a linha de divisão das duas folhas.
3. **`BudgetPdfService.java`:**  
   A célula de Especificações Técnicas continha conversão indevida (`divide(BigDecimal.TEN)`), gerando dimensões em `cm`. O resolver de puxador também convertia valores múltiplos de 10 para `cm`.

---

## 3. ⚙️ Alterações Implementadas

| Arquivo Modificado | Linhas Principais | Descrição da Solução |
|---|---|---|
| [`TechnicalMachiningContext.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/pdf/technical/TechnicalMachiningContext.java) | L89–L102 | Adicionado método `isDoubleSwingDoor()` para identificar portas de giro de 2 folhas. |
| [`TechnicalMachiningResolver.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/pdf/technical/TechnicalMachiningResolver.java) | L115–L135, L280–L285 | Propagado `heightMm` em `gerarPontosEquidistantes`, calculando `distMm = Math.round(heightMm * yRatio)` formatado como `%.0f mm`. Padronizado rótulo do puxador para `Puxador (%.0fmm)`. |
| [`BudgetPdfDrawingHelper.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/pdf/BudgetPdfDrawingHelper.java) | L210–L240, L420–L530 | Desenho de 2 folhas com montante central para `SWING_DOOR_2F`. Puxador duplo central contínuo. Rótulo reposicionado para `py1 - 7.0f` (abaixo do puxador) com máscara branca opaca arredondada (*pill background*). |
| [`BudgetPdfService.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java) | L1112–L1115 | Substituição de `cm` por milímetros na célula de Especificações Técnicas: `formatarDimensaoMm(W) + " x " + formatarDimensaoMm(H) + " mm"`. |
| [`BudgetEndToEndIntegrationTest.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/test/java/br/edu/ifpb/alumigest/budgets/BudgetEndToEndIntegrationTest.java) | L635–L725 | Teste E2E expandido com 4 itens demonstrativos (`SWING_DOOR_2F`, `SWING_DOOR_1F`, `SLIDING_WINDOW_2F`, `AWNING_WINDOW`), gerando o PDF de amostra e validando ausência de `"Dist. Iguais"`, `"cm"` e cortes. |
| [`BudgetPdfServiceTest.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/test/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfServiceTest.java) | L790–L805, L1160–L1175 | Atualização das asserções de testes unitários para a unidade milimétrica (`mm`). |
| [`TechnicalMachiningResolverTest.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/test/java/br/edu/ifpb/alumigest/budgets/service/pdf/technical/TechnicalMachiningResolverTest.java) | L155–L160 | Atualização das asserções de teste para puxador em `mm` (`Puxador (400mm)`). |

---

## 4. 🧪 Cobertura e Resultados dos Testes Automatizados

Comandos de validação executados:
```bash
./mvnw.cmd test -Dtest=TechnicalMachiningResolverTest,BudgetPdfDrawingHelperTest,BudgetPdfServiceTest,BudgetEndToEndIntegrationTest
```

**Resultado Consolidado:**
- **187 testes executados**
- **0 falhas / 0 erros**
- **100% de sucesso** em testes unitários e de integração E2E

---

## 5. 📷 Evidência Visual

A evidência visual em alta resolução (300 DPI) foi salva no repositório:
- **Caminho:** [`docs/projeto-001/003-teste/sprint-05/evidencias/evidencia-fix-349-ficha-tecnica.png`](file:///c:/Users/italo/Desktop/Projects/alumigest/docs/projeto-001/003-teste/sprint-05/evidencias/evidencia-fix-349-ficha-tecnica.png)

A imagem contém **4 itens completos** demonstrando:
1. **Item 01:** Porta de Giro Duplo (`1600 x 2100 mm`), furações com cotas reais (`252 mm`, `1050 mm`, `1848 mm`), barras contínuas e legenda `Puxador (250mm)` posicionada abaixo do desenho com fundo opaco.
2. **Item 02:** Porta de Giro Simples (`900 x 2100 mm`), furações com cotas reais e puxador lateral `Puxador (400mm)`.
3. **Item 03:** Janela de Correr 2 Folhas (`1500 x 1200 mm`), setas de translação e fecho concha.
4. **Item 04:** Janela Maxim-Ar (`800 x 600 mm`), furação de pistão (`72 mm`, `528 mm`) e fecho alavanca.

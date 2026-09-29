# 🛠️ RRF — Relatório de Resolução de Falha / Bug — QA-07 / Issue #344

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçarias e Serralherias de Alumínio |
| **Documento** | Relatório de Resolução de Defeito (RRF) — Issue #344 |
| **Demanda / Issue** | [Issue #344](https://github.com/ADS-IFPB-SR/alumigest/issues/344) — `[BUG] [US-11.2] Termos em inglês exibidos no detalhamento de usinagem, puxadores e tipologias do PDF técnico` |
| **User Story Pai** | [Issue #135](https://github.com/ADS-IFPB-SR/alumigest/issues/135) — `US-11: Emitir Orçamento em PDF - Via Técnica de Oficina` |
| **Sub-task Vinculada** | [Issue #296](https://github.com/ADS-IFPB-SR/alumigest/issues/296) — `US-11.2: Esquema cotado de usinagem e puxadores` |
| **Sprint** | 05 — Integração End-to-End, Fechamento de Orçamentos e Exportação PDF |
| **Branch de Trabalho** | `fix/344-termos-ingles-detalhamento-pdf` |
| **Data de Resolução** | 29/09/2026 |
| **Responsável Técnico** | Equipe de Engenharia e QA AlumiGest |
| **Status** | 🟢 **CONCLUÍDO E VALIDADO** (86 testes unitários e 361 testes de budget aprovados, 0 regressões, Checkstyle 100% OK) |

---

## 1. 🎯 Contexto e Sintomas Relatados

Durante a homologação técnica da **Ficha Técnica de Oficina (US-11.2)** e do **PDF Comercial (US-10.8)**, verificou-se a presença de termos brutos em inglês originados de constantes de enum e identificadores de modelo:

1. **Puxadores com Termos em Inglês:**
   - Exibição de `Tipo: TUBULAR` em vez de `Tipo: Tubular`.
   - Exibição de `Tipo: SHELL_LOCK` em vez de `Tipo: Fecho Concha`.
   - Exibição de `Tipo: HANDLE` em vez de `Tipo: Puxador Convencional`.
2. **Posições e Formatos Técnicos:**
   - Exibição de `Posição: RIGHT` em vez de `Posição: Direita`.
   - Exibição de `Posição: BOTH` ou `BOTH_SIDES` em vez de `Posição: Ambos os Lados`.
   - Exibição de `Formato: ROUND` em vez de `Formato: Redondo`.
   - Exibição de `Formato: FLAT` em vez de `Formato: Chato`.
3. **Tipologias com Espaços Não Reconhecidas:**
   - Ao receber entradas como `"AWNING WINDOW"` ou `"SLIDING DOOR"`, o formatador não encontrava match estrito no enum `TemplateType` (que utiliza underscores) e caía no fallback que imprimia `"TIPO: AWNING WINDOW"` ou `"TIPO: SLIDING DOOR"`.
4. **Impacto na Operação Fabril:**
   - A falta de padronização vernácula no chão de fábrica e na via entregue ao cliente contraria as diretrizes de usabilidade e comunicação clara da oficina, podendo gerar dúvidas no momento de separação dos acessórios e puxadores.

---

## 2. 🔍 Causa Raiz Técnica

1. **Divergência de Tratamento entre Strings Simples e JSON:**  
   No PDF Comercial, o método `extrairDescricaoPuxador` apenas parseava como JSON se iniciasse com `{`; se fosse uma string simples (ex.: `"TUBULAR"`), retornava o valor bruto diretamente. Além disso, `resolverDescricaoTipoPuxador` falhava ao invocar `HandleType.valueOf` para termos que não constavam no enum estrito.
2. **Inflexibilidade no Parser de Tipologias:**  
   Em `formatarTipoTemplate` e `extrairTipoFuracaoBadge`, apenas strings com underscore (`_`) eram convertidas; variantes com espaços escapavam para o `default`, gerando rótulos técnicos em inglês não tratados.
3. **Ausência de Mapeamentos Complementares:**  
   Termos frequentes como `BOTH`, `BOTH_SIDES`, `HANDLE`, `CUSTOM`, `CUSTOM_DISTANCES` e `TUBULAR` não estavam contemplados nos switches de tradução de usinagem.

---

## 3. ⚙️ Alterações Implementadas

| Arquivo Modificado | Linhas Principais | Descrição da Solução |
|---|---|---|
| [`BudgetPdfService.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java) | L790–L840, L1260–L1370, L1470–L1610 | 1. Centralizado dicionário de tradução unificado em `traduzirTipoPuxadorTexto`, `traduzirPosicaoTexto`, `traduzirFormatoTexto` e `traduzirDetalhesFuracao`.<br>2. `extrairDescricaoPuxador` e `resolverDescricaoTipoPuxador` agora traduzem termos tanto em JSON quanto em strings simples, suportando chaves flexíveis (`handleType`, `type`, `handle`, `model`).<br>3. `formatarTipoTemplate` e `extrairTipoFuracaoBadge` normalizam entradas com espaços (`AWNING WINDOW` -> `BASCULANTE`, `SLIDING DOOR` -> `CORRER`, `SWING DOOR` -> `GIRO`).<br>4. Suporte completo a posições bilaterais (`BOTH`, `BOTH_SIDES` -> `Ambos os Lados`). |
| [`BudgetPdfServiceTest.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/test/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfServiceTest.java) | L955–L1040 | Adicionado teste unitário `deveTraduzirTermosInglesUsinagemPuxadoresETipologias` validando traduções no PDF Técnico e Comercial, incluindo asserções negativas `doesNotContain` para todos os termos em inglês proibidos. |
| [`BudgetEndToEndIntegrationTest.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/test/java/br/edu/ifpb/alumigest/budgets/BudgetEndToEndIntegrationTest.java) | L800–L830 | Atualizado teste de integração E2E com escrita da amostra PDF `amostra-ficha-tecnica-FIX-344.pdf` e validações completas de ausência de termos em inglês. |

---

## 4. 🧪 Cobertura e Resultados dos Testes Automatizados

Comandos de validação executados:
```bash
./mvnw.cmd checkstyle:check test "-Dtest=BudgetPdfServiceTest,BudgetEndToEndIntegrationTest"
./mvnw.cmd test "-Dtest=*Budget*"
```

**Resultado Consolidado:**
- **86 testes executados** na suíte unitária de PDF (100% sucesso)
- **361 testes executados** na suíte completa de orçamentos (100% sucesso)
- **0 violações de Checkstyle**
- **0 regressões** em relação aos bugs anteriores (BUG-023, BUG-024, BUG-025)

---

## 5. 📷 Evidência Visual

A evidência visual em alta resolução (300 DPI) foi gerada e registrada no repositório:
- **Caminho:** [`docs/projeto-001/003-teste/sprint-05/evidencias/evidencia-fix-344-ficha-tecnica.png`](file:///c:/Users/italo/Desktop/Projects/alumigest/docs/projeto-001/003-teste/sprint-05/evidencias/evidencia-fix-344-ficha-tecnica.png)
- **Amostra PDF:** [`docs/projeto-001/003-teste/sprint-05/amostra-ficha-tecnica-FIX-344.pdf`](file:///c:/Users/italo/Desktop/Projects/alumigest/docs/projeto-001/003-teste/sprint-05/amostra-ficha-tecnica-FIX-344.pdf)

A imagem comprova:
1. **Tipologias Vernáculas:** `TIPO: GIRO (2 FOLHAS)`, `TIPO: GIRO`, `TIPO: CORRER (2 FOLHAS)`, `TIPO: BASCULANTE`.
2. **Puxadores Padronizados:** `Tipo: Tubular`, `Tipo: Fecho Concha`, `Tipo: Alavanca`, `Tipo: Puxador Convencional`.
3. **Posições e Formatos Claros:** `Posição: Direita`, `Posição: Central`, `Posição: Ambos os Lados`, `Formato: Redondo`, `Formato: Chato`.
4. **Furação e Avisos NBR 10821:** Integridade total com os esquemas técnicos de usinagem e cotas milimétricas.

---

*Documento homologado pela Equipe de Engenharia e QA — AlumiGest — Setembro/2026*

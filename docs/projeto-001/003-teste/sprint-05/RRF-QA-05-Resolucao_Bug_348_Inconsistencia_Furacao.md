# 🛠️ RRF — Relatório de Resolução de Falha / Bug — QA-05 / Issue #348

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçarias e Serralherias de Alumínio |
| **Documento** | Relatório de Resolução de Defeito (RRF) — Issue #348 |
| **Demanda / Issue** | [Issue #348](https://github.com/ADS-IFPB-SR/alumigest/issues/348) — `[BUG] [US-11.2] Inconsistência entre texto de furação e desenho técnico na Ficha Técnica (3 furos no texto vs 2 furos no desenho)` |
| **User Story Pai** | [Issue #135](https://github.com/ADS-IFPB-SR/alumigest/issues/135) — `US-11: Emitir Orçamento em PDF - Via Técnica de Oficina` |
| **Sub-task Vinculada** | [Issue #296](https://github.com/ADS-IFPB-SR/alumigest/issues/296) — `US-11.2: Esquema cotado de usinagem e puxadores` |
| **Sprint** | 05 — Integração End-to-End, Fechamento de Orçamentos e Exportação PDF |
| **Branch de Trabalho** | `fix/348-inconsistencia-furacao-ficha-tecnica` |
| **Data de Resolução** | 29/09/2026 |
| **Responsável Técnico** | Equipe de Engenharia e QA AlumiGest |
| **Status** | 🟢 **CONCLUÍDO E VALIDADO** (562 testes automatizados aprovados, 0 regressões, Checkstyle 100% OK) |

---

## 1. 🎯 Contexto e Sintomas Relatados

Durante a auditoria de qualidade e homologação de fábrica da **Ficha Técnica de Oficina (US-11.2)**, constatou-se uma inconsistência crítica para o chão de fábrica na geração da ficha de usinagem:

1. **Divergência entre Texto e Desenho Técnico:**  
   Em esquadrias configuradas com 2 furos de dobradiça (ex: portas de giro ou janelas), o card descritivo de usinagem afirmava fixamente:  
   `"3 furos para dobradiças (10%, 50%, 90% da altura)."`  
   Entretanto, o esquema gráfico desenhado ao lado plotava corretamente apenas **2 furos** com suas cotas milimétricas reais correspondentes.
2. **Risco Operacional de Produção:**  
   A discrepância entre o que o operador lê e o que vê no diagrama técnico gera insegurança na linha de corte e furação, com alto risco de perfuração errônea em perfis de alumínio acabados.
3. **Ausência de Alerta Normativo (ABNT NBR 10821):**  
   Segundo a norma ABNT NBR 10821 (Esquadrias para edificações), portas de giro com altura superior a 1800 mm devem dispor de no mínimo 3 dobradiças para assegurar estanqueidade, estabilidade mecânica e prevenir empenamento da folha. O sistema aceitava 2 dobradiças sem emitir nenhuma sinalização técnica consultiva.

---

## 2. 🔍 Causa Raiz Técnica

1. **`BudgetPdfService.java` (Linhas hardcoded):**  
   O método interno `gerarLinhasFuracao` gerava strings estáticas hardcoded (`"3 furos para dobradiças..."`) sem consultar o objeto [`TechnicalMachiningContext`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/pdf/technical/TechnicalMachiningContext.java), dissociando a descrição textual da lista real de pontos de furação calculada pelo motor gráfico.
2. **`TechnicalMachiningResolver.java` (Parser de atributos):**  
   O parser de usinagem (`resolver`) lia unicamente certas chaves JSON estritas. Payloads salvos no banco com variações de propriedades (ex: `divisionType` ao invés de `drillingMode`, ou `holeCount`/`quantity` ao invés de apenas `count`) não eram normalizados integralmente, resultando em fallbacks desnecessários.
3. **Falta de Validação Normativa Estruturada:**  
   Não existia regra no contexto de usinagem para verificar conformidade com a ABNT NBR 10821 em relação à altura de portas de giro e quantidade de dobradiças.

---

## 3. ⚙️ Alterações Implementadas

| Arquivo Modificado | Linhas Principais | Descrição da Solução |
|---|---|---|
| [`TechnicalMachiningContext.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/pdf/technical/TechnicalMachiningContext.java) | L104–L118 | Adicionados métodos utilitários `isSwingDoor()` e `hasNbr10821Warning()` (retorna `true` se for porta de giro, altura > 1800mm e furação < 3 dobradiças). |
| [`TechnicalMachiningResolver.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/pdf/technical/TechnicalMachiningResolver.java) | L50–L95, L220–L250 | Expandido o parser de furação para reconhecer sinônimos de atributos JSON (`divisionType`, `drillingMode`, `mode`, `holeCount`, `holesCount`, `quantity`, `count`, `holes`) e distâncias configuradas. |
| [`BudgetPdfService.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfService.java) | L1130–L1160, L1200–L1250 | Atualizado `criarCelulaDetalhamentoFuracao` para obter o `TechnicalMachiningContext` e repassá-lo a `gerarLinhasFuracao`. O texto agora reflete dinamicamente a contagem real de furos (`ctx.getPontoFuracaoList().size()`). Quando `ctx.hasNbr10821Warning()` for verdadeiro, adiciona no card de usinagem uma linha com cor vermelha (`#DC2626`): `[!] NBR 10821: Recomendado mín. 3 dobradiças para altura > 1800mm`. |
| [`TechnicalMachiningResolverTest.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/test/java/br/edu/ifpb/alumigest/budgets/service/pdf/technical/TechnicalMachiningResolverTest.java) | L210–L255 | Adicionados testes unitários cobrindo parser flexível (`divisionType`, `holeCount`) e validação da lógica de advertência NBR 10821 para portas de giro > 1800mm com < 3 dobradiças. |
| [`BudgetPdfServiceTest.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/test/java/br/edu/ifpb/alumigest/budgets/service/BudgetPdfServiceTest.java) | L800–L820 | Atualizados testes unitários do PDF garantindo asserção do texto `"2 furos para dobradiças."` e verificação da presença do alerta `NBR 10821`. |
| [`BudgetEndToEndIntegrationTest.java`](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/test/java/br/edu/ifpb/alumigest/budgets/BudgetEndToEndIntegrationTest.java) | L640–L725 | Atualizado teste de integração E2E com orçamento completo, porta de giro duplo de 2100mm com 2 furos configurados, gerando a amostra oficial do PDF. |

---

## 4. 🧪 Cobertura e Resultados dos Testes Automatizados

Comandos de validação executados:
```bash
./mvnw.cmd test -Dtest=TechnicalMachiningResolverTest,BudgetPdfDrawingHelperTest,BudgetPdfServiceTest,BudgetEndToEndIntegrationTest
./mvnw.cmd checkstyle:check test
```

**Resultado Consolidado:**
- **562 testes automatizados executados na suíte global**
- **0 falhas / 0 erros**
- **0 violações de Checkstyle**
- **100% de sucesso** em testes unitários e de integração E2E

---

## 5. 📷 Evidência Visual

A evidência visual em alta resolução (300 DPI) foi gerada e registrada no repositório:
- **Caminho:** [`docs/projeto-001/003-teste/sprint-05/evidencias/evidencia-fix-348-ficha-tecnica.png`](file:///c:/Users/italo/Desktop/Projects/alumigest/docs/projeto-001/003-teste/sprint-05/evidencias/evidencia-fix-348-ficha-tecnica.png)

A imagem comprova:
1. **Sincronia Estrita:** O card de usinagem exibe `"2 furos para dobradiças."` e o desenho gráfico apresenta exatamente **2 furos** com suas cotas milimétricas reais.
2. **Alerta NBR 10821 em Destaque:** Exibição da advertência em vermelho ao final do card de usinagem:  
   `[!] NBR 10821: Recomendado mín. 3 dobradiças para altura > 1800mm`
3. **Respeito à Decisão do Usuário:** O sistema não alterou nem forçou furos extras no desenho nem no texto, preservando a autonomia do projetista enquanto informa a recomendação normativa.

---

*Documento homologado pela Equipe de Engenharia e QA — AlumiGest — Setembro/2026*

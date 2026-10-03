# 📝 ATA DE REUNIÃO DE SPRINT REVIEW & RETROSPECTIVA (SPRINT 05)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Data:** 28 de Setembro de 2026 (Segunda-feira) | **Horário:** 19:30 às 21:30  
**Local:** Reunião Virtual (Google Meet)  
**Redator:** Italo Jefferson Lima dos Santos — Tech Lead  
**Governança:** Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`)

---

## 1. 👥 Participantes e Quórum

### Presentes:
* **Italo Jefferson Lima dos Santos** — *Tech Lead & Engenheiro de Software*
* **José Guylherme dos Santos Melo** — *Product Owner (PO) & Representante da Alumiportas*
* **Joseph Nichollas Abreu Cavalcante** — *Desenvolvedor Backend & DevOps*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor Frontend*
* **Maylson da Silva Rodrigues** — *Desenvolvedor Backend*
* **Júlio Kennedy dos Santos Silva** — *Desenvolvedor Backend*
* **Herbert Carvalho dos Santos** — *QA & Testes Automatizados*
* **Gabriel de Souza Nascimento** — *Desenvolvedor Frontend*
* **Professor Orientador da Disciplina** — *Avaliador Acadêmico*

---

## 2. 🎯 Pauta da Reunião

1. Demonstração prática do incremento de software desenvolvido na **Sprint 05** (15/09/2026 a 28/09/2026).
2. Validação da emissão do PDF Comercial timbrado e envio de resumo formatado para o WhatsApp (`US-10 #134`).
3. Validação da emissão da Ficha Técnica de Oficina com motor de usinagem vetorial e sigilo comercial estrito (`US-11 #135`).
4. Demonstração dos refinamentos de persistência de condições de pagamento e tradução de mensagens de status da `US-09 #133` (PR #332).
5. Apresentação das métricas de testes automatizados (1.153 testes unitários e de integração com 100% de sucesso) e homologação E2E (QA-03 e QA-04).
6. Conclusão e homologação oficial da **Release 1 (v1.0.0 / Baseline B-ALG-v0.5.0-S05-01)**.
7. Retrospectiva da equipe (pontos positivos, impedimentos superados e preparação para a Sprint 06).

---

## 3. 🖥️ Demonstração do Produto (Incremento de Software)

### 3.1 Emissão de PDF Comercial e WhatsApp (`US-10 #134` — 100% Concluído)
- Demonstração do download instantâneo do PDF Comercial (`GET /api/budgets/{id}/pdf/comercial`) com cabeçalho oficial da Alumiportas, paginação automática de múltiplas páginas ("Página X de Y") e miniaturas vetoriais das esquadrias.
- Demonstração do modal de envio para o WhatsApp (`WhatsAppSummaryModal.tsx`) com cópia do texto com negritos e emojis para a área de transferência via Clipboard API e abertura direta do WhatsApp Web.

### 3.2 Ficha Técnica de Oficina sob Sigilo Comercial (`US-11 #135` — 100% Concluído)
- Demonstração do download da Ficha Técnica (`GET /api/budgets/{id}/pdf/tecnico`), comprovando a omissão completa de dados financeiros (R$, valores unitários e totais).
- Apresentação do motor gráfico vetorial de usinagem (`TechnicalMachiningResolver`), com furações posicionadas parametricamente no montante oposto ao puxador e cotas nominais milimétricas para corte.
- Validação do checklist de bancada para montadores com nomes completos por extenso (PR #352).

### 3.3 Refinamentos Comerciais e Validação de Status (`US-09 #133` — 100% Concluído)
- Validação da persistência das condições de pagamento e observações comerciais exibidas no card de resumo financeiro.
- Validação das mensagens de erro amigáveis em português na transição de status do orçamento.

### 3.4 Homologação de Qualidade e Pirâmide de Testes
- Apresentação das métricas de testes automatizados:
  - **Backend:** 555 testes passando sem falhas (`BUILD SUCCESS`).
  - **Frontend:** 598 testes em 76 suítes passando sem falhas.
  - **E2E:** Jornadas QA-03 e QA-04 aprovadas.
- Quality Gate do SonarQube aprovado com New Code Coverage $\ge 80\%$, zero bugs e zero vulnerabilidades.

---

## 4. 🔄 Retrospectiva da Sprint 05

### 4.1 O que funcionou bem (Pontos Positivos):
- Excelente cooperação entre backend e frontend no alinhamento de contratos de PDF e WhatsApp.
- O motor vetorial paramétrico OpenPDF entregou um resultado visual de altíssimo nível para o cliente Alumiportas.
- Cobertura de testes expressiva (mais de 1.150 testes automatizados garantindo estabilidade total da esteira).

### 4.2 O que pode ser melhorado:
- Alinhamento prévio sobre encodings de headers HTTP (`Content-Disposition`) evitou retrabalho após a resolução do BUG-343.
- Formalização do merge entre branches de US antes do fechamento para evitar divergências.

### 4.3 Plano de Ação para a Sprint 06:
1. Abrir e aprovar o PR único consolidado da Sprint 05 para a branch `develop`.
2. Efetuar o fechamento formal das issues #134 (US-10) e #135 (US-11) no GitHub.
3. Iniciar o planejamento detalhado da **Sprint 06 (Módulo de Pedidos de Venda - Release 2)**.

# ATA — Reunião de Kickoff com Parceiro Social

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest |
| **Tipo** | Reunião de Kickoff |
| **Data** | 23/07/2026 |
| **Horário** | 14:00 - 15:30 |
| **Local** | Alumiportas — Santa Rita/PB |
| **Versão** | 1.0 |

---

## 1. Participantes

| Nome | Papel | Presente |
|---|---|---|
| Thiago Thasso de Melo | Proprietário da Alumiportas (Patrocinador) | ✅ |
| José Guilherme | Product Owner (PO) | ✅ |
| Nichollas | Gerente de Projeto (LP Sprint 1) | ✅ |
| Italo Santos | Desenvolvedor / Infraestrutura | ✅ |
| Professor Orientador | Orientador Acadêmico | ✅ |

---

## 2. Pauta

1. Apresentação da equipe e do projeto extensionista
2. Entendimento do negócio da Alumiportas
3. Levantamento das dores e necessidades
4. Definição do escopo macro do sistema
5. Alinhamento de expectativas e cronograma
6. Próximos passos

---

## 3. Registro da Reunião

### 3.1 Apresentação e Contexto

A equipe apresentou o projeto extensionista do IFPB (CST em ADS) e explicou o objetivo: desenvolver um sistema web para auxiliar a gestão da Alumiportas. Thiago demonstrou interesse imediato e explicou o funcionamento da empresa.

### 3.2 Entendimento do Negócio

Thiago explicou que a Alumiportas trabalha com:
- **Esquadrias de alumínio:** Portas de correr (2 e 3 folhas), janelas de correr, janelas max-ar, portas de abrir
- **Box de banheiro:** Em vidro temperado com perfis de alumínio
- **Espelhos:** Sob medida com moldura de alumínio
- **Materiais principais:** Vidro (comprado em chapas, cobrado por m²), perfis de alumínio (barras de 3m ou 6m, cobrado por metro linear), ferragens (roldanas, trincos, puxadores, dobradiças)
- **Películas:** Aplicação opcional de películas decorativas ou de proteção solar

### 3.3 Dores Identificadas

Thiago relatou as seguintes dificuldades:

1. **Orçamentos manuais:** Atualmente feitos em papel/planilha Excel, com alto risco de erro no cálculo de materiais. Cada orçamento leva 30-60 minutos.
2. **Fórmulas complexas:** O cálculo de alumínio varia por tipo de produto. Thiago faz de cabeça ou em planilha não padronizada.
3. **Perda de orçamentos:** Sem controle centralizado, orçamentos são perdidos ou não é possível recuperar histórico.
4. **Sem controle de estoque:** Thiago não tem visibilidade do estoque de barras e chapas de vidro. Frequentemente descobre que falta material apenas na hora da produção.
5. **Financeiro informal:** Parcelamentos e cobranças anotados em caderno, sem controle de inadimplência.

### 3.4 Escopo Definido

Após discussão, foram acordados os seguintes módulos:

| Módulo | Prioridade | Release |
|---|---|---|
| Cadastro de materiais (vidros, alumínio, ferragens, películas) | Alta | R1 |
| Motor de orçamentos com cálculo automático | Alta | R1 |
| Geração de PDF de orçamento | Alta | R1 |
| Cadastro de clientes | Alta | R1 |
| Pedidos e conversão de orçamento | Média | R2 |
| Controle de estoque | Média | R2 |
| Financeiro (contas a receber, parcelamentos) | Média | R3 |
| Instalação e OS | Baixa | R3 |

### 3.5 Informações Técnicas Coletadas

- **Tipos de vidro mais usados:** Temperado (6mm, 8mm, 10mm), laminado, comum
- **Cores:** Incolor, fumê, verde, bronze
- **Linhas de alumínio:** Suprema (principal), Max-ar, Standard
- **Barras de alumínio:** Normalmente 6m, algumas de 3m
- **Ferragens por tipo:** Thiago se comprometeu a enviar uma lista detalhada por WhatsApp
- **Área mínima cobrada:** 0,50 m² (padrão do mercado)

### 3.6 Expectativas do Parceiro

- "Quero um sistema simples. Meus funcionários não são da área de tecnologia."
- "O mais importante é o orçamento. Se o orçamento funcionar bem, já resolve 70% dos meus problemas."
- "Preciso poder acessar do celular quando estiver na obra."
- "Não precisa ser bonito demais, precisa ser rápido e funcional."

---

## 4. Decisões Tomadas

| # | Decisão | Responsável |
|---|---|---|
| D01 | O sistema será um PWA (funciona no celular sem app nativo) | Equipe |
| D02 | Prioridade absoluta: motor de orçamentos com cálculo automático | PO |
| D03 | Thiago enviará lista de ferragens e composições por tipo de produto até 30/07 | Thiago |
| D04 | Reunião de validação de fórmulas será realizada na Sprint 2 (Three Amigos) | PO |
| D05 | A equipe apresentará protótipo do módulo de orçamentos até a Sprint 3 | Equipe |

---

## 5. Ações (Action Items)

| # | Ação | Responsável | Prazo | Status |
|---|---|---|---|---|
| A01 | Thiago enviar lista de ferragens por tipo de produto via WhatsApp | Thiago | 30/07/2026 | ✅ Concluído |
| A02 | Equipe elaborar Plano de Projeto (PPJ) e Plano de GC (PGC) | Nichollas + Equipe | 03/08/2026 | ✅ Concluído |
| A03 | PO consolidar Product Backlog com base na reunião | José Guilherme | 03/08/2026 | ✅ Concluído |
| A04 | Agendar próxima reunião com Thiago (Three Amigos - Sprint 2) | José Guilherme | 08/08/2026 | 📋 Pendente |
| A05 | Equipe configurar ambiente de desenvolvimento | Italo | 04/08/2026 | ✅ Concluído |

---

## 6. Próxima Reunião

| Campo | Valor |
|---|---|
| **Tipo** | Three Amigos — Validação de Fórmulas |
| **Data prevista** | 08/08/2026 |
| **Participantes** | Thiago, PO, DEVs responsáveis pelo motor de cálculo |
| **Pauta** | Validar fórmulas de cálculo de vidro, alumínio e ferragens com orçamentos reais |

---

*Ata elaborada por Nichollas — Equipe AlumiGest — Julho/2026*

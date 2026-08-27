# Feature Specification: Sprint 15 — Treinamento dos Usuários Alumiportas, Carga Real e Homologação R3

**Feature**: `012-treinamento-carga-homologacao-r3`
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão (Fechamento da Release 3)
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Esta sprint consolida o ciclo de desenvolvimento das três releases principais do **AlumiGest**, preparando a fábrica e o escritório da **Alumiportas** para a entrada oficial em produção (Go-Live):
1. **Carga Real de Dados e Saneamento**: Inserção dos dados mestres de perfis de alumínio, vidros, acessórios, tabelas de preços e importador de clientes em CSV.
2. **Capacitação e Guias Práticos por Perfil**: Manuais operacionais em PDF e Central de Ajuda contextual para Vendas, Fábrica, Almoxarifado, Financeiro e Campo.
3. **Roteiro de Homologação Ponta a Ponta (E2E Flow)**: Validação integrada de todo o ciclo: Proposta Comercial → Sinal PIX (50%) → Liberação OP com QR Code → Lista de Corte → Baixa no Estoque → Agendamento e Execução de OS Offline com Fotos → Baixa do Saldo Final (50%) → Fechamento de Caixa → DRE.
4. **Fechamento e Certificação da Release 3 (v3.0.0)**: Homologação oficial com critérios de aceitação aprovados pela diretoria.

---

## 2. Histórias de Usuário (User Stories)

### User Story 1 (P1) — Carga Inicial Automatizada e Importador de Clientes 🎯 MVP

**Como** Administrador do Sistema,
**Quero** que a carga de perfis, vidros e estoque inicial seja aplicada automaticamente via migration e poder importar clientes via CSV,
**Para que** o sistema entre em produção com dados 100% reais e sem cadastro manual cansativo.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Carga inicial de catálogo e matérias-primas
  Dado que a migration V16 é executada
  Quando o backend inicializa
  Então o banco é populado com linhas Suprema e Gold, tipos de vidro, perfis de alumínio e saldos de estoque iniciais
  E a importação de uma planilha CSV de clientes cadastra todos os registros válidos
```

---

### User Story 2 (P1) — Roteiro de Homologação Integrada Ponta a Ponta (E2E) 🎯 MVP

**Como** Diretor da Alumiportas e Equipe de Homologação,
**Quero** executar o checklist do fluxo E2E unificado das Releases 1, 2 e 3,
**Para que** tenhamos segurança total de que todas as etapas operacionais funcionam perfeitamente integradas.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Execução do Roteiro E2E com Sucesso
  Dado o início do roteiro de homologação da v3.0.0
  Quando executadas as 10 etapas sequenciais (Orçamento → PIX → Produção → Estoque → Instalação → Finanças → DRE)
  Então todos os passos são concluídos sem erros ou bloqueios
  E os relatórios finais batem exatamente com as ordens geradas
```

---

### User Story 3 (P2) — Guias de Treinamento por Perfil e Central de Ajuda

**Como** Usuário do Sistema (Vendedor, Operador de Fábrica, Almoxarife, Financeiro, Instalador),
**Quero** acessar o Guia Rápido do meu perfil em PDF e consultar a Central de Ajuda contextual no app,
**Para que** eu aprenda rapidamente as rotinas de trabalho.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Consulta ao Guia Rápido
  Dado que um operador de fábrica abre a Central de Ajuda
  Quando ele clica em "Guia do Chão de Fábrica"
  Então o sistema exibe o manual em PDF ilustrado com uso do scanner QR Code e listas de corte
```

---

## 3. Requisitos Funcionais

1. **RF01 - Migration de Carga Real**: Script SQL `V16__seed_initial_production_data.sql` com matérias-primas e preços da Alumiportas.
2. **RF02 - Importador de Clientes em CSV**: Upload de arquivo CSV com validação de CPF/CNPJ e criação em lote.
3. **RF03 - Checklist E2E de Homologação**: Documento executável no `quickstart.md` cobrindo 100% dos fluxos.
4. **RF04 - Central de Ajuda & Onboarding**: Modal com tour rápido e links para download dos Manuais Operacionais em PDF por papel.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Carga Inicial)**: Migrations Flyway / Seeders Automatizados + Importador de Clientes via CSV.
- **Q2 (Roteiro E2E)**: Fluxo End-to-End Unificado cobrindo da proposta ao DRE.
- **Q3 (Guias de Treinamento)**: Guias Rápidos por Papel Operacional (Vendas, Produção, Estoque, Financeiro, Campo) em PDF + Central de Ajuda.
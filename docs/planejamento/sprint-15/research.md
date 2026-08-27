# Research: Sprint 15 — Treinamento, Carga Real e Homologação R3

**Feature**: `012-treinamento-carga-homologacao-r3`
**Date**: 2026-08-27

## R1: Carga de Dados Inicial Idempotente

### Decision: Migration Flyway `V16__seed_initial_production_data.sql` utilizando `INSERT ... ON CONFLICT DO NOTHING`

**Rationale**:
- Garante que a inicialização do banco possa rodar múltiplas vezes em qualquer ambiente de homologação e produção sem gerar duplicidades.
- Popula o catálogo de perfis Suprema/Gold, tipos de vidro, acessórios e preços base.

## R2: Importador de Clientes via CSV

### Decision: Parsing com `BufferedReader` e transação em lote com `@Transactional`

**Rationale**:
- Valida campos obrigatórios (nome, telefone, CPF/CNPJ) e descarta ou reporta linhas com erros de formatação no retorno da API.

## R3: Manuais em PDF de Treinamento

### Decision: OpenPDF gerando manuais formatados com sumário e diagramas

**Rationale**:
- Os manuais ficam disponíveis diretamente na Central de Ajuda do frontend para download em PDF.
# Research: Sprint 7 — Lista de Corte e Ficha Técnica de Montagem (Romaneio de Oficina)

**Feature**: `004-lista-corte-ficha-montagem`  
**Date**: 2026-08-27  
**Updated**: 2026-09-04  

## R1: Estratégia de Dados & Modelagem

### Decision: Reutilização dos snapshots de `Order` e `OrderItem` sem criação de tabelas redundantes

**Rationale**:
- Os dados técnicos congelados necessários para o corte e montagem (largura, altura, cor do perfil, tipo de vidro, abertura, ferragens) já estão armazenados de forma imutável na tabela `order_items`.
- O romaneio de corte e a ficha técnica são projeções agregadas (DTOs) construídas pelo serviço de negócio, eliminando redundâncias e custos de manutenção no banco.

## R2: Geração do PDF de Romaneio de Oficina

### Decision: Documento OpenPDF A4 com grade de conferência física

**Rationale**:
- O OpenPDF gera rapidamente o PDF formatado com linhas horizontais, cabeçalho da Alumiportas, caixas de visto manual `[ ]` e agrupamento por esquadria.
- Layout limpo e contrastante próprio para impressão em papel sulfite comum na fábrica.

## R3: Integração Frontend

### Decision: Componente `CuttingListModal` e `AssemblySheetView` integrados na tela de Pedidos

**Rationale**:
- Na página do pedido (`OrderDetailPage`), o botão "Romaneio de Corte" exibe a tabela consolidada e permite baixar o PDF.
- Na ficha técnica do item, o montador visualiza os detalhes na bancada.

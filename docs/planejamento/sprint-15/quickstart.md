# Quickstart & E2E Acceptance Test Guide: Release 3 (v3.0.0)

**Feature**: `012-treinamento-carga-homologacao-r3`
**Date**: 2026-08-27

---

## 🚀 Roteiro de Homologação Ponta a Ponta (10 Passos E2E)

### Passo 1: Criação de Orçamento (R1 - Sprint 4)
1. Criar orçamento para "Dr. Marcos" contendo 1 Porta de Giro Linha Gold e 2 Janelas 4F Linha Suprema.
2. Aplicar 5% de desconto comercial e selecionar condição "50% Entrada + 50% Entrega".
3. Emitir PDF em 2 vias (Comercial e Oficina).

### Passo 2: Conversão em Pedido & Bloqueio de Preços (R2 - Sprint 5)
1. Aprovar orçamento via "WHATSAPP".
2. Converter em Pedido `PED-2026-0001` com Lock de Preços.

### Passo 3: Cobrança do Sinal de 50% via PIX (R3 - Sprint 9)
1. Clicar em "Gerar PIX" para o Sinal (50%).
2. Escanear QR Code dinâmico ou simular liquidação no dev mock.
3. Constatar atualização automática do status para `SINAL_PAGO` e botão verde "Liberar para Produção".

### Passo 4: Liberação de Produção & OPs com QR Code (R2 - Sprint 6)
1. Liberar pedido para a fábrica.
2. Gerar OPs físicas individuais com etiquetas térmicas QR Code (`OP-2026-0001-01`, `OP-2026-0001-02`, `OP-2026-0001-03`).

### Passo 5: Romaneio de Oficina & Lista de Corte (R2 - Sprint 7)
1. Emitir e imprimir o PDF A4 da Lista de Corte do pedido.
2. Conferir medidas nominais LxA e caixas de checklist `[ ] Cortado` e `[ ] Montado`.

### Passo 6: Baixa no Estoque & Sucata (R2 - Sprint 8)
1. Avançar status das peças no scanner PWA.
2. Verificar reserva automática e baixa definitiva no Kardex de estoque.
3. Registrar 0,5kg de descarte na sucata. Concluir fabricação do pedido.

### Passo 7: Agendamento da Instalação & OS (R3 - Sprint 12)
1. Notar sugestão de abertura de OS no painel de instalações.
2. Agendar para a "Equipe 1" no Turno da Manhã e emitir PDF da OS.

### Passo 8: Execução de Campo Offline & Fotos (R3 - Sprint 14)
1. Abrir o app no celular em modo offline na obra.
2. Concluir instalação, tirar 2 fotos comprimidas e informar recebedor.
3. Reconectar e validar sincronização automática em segundo plano.

### Passo 9: Baixa do Saldo Final (50%) & Fechamento de Caixa (R3 - Sprints 10 e 11)
1. Localizar o título de Saldo Final no painel de Contas a Receber.
2. Dar baixa manual recebendo em "DINHEIRO". Emitir recibo em PDF.
3. Gerar relatório de Fechamento de Caixa Diário.

### Passo 10: Inteligência Gerencial & DRE (R3 - Sprint 13)
1. Acessar o Dashboard e verificar KPIs atualizados.
2. Abrir o DRE e conferir Receita Bruta, Custos de Materiais e Margem de Contribuição real da venda.

---

## 🎯 Conclusão da Homologação

Se todos os 10 passos forem executados sem bloqueios, a **Release 3 (v3.0.0)** do **AlumiGest** estará oficialmente homologada e pronta para o Go-Live!
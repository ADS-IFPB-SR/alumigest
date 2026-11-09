# [US-47.3] Emissão da Ficha Técnica A4 de Produção com Lista de Corte

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-47.3`
- **US Pai**: `US-47: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas`
- **Release**: Sprint 08
- **Fase**: `Desenvolvimento Fabril / Produção`
- **User Story**: Como encarregado de fábrica/serralheiro, desejo pré-visualizar e imprimir a ficha técnica de corte A4 gerada automaticamente com folgas e ângulos, para eliminar cálculos manuais e desperdícios de matéria-prima.
- **Sub-área**: `Backend & Frontend`
- **Execução Paralela**: ✅ Sim
- **Arquivo / Alvo Principal**: Endpoint de Geração de Ficha, Modal de Pré-visualização na Central 360°
- **Labels Sugeridas**: `feature`, `backend`, `frontend`, `pdf`, `fabricacao`

---

## 🎯 Objetivo & Descrição

Esta tarefa disponibiliza a geração e impressão da Ficha Técnica de Produção Fabril em formato A4 diretamente na Central 360° do Cliente. Ela processa o modelo da esquadria, deduz folgas de vidros e calcula o ângulo de serra dos perfis, entregando o documento mestre que orienta o chão de fábrica da Alumiportas.

### Contexto da Fase / Épico
Calcular descontos de trilhos, graus de corte ($45^\circ$ ou $90^\circ$) e folgas de borrachas manualmente é a maior fonte de retrabalho na oficina. A automação deste documento vinculada à Ordem de Serviço da Central 360° garante precisão industrial.

---

## 🛠️ Checklist de Implementação

- [ ] **Mecanismo Paramétrico de Corte e Folgas (Backend)**:
    - [ ] Implementar regras matemáticas para apurar medidas de corte dos perfis e folgas de vidros baseadas na tipologia da esquadria.
- [ ] **Documento de Ficha Técnica em PDF A4**:
    - [ ] Desenvolver PDF formatado para impressão em alta legibilidade (cabeçalho, lista de corte de alumínio, detalhamento de vidros e acessórios).
- [ ] **Janela Interativa de Pré-visualização (Frontend)**:
    - [ ] Criar modal moderno na Central 360° acionado pelo botão "📋 Ficha Técnica".
    - [ ] Adicionar botões para impressão direta e download do arquivo PDF.
- [ ] **Testes Automatizados de Engenharia**:
    - [ ] Validar comprimentos e ângulos de corte exatos nos modelos de teste.

---

## ✅ Critérios de Aceitação

1. O acionamento do botão "Ficha Técnica" na Central 360° deve abrir a janela de visualização carregando o documento da ordem de serviço selecionada.
2. O documento deve calcular e listar todos os perfis de alumínio com os comprimentos de corte em milímetros e indicação clara do ângulo de serra ($45^\circ$ ou $90^\circ$).
3. As medidas dos vidros devem refletir as deduções de folgas industriais homologadas para o modelo da esquadria.
4. O operador deve conseguir enviar o documento diretamente para a impressora ou realizar o download do arquivo PDF.
5. Caso a ordem de serviço não seja encontrada, o sistema deve apresentar um alerta informativo claro sem travar a interface.

---

## 🔗 Referências & Documentos Relacionados

- 🛠️ **Especificação Técnica Detalhada**: `technical-spec.md` (no mesmo diretório)
- 🖥️ **Protótipo Interativo**: `docs/planejamento/prototipos/painel-clientes-360.html`
- 📑 **Especificação Pai**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)
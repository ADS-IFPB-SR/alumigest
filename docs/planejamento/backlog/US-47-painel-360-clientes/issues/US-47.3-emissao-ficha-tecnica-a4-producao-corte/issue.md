# [US-47.3] Emissão da Ficha Técnica A4 de Produção com Lista de Corte

## 🎯 O que esta tarefa faz?

Esta tarefa disponibiliza a geração e impressão da **Ficha Técnica de Produção Fabril** em formato A4 diretamente na Central 360° do Cliente, entregando o documento mestre que orienta os serralheiros e operadores de máquina no chão de fábrica da Alumiportas.

Na fabricação de esquadrias de alumínio, o serralheiro não pode simplesmente pegar a medida externa da janela (ex.: $1200 \times 1200\text{ mm}$) e cortar os perfis desse tamanho. Cada linha de produto (como Linha Suprema ou Linha 25) exige regras rigorosas de corte: os marcos laterais têm tamanhos específicos, as folhas móveis precisam de descontos para correr nos trilhos, alguns perfis devem ser cortados retos a $90^\circ$ e outros em meia-esquadria a $45^\circ$, e os vidros necessitam de folgas exatas para encaixar nas borrachas e escovas de vedação sem quebrar. Calcular isso manualmente em pedaços de papel na oficina é a maior fonte de erros, retrabalho e desperdício de matéria-prima.

Com esta funcionalidade, o operador clica no botão "📋 Ficha Técnica" de uma ordem de serviço e uma janela interativa se abre com a pré-visualização completa do documento técnico A4. O sistema processa automaticamente o modelo da esquadria e suas medidas, calculando a lista de corte exata de todos os perfis de alumínio (com códigos de fábrica, graus de corte e comprimentos em milímetros), as medidas finais dos vidros com as folgas industriais deduzidas e a relação de componentes de montagem. Dali mesmo, o encarregado pode mandar imprimir diretamente na impressora da oficina ou baixar o PDF para arquivamento.

---

## 📋 O que deve ser entregue?

- [ ] **Mecanismo Paramétrico de Corte e Folgas**: Lógica no servidor que aplica as regras técnicas e fórmulas industriais da esquadria para apurar as medidas exatas de corte dos perfis e folgas de vidros.
- [ ] **Documento de Ficha Técnica em PDF A4**: Folha de fábrica formatada para impressão em alta legibilidade, com cabeçalho institucional, lista completa de corte de alumínio, detalhamento de vidros e lista de acessórios.
- [ ] **Janela Interativa de Pré-visualização**: Modal moderno na Central 360° onde o operador visualiza a ficha técnica antes de imprimir, com botões para impressão direta e download do arquivo.
- [ ] **Testes Automatizados de Engenharia**: Validações de software garantindo que modelos oficiais de portas, janelas e painéis tenham seus comprimentos e ângulos de corte calculados com exatidão matemática.

---

## ✅ Critérios de Aceitação

1. O acionamento do botão "Ficha Técnica" na Central 360° deve abrir a janela de visualização carregando o documento da ordem de serviço selecionada.
2. O documento deve calcular e listar todos os perfis de alumínio com os comprimentos de corte em milímetros e indicação clara do ângulo de serra ($45^\circ$ ou $90^\circ$).
3. As medidas dos vidros devem refletir as deduções de folgas industriais homologadas para o modelo da esquadria.
4. O operador deve conseguir enviar o documento diretamente para a impressora ou realizar o download do arquivo PDF.
5. Caso a ordem de serviço não seja encontrada, o sistema deve apresentar um alerta informativo claro sem travar a interface.

---

## 🔗 Documentos de Apoio e Referências

- 🛠️ **Especificação Técnica Detalhada (BD, Classes e Contratos)**: [technical-spec.md](technical-spec.md)
- 📑 **Especificação Funcional Completa da US-47**: [../../spec.md](../../spec.md)
- 🖥️ **Protótipo Interativo da Central 360° (Modal de Pré-visualização da Ficha Técnica)**: [painel-clientes-360.html](../../../prototipos/painel-clientes-360.html)
- 🏛️ **Constituição e Padrões de Projeto**: [../../../../constitution.md](../../../../constitution.md)

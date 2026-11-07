# Matriz de Casos de Teste e Roteiro de Regressão — US-46: Módulo de Venda Avulsa de Partes

- **User Story:** [US-46: Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas) #477](https://github.com/ADS-IFPB-SR/alumigest/issues/477)
- **Task de Testes:** US-46.6
- **Módulo:** Comercial / Venda Avulsa de Partes (`frontend/src/features/part-sales` & `backend/src/main/java/br/edu/ifpb/alumigest`)
- **Responsáveis:** Equipe de Qualidade e Desenvolvimento (AlumiGest)
- **Versão:** 1.0.0
- **Data:** Novembro/2026

---

## 1. 🎯 Objetivo

Fornecer um roteiro determinístico, auditável e automatizável para validar a integridade de cálculo, regras de negócio industriais e a experiência do usuário na cotação e venda de partes avulsas (vidros em m², perfis de alumínio em metro linear, ferragens por unidade e películas com bobinas), garantindo proteção contra regressões em futuras sprints.

---

## 2. 📋 Regras de Negócio Validadas

- **RN-01 (Venda Desacoplada de Estoque):** A venda opera comercialmente consultando os insumos cadastrados no catálogo de materiais (`tb_materials`). O sistema não bloqueia a proposta por falta de estoque enquanto o módulo de estoque físico não estiver implantado.
- **RN-02 (Piso Mínimo de Vidro):** Peças de vidro com área física inferior a $0,25\text{ m}^2$ são tarifadas compulsoriamente pela fração mínima de $0,25\text{ m}^2$ para cobrir custos de corte, forno e lapidação. Peças maiores são faturadas pela área real proporcional em $\text{m}^2$.
- **RN-03 (Imutabilidade de Valores):** Ao aprovar ou converter a cotação, os preços unitários, fatores de perda e dimensões ficam congelados nos itens da proposta, blindando o cliente contra reajustes posteriores de tabela.
- **RN-04 (Segregação de Responsabilidades):** Toda apuração matemática de áreas, perdas de bobina, cortes de barra e conversões é centralizada no backend (Strategy Pattern), atuando o frontend na validação reativa e exibição limpa.

---

## 3. 🧪 Matriz Detalhada de Casos de Teste

| ID | Cenário / Regra | Tipo | Pré-condição | Passos de Execução | Dados de Entrada | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-46-HP01** | Venda Avulsa de Ferragem Unitária | Caminho Feliz | Ferragem ativa no catálogo (ex: Roldana Dupla 112, R$ 25,00) | 1. Acessar `/venda-avulsa`<br>2. Selecionar cliente<br>3. Categoria "Ferragem"<br>4. Selecionar "Roldana Dupla 112"<br>5. Informar quantidade | Quantidade: `10` un | - Largura e Altura ficam desabilitados/ocultos.<br>- Badge "Cobrança por Unidade".<br>- Subtotal calculado: R$ 250,00 ($10 \times 25$). |
| **TC-46-HP02** | Venda de Perfil de Alumínio em Metro Linear | Caminho Feliz | Perfil ativo no catálogo com taxa de perda configurada (ex: Perfil U Linha Suprema, R$ 35,00/m, perda 5%) | 1. Acessar `/venda-avulsa`<br>2. Categoria "Alumínio"<br>3. Selecionar perfil<br>4. Informar comprimento em mm e quantidade | Comprimento: `2500` mm<br>Barras: `4` | - Campo de largura oculto.<br>- Etiqueta "Metro Linear".<br>- Cálculo considera perda de corte homologada.<br>- Subtotal exibido em tempo real. |
| **TC-46-HP03** | Venda de Vidro acima do Piso Mínimo | Caminho Feliz | Vidro temperado 8mm ativo (R$ 150,00/m²) | 1. Acessar `/venda-avulsa`<br>2. Categoria "Vidro"<br>3. Selecionar vidro temperado<br>4. Informar L e A acima de $0,25\text{ m}^2$<br>5. Informar quantidade | Largura: `1000` mm<br>Altura: `1200` mm<br>Qtd: `2` peças | - Área física: $1,20\text{ m}^2$ por peça ($2,40\text{ m}^2$ total).<br>- Faturamento pela área real proporcional.<br>- Subtotal: R$ 360,00 ($2,40 \times 150$). |
| **TC-46-HP04** | Venda de Película em m² com Perda de Bobina | Caminho Feliz | Película solar ativa (Bobina 1520 mm, R$ 80,00/m², perda 8%) | 1. Acessar `/venda-avulsa`<br>2. Categoria "Película"<br>3. Informar L e A compatíveis com a bobina | Largura: `800` mm<br>Altura: `1500` mm<br>Qtd: `1` peça | - Largura aceita sem aviso de estouro.<br>- Metragem quadrada com fator de perda de bobina aplicado.<br>- Subtotal apurado em tempo real. |
| **TC-46-HP05** | Emissão e Download de Orçamento em PDF A4 | Caminho Feliz | Proposta com itens de pelo menos duas categorias distintas adicionados | 1. Preencher itens de Vidro e Ferragem<br>2. Clicar em "Exportar PDF" | Proposta preenchida | - Documento A4 gerado em menos de 1,5s.<br>- Cabeçalho oficial Alumiportas e dados do cliente.<br>- Agrupamento temático em seções (Vidros, Ferragens).<br>- Categorias vazias (ex: Alumínio) são omitidas. |
| **TC-46-SP01** | Quantidade Zerada ou Negativa | Caminho Triste | Formulário aberto | 1. Selecionar qualquer insumo<br>2. Inserir quantidade `0` ou `-5`<br>3. Tentar adicionar à venda | Quantidade: `0` ou `-1` | - Alerta visual de validação no campo.<br>- Botão de inclusão desabilitado.<br>- Nenhuma requisição enviada ao backend. |
| **TC-46-SP02** | Medidas Dimensionais Zeradas | Caminho Triste | Categoria Vidro ou Alumínio selecionada | 1. Inserir largura `0` mm ou comprimento `0` mm | Largura: `0` mm | - Destaque em vermelho no campo.<br>- Mensagem: "A dimensão mínima é de 1 mm".<br>- Cálculo do subtotal zerado. |
| **TC-46-SP03** | Largura de Película Superior à Bobina | Caminho Triste | Película com bobina de 1520 mm cadastrada | 1. Selecionar película<br>2. Informar largura de `1800` mm | Largura: `1800` mm | - Alerta impeditivo: "Dimensão informada (1800mm) excede a largura máxima da bobina (1520mm)".<br>- Bloqueio de inclusão do item. |
| **TC-46-EC01** | Aplicação Obrigatória do Piso Mínimo de Vidro ($0,25\text{ m}^2$) | Caso de Borda (RN-02) | Vidro de R$ 200,00/m² selecionado | 1. Informar peça de $300 \times 400\text{ mm}$ (Área física real: $0,12\text{ m}^2$)<br>2. Verificar subtotal | $L=300\text{ mm}$, $A=400\text{ mm}$ (Área real: $0,12\text{ m}^2$) | - Sistema aplica compulsoriamente $0,25\text{ m}^2$.<br>- Subtotal faturado: R$ 50,00 ($0,25 \times 200$).<br>- Exibição do badge: "Piso Mínimo Aplicado ($0,25\text{ m}^2$)". |
| **TC-46-EC02** | Imutabilidade e Blindagem contra Reajuste de Tabela | Caso de Borda (RN-03) | Proposta aprovada com item de R$ 100,00 | 1. Aprovar proposta no sistema<br>2. Ir ao Catálogo de Materiais e reajustar o preço para R$ 150,00<br>3. Reabrir a proposta aprovada | Preço reajustado no catálogo | - A proposta aprovada mantém os itens congelados a R$ 100,00.<br>- O reajuste do catálogo não altera vendas históricas. |

---

## 4. 🤖 Roteiro de Automação no Cypress

A suíte automatizada deve residir em:
`frontend/cypress/e2e/part-sales/us46_venda_avulsa_partes.cy.ts`

### Estrutura dos Testes:
```typescript
describe('US-46: Módulo de Venda Avulsa de Partes (Suíte E2E)', () => {
  beforeEach(() => {
    cy.viewport(1366, 768);
    // Intercepts de catálogo de materiais e clientes
  });

  it('TC-46-HP01: Deve cotar ferragens avulsas por unidade inteira', () => { ... });
  it('TC-46-HP02: Deve cotar perfis de alumínio em metro linear com taxa de perda', () => { ... });
  it('TC-46-EC01: Deve aplicar compulsoriamente piso mínimo de 0.25 m² para peças pequenas de vidro', () => { ... });
  it('TC-46-HP04 & SP03: Deve calcular películas solares e validar largura da bobina', () => { ... });
  it('TC-46-HP05: Deve exportar proposta em PDF A4 com seções agrupadas', () => { ... });
  it('TC-46-SP01 & SP02: Deve barrar submissão com quantidades ou medidas inválidas', () => { ... });
});
```

---

## 5. 🔍 Roteiro para Teste Manual de Regressão

1. **Acesso:** Faça login no AlumiGest e acerte a rota `/venda-avulsa` ou use o menu lateral.
2. **Seleção de Cliente:** Escolha um cliente cadastrado (ou consumidor final).
3. **Teste de Vidro Pequeno:** Digite 300 mm de largura e 400 mm de altura. Confirme visualmente se o sistema exibe o aviso de **Piso Mínimo de $0,25\text{ m}^2$**.
4. **Teste de Ferragem:** Troque a categoria para Ferragem, digite 5 unidades e verifique se os inputs de L e A desapareceram.
5. **Geração de PDF:** Clique no botão "Exportar PDF" e verifique se o arquivo gerado abre no leitor de PDF com os dados corretos e sem páginas em branco.

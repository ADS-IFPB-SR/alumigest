# Research: Sprint 4 — Descontos, PDF e Homologação R1

**Feature**: `001-orcamento-descontos-pdf`
**Date**: 2026-08-27

## R1: Geração de PDF no Ecossistema Spring Boot + React

### Decision: Geração server-side com OpenPDF (backend Spring Boot)

**Rationale**:
- OpenPDF é a bifurcação open-source e MIT-licensed do iText 4, sem restrições AGPL.
- O backend já centraliza todas as regras de negócio e cálculos; gerar o PDF no servidor garante que os valores impressos são idênticos aos persistidos (single source of truth).
- O frontend apenas exibe um link/botão de download apontando para o endpoint REST que retorna `application/pdf`.
- A geração server-side é mais segura para a via técnica (oficina), pois não expõe lógica de omissão de valores ao cliente.

**Alternatives Considered**:
- `@react-pdf/renderer` (frontend): Excelente para previews, mas depende de dados trafegados via JSON, duplicando lógica de layout e aumentando risco de inconsistência entre valores do backend e do PDF.
- `pdfmake` (frontend): Mesma limitação acima, mais o bundle size significativo (~2MB).
- `iText 7` (backend): Poderoso, mas licença AGPL incompatível com projetos acadêmicos de código fechado parcial.
- **Conclusão**: OpenPDF no backend é a escolha ideal — zero custo de licença, geração segura e centralizada.

## R2: Precisão Monetária e Arredondamento

### Decision: `BigDecimal` com escala 2 e `RoundingMode.HALF_EVEN` (arredondamento bancário)

**Rationale**:
- O projeto já utiliza `BigDecimal` nas entidades do catálogo de materiais (campo `preco` em `Material.java`).
- `HALF_EVEN` é o padrão ISO para aritmética financeira (evita viés de arredondamento cumulativo).
- Campos de desconto (percentual e valor fixo) e totais líquidos seguem a mesma convenção.

**Alternatives Considered**:
- `double` / `float`: Inaceitável para cálculos monetários por imprecisão IEEE 754.
- `HALF_UP`: Válido, mas produz viés estatístico em agregações.

## R3: Estrutura do Módulo `budgets` no Backend

### Decision: Criar subcamadas dentro do package `br.edu.ifpb.alumigest.budgets` seguindo o padrão Package-by-Feature

**Rationale**:
- O package `budgets` já existe (contém apenas `package-info.java`).
- Segue exatamente o mesmo padrão do feature `catalog`: `controller/`, `service/`, `repository/`, `domain/`, `dto/`, `mapper/`.
- Alinhado com a Constituição do projeto (Princípio I).

## R4: Condições de Pagamento — Modelagem

### Decision: Enum Java `PaymentCondition` com valores predefinidos + campo texto `observacoesPagamento`

**Rationale**:
- As opções de pagamento da Alumiportas são finitas e estáveis (À Vista PIX, 50%+50%, Cartão 12x, A Combinar).
- Um enum é type-safe, evita typos e facilita filtros e relatórios.
- O campo texto livre complementar permite flexibilidade para casos atípicos sem poluir o enum.

**Alternatives Considered**:
- Tabela auxiliar no banco (CRUD de condições): Overhead desnecessário nesta fase; as opções são fixas.
- Apenas texto livre: Sem padronização, dificulta relatórios e filtros.

## R5: Layout e Identidade Visual do PDF Comercial

### Decision: Template estático com cabeçalho institucional embutido no código Java (OpenPDF)

**Rationale**:
- A Alumiportas possui layout simples: logotipo + dados da empresa (endereço, telefone, CNPJ).
- A geração é programática via API do OpenPDF (não há necessidade de template HTML intermediário).
- O logotipo será armazenado como recurso estático em `src/main/resources/static/logo-alumiportas.png`.

## R6: Próxima Versão de Migration Flyway

### Decision: `V8__create_budgets_schema.sql`

**Rationale**:
- A última migration existente é `V7__add_template_fields_to_products.sql`.
- A convenção sequencial Flyway é mantida.
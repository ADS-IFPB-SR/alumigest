## 📌 Tipo de Alteração
- [x] `feat`: Nova funcionalidade
- [ ] `fix`: Correção de bug
- [ ] `docs`: Atualização de documentação
- [ ] `test`: Adição ou ajuste de testes
- [ ] `refactor`: Refatoração de código sem alterar regra de negócio
- [ ] `chore`: Tarefas de build, configuração ou dependências

## 📝 Descrição da Mudança
Implementação da **Issue #30**, disponibilizando as entidades JPA e o Schema inicial de Banco de Dados para Produtos (Esquadrias prontas) e suas respectivas Fichas Técnicas (Itens do Produto).
A arquitetura foi desenhada utilizando relacionamentos bidirecionais (`@OneToMany` e `@ManyToOne`) garantindo a integridade da composição.

🏗️ **O que foi implementado:**
* **Banco de Dados (Flyway):**
  * Script `V2__create_products_schema.sql` contendo a modelagem relacional completa (Constraints e Foreign Keys) para as tabelas `tb_products` e `tb_product_items`.
* **Domínio (br.edu.ifpb.alumigest.catalog.domain):**
  * Classe `Product`: Entidade principal (Root Aggregate) contendo categoria, nome, custo de mão de obra e timestamps.
  * Classe `ProductItem`: Entidade relacional mapeando a quantidade consumida de cada Material.
* **Repositórios (br.edu.ifpb.alumigest.catalog.repository):**
  * Interfaces Spring Data JPA para as duas tabelas (`ProductRepository` e `ProductItemRepository`).
* **Segurança e Encapsulamento:**
  * Uso de métodos auxiliares (`addItem` e `removeItem`) dentro do Produto para orquestrar a sincronização da coleção bidirecional sem expor instabilidades no banco.
  * Omissão do `@EqualsAndHashCode` no Produto para evitar gargalos nas coleções, utilizando apenas no `ProductItem` por ser entidade filha.

## 🔗 Tarefas / Issues Relacionadas
Closes #30
Unblocks #31
Unblocks #32

## ✅ Checklist de Qualidade (Definition of Done - DoD)
- [x] Código aderente ao guia de estilo Java 21 e padronizações da equipe
- [x] Migrations executadas com sucesso sem quebra de integridade no Flyway
- [x] Integração concluída com sucesso (Contexto do Spring Boot subindo perfeitamente)
- [x] Padrão Package-by-Feature respeitado e Build finalizado sem conflitos de MapStruct

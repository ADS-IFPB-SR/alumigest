# 🗃️ Modelo de Dados — Sprint 02

A Sprint 2 implementa as tabelas do catálogo de materiais e produtos através das migrações Flyway V1 a V7:

- `tb_material_groups`: Grupos de materiais (Vidros, Perfis, Ferragens, Películas).
- `tb_materials`: Tabela polimórfica/base de insumos com preço de custo/venda e unidade.
- `tb_glasses`: Detalhes específicos de vidros (espessura mm, cor).
- `tb_aluminum_profiles`: Perfis de alumínio (linha comercial, comprimento barra mm, peso kg/m).
- `tb_hardwares`: Ferragens e acessórios (unidade/par/metro).
- `tb_films`: Películas decorativas e de segurança.
- `tb_product_categories`: Categorias de esquadrias (Portas, Janelas, Box).
- `tb_products`: Produtos e modelos com ficha técnica.
- `tb_product_items`: Insumos pré-definidos na composição do produto.

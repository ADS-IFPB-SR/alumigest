package br.edu.ifpb.alumigest.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Seeder automático para ambiente de teste/demonstração (perfil test / H2 in-memory).
 * Garante que grupos de materiais, insumos de catálogo, produtos configurados e clientes
 * estejam sempre prontos para uso em desenvolvimento local e testes.
 */
@Component
@Profile("test")
public class TestDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(TestDataSeeder.class);

    private final JdbcTemplate jdbcTemplate;

    public TestDataSeeder(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        log.info("Iniciando TestDataSeeder para ambiente de teste...");

        seedMaterialGroups();
        seedMaterials();
        seedProducts();
        seedClients();

        log.info("TestDataSeeder concluído com sucesso!");
    }

    private void seedMaterialGroups() {
        Integer groupCount = jdbcTemplate.queryForObject("SELECT count(*) FROM tb_material_groups", Integer.class);
        if (groupCount != null && groupCount > 0) {
            return;
        }

        log.info("Populando grupos nativos de materiais...");

        jdbcTemplate.update("""
            INSERT INTO tb_material_groups (id, code, name, calculation_type, description, is_system_default, is_active, created_at)
            VALUES 
            (?, 'VIDRO', 'Vidros e Espelhos', 'SQUARE_METER', 'Vidros planos, temperados e laminados calculados por m²', TRUE, TRUE, CURRENT_TIMESTAMP),
            (?, 'ALUMINIO', 'Perfis de Alumínio e Puxadores', 'LINEAR_METER', 'Perfis e puxadores calculados por metro linear', TRUE, TRUE, CURRENT_TIMESTAMP),
            (?, 'PELICULA', 'Películas de Proteção e Acabamento', 'SQUARE_METER', 'Películas decorativas e solares', TRUE, TRUE, CURRENT_TIMESTAMP),
            (?, 'FERRAGEM', 'Ferragens, Componentes e Acessórios', 'UNIT', 'Fechaduras, roldanas e dobradiças', TRUE, TRUE, CURRENT_TIMESTAMP)
        """, UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());
    }

    private void seedMaterials() {
        Integer matCount = jdbcTemplate.queryForObject("SELECT count(*) FROM tb_materials", Integer.class);
        if (matCount != null && matCount > 0) {
            return;
        }

        log.info("Populando catálogo de materiais padrão...");

        UUID vidroGroupId = jdbcTemplate.queryForObject("SELECT id FROM tb_material_groups WHERE code = 'VIDRO'", UUID.class);
        UUID aluminioGroupId = jdbcTemplate.queryForObject("SELECT id FROM tb_material_groups WHERE code = 'ALUMINIO'", UUID.class);
        UUID ferragemGroupId = jdbcTemplate.queryForObject("SELECT id FROM tb_material_groups WHERE code = 'FERRAGEM'", UUID.class);
        UUID peliculaGroupId = jdbcTemplate.queryForObject("SELECT id FROM tb_material_groups WHERE code = 'PELICULA'", UUID.class);

        // 1. Vidros
        insertMaterial(vidroGroupId, "VID-INC-8MM", "VIDRO_INCOLOR", "70071900", "Vidro Incolor 8mm Temperado", 95.0, 190.0, "M2", 8.0, "Incolor", null, "VIDROS", false);
        insertMaterial(vidroGroupId, "VID-FUM-8MM", "VIDRO_FUME", "70071900", "Vidro Fumê 8mm Temperado", 120.0, 240.0, "M2", 8.0, "Fumê / Cinza", null, "VIDROS", false);
        insertMaterial(vidroGroupId, "VID-VER-8MM", "VIDRO_VERDE", "70071900", "Vidro Verde 8mm Temperado", 115.0, 230.0, "M2", 8.0, "Verde", null, "VIDROS", false);
        insertMaterial(vidroGroupId, "VID-REF-8MM", "VIDRO_REFLECTA", "70071900", "Vidro Reflecta Bronze 8mm", 160.0, 320.0, "M2", 8.0, "Reflecta Bronze", null, "VIDROS", false);

        // 2. Perfis de Alumínio
        insertMaterial(aluminioGroupId, "PRF-SUP-BRA", "SU-001", "76042900", "Perfil Linha Suprema Branco", 45.0, 90.0, "METRO", null, "Branco Brilhante", 6.0, "SUPREMA", false);
        insertMaterial(aluminioGroupId, "PRF-SUP-PRE", "SU-002", "76042900", "Perfil Linha Suprema Preto", 48.0, 96.0, "METRO", null, "Preto Fosco", 6.0, "SUPREMA", false);
        insertMaterial(aluminioGroupId, "PRF-SUP-FOS", "SU-003", "76042900", "Perfil Linha Suprema Fosco", 42.0, 85.0, "METRO", null, "Alumínio Fosco / Anodizado", 6.0, "SUPREMA", false);
        insertMaterial(aluminioGroupId, "PRF-SUP-BRO", "SU-004", "76042900", "Perfil Linha Suprema Bronze", 52.0, 105.0, "METRO", null, "Bronze / Champanhe", 6.0, "SUPREMA", false);
        insertMaterial(aluminioGroupId, "PUX-H-40", "PUXADOR_H", "83024100", "Puxador H Tubular Inox 40cm", 35.0, 70.0, "METRO", null, "Cromado / Polido", 0.4, "PUXADORES", true);

        // 3. Ferragens
        insertMaterial(ferragemGroupId, "FEC-CON-01", "FEC-01", "83024100", "Fecho Concha com Trava", 15.0, 32.0, "UN", null, null, null, "FECHOS", false);
        insertMaterial(ferragemGroupId, "ROL-DUP-02", "ROL-02", "83024100", "Roldana Dupla com Rolamento", 12.0, 28.0, "UN", null, null, null, "ROLDANAS", false);
        insertMaterial(ferragemGroupId, "DOB-ALU-03", "DOB-03", "83024100", "Dobradiça de Alumínio 3 Pol", 8.0, 18.0, "UN", null, null, null, "DOBRADICAS", false);

        // 4. Películas
        insertMaterial(peliculaGroupId, "PEL-JAT-01", "PEL-JAT", "39199090", "Película Decorativa Jateada", 18.0, 42.0, "M2", 0.08, "Jateado", 2.5, "PELICULAS", false);
        insertMaterial(peliculaGroupId, "PEL-G5-02", "PEL-G5", "39199090", "Película Solar Fumê G5", 22.0, 48.0, "M2", 0.08, "Fumê", 2.5, "PELICULAS", false);
    }

    private void insertMaterial(UUID groupId, String sku, String ref, String ncm, String name, double cost, double sale,
                                String unit, Double thickness, String color, Double stdLength, String family, boolean isHandle) {
        jdbcTemplate.update("""
            INSERT INTO tb_materials (id, group_id, sku_code, commercial_reference, ncm_code, name, cost_price, sale_price,
                                     unit_measure, thickness_mm, color_finish, standard_length_m, is_active, created_at, updated_at, family_code, is_handle)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)
        """, UUID.randomUUID(), groupId, sku, ref, ncm, name, cost, sale, unit, thickness, color, stdLength, family, isHandle);
    }

    private void seedProducts() {
        String defaultTemplateConfig = """
        {
            "profileMm": 20.0,
            "aluminumColor": "Branco Brilhante",
            "glassColor": "Incolor",
            "slidingMode": "BOTH_SLIDING",
            "openingDirection": "OUTSIDE",
            "handleConfig": {
                "handleType": "BAR_TUBULAR",
                "position": "RIGHT",
                "lengthMm": 400.0,
                "offsetMm": 0.0
            },
            "drillingConfig": {
                "mode": "EQUAL",
                "holesCount": 2,
                "customDistancesMm": []
            },
            "optionSchema": {
                "allowSlidingMode": true,
                "allowedSlidingModes": ["BOTH_SLIDING", "LEFT_FIXED_RIGHT_SLIDING", "RIGHT_FIXED_LEFT_SLIDING"],
                "allowOpeningDirection": true,
                "allowedOpeningDirections": ["LEFT_TO_RIGHT", "RIGHT_TO_LEFT", "OUTSIDE", "INSIDE", "CENTER_TO_SIDES"],
                "allowHandle": true,
                "allowedHandleTypes": ["BAR_TUBULAR", "SHELL_LOCK", "NONE"],
                "allowedHandlePositions": ["RIGHT", "LEFT", "CENTER", "BOTTOM"],
                "allowDrilling": true,
                "allowedDrillingModes": ["EQUAL"],
                "allowAluminumColors": ["Branco Brilhante", "Preto Fosco", "Alumínio Fosco / Anodizado", "Bronze / Champanhe"],
                "allowGlassColors": ["Incolor", "Fumê / Cinza", "Verde", "Reflecta Bronze"]
            }
        }
        """;

        Integer prodCount = jdbcTemplate.queryForObject("SELECT count(*) FROM tb_products", Integer.class);
        if (prodCount != null && prodCount > 0) {
            jdbcTemplate.update("UPDATE tb_products SET template_config = ? WHERE template_config IS NULL", defaultTemplateConfig);
            return;
        }

        log.info("Populando produtos/templates de esquadrias...");

        insertProduct("Porta de Giro 1 Folha", "SWING_DOOR_1F", defaultTemplateConfig);
        insertProduct("Porta de Giro 2 Folhas", "SWING_DOOR_2F", defaultTemplateConfig);
        insertProduct("Porta de Correr 4 Folhas", "SLIDING_DOOR_4F", defaultTemplateConfig);
        insertProduct("Janela de Correr 2 Folhas", "SLIDING_DOOR_2F", defaultTemplateConfig);
        insertProduct("Janela Basculante Maxim-ar", "AWNING_WINDOW_1F", defaultTemplateConfig);
        insertProduct("Janela de Correr 4 Folhas", "SLIDING_WINDOW_4F", defaultTemplateConfig);
        insertProduct("Box de Banheiro Frontal", "SLIDING_DOOR_1F", defaultTemplateConfig);
        insertProduct("Painel Fixo / Fachada", "FIXED_PANEL", defaultTemplateConfig);
        insertProduct("Frente de Gaveta Perfilada", "FRONT_DRAWER", defaultTemplateConfig);
    }

    private void insertProduct(String name, String templateType, String templateConfig) {
        jdbcTemplate.update("""
            INSERT INTO tb_products (id, name, template_type, template_config, category_requirements, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, '["GLASS", "PROFILE"]', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """, UUID.randomUUID(), name, templateType, templateConfig);
    }

    private void seedClients() {
        Integer clientCount = jdbcTemplate.queryForObject("SELECT count(*) FROM tb_clients", Integer.class);
        if (clientCount != null && clientCount > 0) {
            return;
        }

        log.info("Populando clientes padrão para testes de orçamento...");

        jdbcTemplate.update("""
            INSERT INTO tb_clients (id, full_name, person_type, document_number, phone, email, street, number, neighborhood, city, state, zip_code, is_active, created_at, updated_at)
            VALUES 
            (?, 'Arquitetura Pontes', 'JURIDICA', '11222333000144', '83988776655', 'pontes@arquitetura.com', 'Av. Epitácio Pessoa', '1200', 'Tambauzinho', 'João Pessoa', 'PB', '58040000', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (?, 'Vidraçaria Silva', 'JURIDICA', '44555666000177', '83999887766', 'contato@vidracariasilva.com', 'Rua Manoel Gadelha', '45', 'Centro', 'Sousa', 'PB', '58800000', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (?, 'Construtora Horizonte LTDA', 'JURIDICA', '77888999000100', '83981234567', 'horizonte@construtora.com.br', 'Rua das Acácias', '300', 'Bancários', 'João Pessoa', 'PB', '58051000', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """, UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());
    }
}

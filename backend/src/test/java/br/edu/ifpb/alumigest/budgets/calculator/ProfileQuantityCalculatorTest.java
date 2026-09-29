package br.edu.ifpb.alumigest.budgets.calculator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ProfileQuantityCalculatorTest {

    private ProfileQuantityCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new ProfileQuantityCalculator();
    }

    @Test
    @DisplayName("Giro 1 Folha: 2W + 2H")
    void testSwing1Leaf() {
        // W = 800mm (0.8m), H = 2100mm (2.1m)
        // 2 * 0.8 + 2 * 2.1 = 1.6 + 4.2 = 5.80m
        BigDecimal result = calculator.calculate(TemplateType.SWING_1_LEAF, 800, 2100, 1, null);
        assertEquals(new BigDecimal("5.80"), result);
    }

    @Test
    @DisplayName("Giro 2 Folhas: 2W + 4H")
    void testSwing2Leaf() {
        // W = 1600mm (1.6m), H = 2150mm (2.15m) -> Caso de teste real do usuário (11.80m ~ 12m)
        // 2 * 1.6 + 4 * 2.15 = 3.20 + 8.60 = 11.80m
        BigDecimal result1600 = calculator.calculate(TemplateType.SWING_2_LEAF, 1600, 2150, 1, null);
        assertEquals(new BigDecimal("11.80"), result1600);

        // W = 600mm (0.6m), H = 2150mm (2.15m)
        // 2 * 0.6 + 4 * 2.15 = 1.20 + 8.60 = 9.80m
        BigDecimal result600 = calculator.calculate(TemplateType.SWING_2_LEAF, 600, 2150, 1, null);
        assertEquals(new BigDecimal("9.80"), result600);

        // W = 1200mm (1.2m), H = 2100mm (2.1m)
        // 2 * 1.2 + 4 * 2.1 = 2.40 + 8.40 = 10.80m
        BigDecimal result1200 = calculator.calculate(TemplateType.SWING_2_LEAF, 1200, 2100, 1, null);
        assertEquals(new BigDecimal("10.80"), result1200);
    }

    @Test
    @DisplayName("Correr 1 Folha: 2W + 2H")
    void testSliding1Leaf() {
        // W = 1000mm (1.0m), H = 2000mm (2.0m)
        // 2 * 1.0 + 2 * 2.0 = 2.0 + 4.0 = 6.00m
        BigDecimal result = calculator.calculate(TemplateType.SLIDING_1_LEAF, 1000, 2000, 1, null);
        assertEquals(new BigDecimal("6.00"), result);
    }

    @Test
    @DisplayName("Correr 2 Folhas: 2W + 4H")
    void testSliding2Leaf() {
        // W = 1600mm (1.6m), H = 2100mm (2.1m)
        // 2 * 1.6 + 4 * 2.1 = 3.2 + 8.4 = 11.60m
        BigDecimal result = calculator.calculate(TemplateType.SLIDING_2_LEAF, 1600, 2100, 1, null);
        assertEquals(new BigDecimal("11.60"), result);
    }

    @Test
    @DisplayName("Correr 3 Folhas: 2W + 6H")
    void testSliding3Leaf() {
        // W = 2400mm (2.4m), H = 2100mm (2.1m)
        // 2 * 2.4 + 6 * 2.1 = 4.8 + 12.6 = 17.40m
        BigDecimal result = calculator.calculate(TemplateType.SLIDING_3_LEAF, 2400, 2100, 1, null);
        assertEquals(new BigDecimal("17.40"), result);
    }

    @Test
    @DisplayName("Correr 4 Folhas: 2W + 8H")
    void testSliding4Leaf() {
        // W = 3200mm (3.2m), H = 2100mm (2.1m)
        // 2 * 3.2 + 8 * 2.1 = 6.4 + 16.8 = 23.20m
        BigDecimal result = calculator.calculate(TemplateType.SLIDING_4_LEAF, 3200, 2100, 1, null);
        assertEquals(new BigDecimal("23.20"), result);
    }

    @Test
    @DisplayName("Maxim-Ar 1 Folha: 2W + 2H")
    void testMaxAr1Leaf() {
        // W = 600mm (0.6m), H = 600mm (0.6m)
        // 2 * 0.6 + 2 * 0.6 = 1.2 + 1.2 = 2.40m
        BigDecimal result = calculator.calculate(TemplateType.MAX_AR_WINDOW_1_LEAF, 600, 600, 1, null);
        assertEquals(new BigDecimal("2.40"), result);
    }

    @Test
    @DisplayName("Frente de Gaveta e Painel Fixo: Perímetro = 2W + 2H")
    void testDrawerAndFixedPanel() {
        // W = 500mm (0.5m), H = 200mm (0.2m)
        // 2 * (0.5 + 0.2) = 1.40m
        BigDecimal drawer = calculator.calculate(TemplateType.DRAWER_FRONT, 500, 200, 1, null);
        assertEquals(new BigDecimal("1.40"), drawer);

        BigDecimal panel = calculator.calculate(TemplateType.FIXED_PANEL, 1000, 1000, 1, null);
        assertEquals(new BigDecimal("4.00"), panel);
    }

    @Test
    @DisplayName("Multiplicação correta por quantidade de unidades")
    void testMultipleUnitsQuantity() {
        // 3 portas de correr 2 folhas (11.60m cada -> total = 34.80m)
        BigDecimal result = calculator.calculate(TemplateType.SLIDING_2_LEAF, 1600, 2100, 3, null);
        assertEquals(new BigDecimal("34.80"), result);
    }

    @Test
    @DisplayName("Resolução correta a partir de aliases de TemplateType.from")
    void testTemplateTypeFromAliases() {
        assertEquals(TemplateType.SWING_2_LEAF, TemplateType.from("SWING_DOOR_2F"));
        assertEquals(TemplateType.SLIDING_2_LEAF, TemplateType.from("SLIDING_DOOR_2F"));
        assertEquals(TemplateType.SLIDING_3_LEAF, TemplateType.from("SLIDING_DOOR_3F"));
        assertEquals(TemplateType.SLIDING_4_LEAF, TemplateType.from("SLIDING_DOOR_4F"));
        assertEquals(TemplateType.MAX_AR_WINDOW_1_LEAF, TemplateType.from("AWNING_WINDOW_1F"));
        assertEquals(TemplateType.DRAWER_FRONT, TemplateType.from("FRONT_DRAWER"));
    }
}

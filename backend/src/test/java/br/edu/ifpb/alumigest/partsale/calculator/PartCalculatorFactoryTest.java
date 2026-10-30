package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PartCalculatorFactoryTest {

    private PartCalculatorFactory factory;
    private AluminumProfilePartCalculator profileCalculator;

    @BeforeEach
    void setUp() {
        profileCalculator = new AluminumProfilePartCalculator();
        factory = new PartCalculatorFactory(List.of(profileCalculator));
    }

    @Test
    @DisplayName("Deve resolver a calculadora de perfil de alumínio com sucesso")
    void deveResolverCalculadoraDePerfilDeAluminio() {
        PartItemCalculator calculator = factory.getCalculator(MaterialCategoryType.PROFILE);

        assertThat(calculator)
                .isNotNull()
                .isSameAs(profileCalculator);
        assertThat(calculator.getCategory()).isEqualTo(MaterialCategoryType.PROFILE);
    }

    @Test
    @DisplayName("Deve lançar exceção quando a categoria solicitada não tiver calculadora registrada")
    void deveLancarExcecaoQuandoTipoSemCalculadora() {
        assertThatThrownBy(() -> factory.getCalculator(MaterialCategoryType.GLASS))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Calculadora não encontrada para a categoria: GLASS");
    }

    @Test
    @DisplayName("Deve lançar exceção quando a categoria for nula")
    void deveLancarExcecaoQuandoCategoriaNula() {
        assertThatThrownBy(() -> factory.getCalculator(null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("A categoria do material não pode ser nula");
    }
}

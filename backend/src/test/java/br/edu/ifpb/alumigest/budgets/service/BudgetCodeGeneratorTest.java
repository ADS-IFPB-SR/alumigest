package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Year;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BudgetCodeGenerator - Gerador de Códigos Sequenciais Anuais [Joseph Nichollas]")
class BudgetCodeGeneratorTest {

    @Mock
    private BudgetRepository budgetRepository;

    private BudgetCodeGenerator generator;

    @BeforeEach
    void setUp() {
        generator = new BudgetCodeGenerator(budgetRepository);
    }

    @Test
    @DisplayName("Deve gerar primeiro código sequencial 0001 quando não existirem orçamentos no ano atual")
    void generateNextCode_DeveGerarPrimeiroCodigo_QuandoNaoExisteNoAno() {
        int currentYear = Year.now(ZoneOffset.UTC).getValue();
        String prefix = "ORC-" + currentYear + "-";

        when(budgetRepository.findTopByCodeStartingWithOrderByCodeDesc(prefix)).thenReturn(Optional.empty());

        String code = generator.generateNextCode();

        assertThat(code).isEqualTo(prefix + "0001");
        verify(budgetRepository).findTopByCodeStartingWithOrderByCodeDesc(prefix);
    }

    @Test
    @DisplayName("Deve incrementar sequencialmente quando já existir orçamento no ano atual")
    void generateNextCode_DeveIncrementarSequencial_QuandoJaExisteNoAno() {
        int currentYear = Year.now(ZoneOffset.UTC).getValue();
        String prefix = "ORC-" + currentYear + "-";

        Budget lastBudget = new Budget();
        lastBudget.setCode(prefix + "0005");

        when(budgetRepository.findTopByCodeStartingWithOrderByCodeDesc(prefix)).thenReturn(Optional.of(lastBudget));

        String code = generator.generateNextCode();

        assertThat(code).isEqualTo(prefix + "0006");
        verify(budgetRepository).findTopByCodeStartingWithOrderByCodeDesc(prefix);
    }

    @Test
    @DisplayName("Deve tratar corretamente números de três e quatro dígitos (ex: 0999 para 1000)")
    void generateNextCode_DeveTratarTransicaoDeOrdemDeGrandeza() {
        int currentYear = Year.now(ZoneOffset.UTC).getValue();
        String prefix = "ORC-" + currentYear + "-";

        Budget lastBudget = new Budget();
        lastBudget.setCode(prefix + "0999");

        when(budgetRepository.findTopByCodeStartingWithOrderByCodeDesc(prefix)).thenReturn(Optional.of(lastBudget));

        String code = generator.generateNextCode();

        assertThat(code).isEqualTo(prefix + "1000");
    }
}

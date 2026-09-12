package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MaterialControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MaterialRepository repository;

    @InjectMocks
    private MaterialController controller;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Deve retornar lista de famílias distintas com sucesso")
    void getDistinctFamilies_ShouldReturnList() throws Exception {
        when(repository.findDistinctFamilyCodesByGroupCode("VIDRO"))
                .thenReturn(List.of("FAM-VIDRO-TEMP-8MM", "FAM-VIDRO-LAMINADO"));

        mockMvc.perform(get("/api/v1/catalog/materials/families")
                        .param("groupCode", "VIDRO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0]").value("FAM-VIDRO-TEMP-8MM"))
                .andExpect(jsonPath("$.data[1]").value("FAM-VIDRO-LAMINADO"));

        verify(repository).findDistinctFamilyCodesByGroupCode("VIDRO");
    }
}

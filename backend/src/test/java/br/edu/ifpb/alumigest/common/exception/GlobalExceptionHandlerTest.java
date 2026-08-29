package br.edu.ifpb.alumigest.common.exception;

import br.edu.ifpb.alumigest.catalog.controller.ProductCategoryController;
import br.edu.ifpb.alumigest.catalog.dto.ProductCategoryRequestDTO;
import br.edu.ifpb.alumigest.common.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("Testes do GlobalExceptionHandler")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/v1/test");
    }

    @Test
    @DisplayName("Deve tratar ResourceNotFoundException e retornar 404")
    void handleResourceNotFound_ShouldReturn404() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Recurso não encontrado");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleResourceNotFound(ex, request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Recurso não encontrado", response.getBody().message());
        assertEquals("/api/v1/test", response.getBody().path());
    }

    @Test
    @DisplayName("Deve tratar BusinessException e retornar 422")
    void handleBusinessException_ShouldReturn422() {
        BusinessException ex = new BusinessException("Regra de negócio violada");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleBusinessException(ex, request);

        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Regra de negócio violada", response.getBody().message());
    }

    @Test
    @DisplayName("Deve tratar IllegalArgumentException e retornar 400")
    void handleIllegalArgument_ShouldReturn400() {
        IllegalArgumentException ex = new IllegalArgumentException("Argumento inválido");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleIllegalArgument(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Argumento inválido", response.getBody().message());
    }

    @Test
    @DisplayName("Deve tratar DataIntegrityViolationException e retornar 409")
    void handleDataIntegrityViolation_ShouldReturn409() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Duplicidade de chave");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleDataIntegrityViolation(ex, request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().message().contains("Conflito de dados"));
    }

    @Test
    @DisplayName("Deve tratar Exception genérica e retornar 500")
    void handleGeneralException_ShouldReturn500() {
        Exception ex = new RuntimeException("Erro inesperado");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleGeneralException(ex, request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().message().contains("erro interno"));
    }

    @Test
    @DisplayName("Deve tratar MethodArgumentNotValidException e retornar 400 com lista de erros de validação")
    void handleValidationErrors_ShouldReturn400WithValidationList() throws Exception {
        org.springframework.validation.BeanPropertyBindingResult bindingResult =
                new org.springframework.validation.BeanPropertyBindingResult(new Object(), "testObject");
        bindingResult.addError(new FieldError("testObject", "name", "O nome é obrigatório"));

        java.lang.reflect.Method method = ProductCategoryController.class.getMethod("create", ProductCategoryRequestDTO.class);
        org.springframework.core.MethodParameter parameter = new org.springframework.core.MethodParameter(method, 0);

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, bindingResult);

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleValidationErrors(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().validationErrors());
        assertEquals(1, response.getBody().validationErrors().size());
        assertEquals("name", response.getBody().validationErrors().get(0).field());
        assertEquals("O nome é obrigatório", response.getBody().validationErrors().get(0).message());
    }
}

package br.edu.ifpb.alumigest.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        int status,
        String error,
        String message,
        String path,
        LocalDateTime timestamp,
        List<ValidationError> validationErrors
) {
    public record ValidationError(String field, String message) {}

    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(status, error, message, path, LocalDateTime.now(), null);
    }

    public static ErrorResponse ofValidation(int status, String error, String message, String path, List<ValidationError> errors) {
        return new ErrorResponse(status, error, message, path, LocalDateTime.now(), errors);
    }
}

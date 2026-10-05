package br.edu.ifpb.alumigest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

/**
 * Ponto de entrada principal da aplicação AlumiGest Backend.
 * 
 * Projeto de Extensão / Prática Profissional — IFPB Campus Sousa
 * Parceiro Social: Alumiportas
 */
@EnableRetry
@SpringBootApplication
public class AlumiGestApplication {

    public static void main(String[] args) {
        SpringApplication.run(AlumiGestApplication.class, args);
    }
}

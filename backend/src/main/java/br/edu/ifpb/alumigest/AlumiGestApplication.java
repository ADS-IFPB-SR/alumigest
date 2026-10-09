package br.edu.ifpb.alumigest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

/**
 * Ponto de entrada principal da aplicação AlumiGest Backend.
 * 
 * Projeto de Extensão / Prática Profissional — IFPB Campus Sousa
 * Parceiro Social: Alumiportas
 * 
 * O order = 0 no @EnableRetry garante que o interceptor de retry envolva o interceptor
 * de transação (@Transactional), permitindo que falhas de integridade/concorrência
 * abram uma nova transação limpa a cada tentativa de execução.
 */
@EnableRetry(order = 0)
@SpringBootApplication
public class AlumiGestApplication {

    public static void main(String[] args) {
        SpringApplication.run(AlumiGestApplication.class, args);
    }
}

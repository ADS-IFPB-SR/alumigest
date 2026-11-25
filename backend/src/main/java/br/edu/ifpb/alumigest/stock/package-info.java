/**
 * Módulo de Gestão de Estoque, Almoxarifado e Reserva de Matéria-Prima (US-21 e US-22).
 *
 * <p>Responsável pelo controle de saldos físicos e reservados, rastreabilidade Kardex
 * e automação de suprimentos fabris segundo o modelo industrial Make-to-Order (Produção Sob Encomenda).
 *
 * <p>Regras de Negócio Fundamentais:
 * <ul>
 *   <li>RN-01: Invariante Fundamental: available_quantity = physical_quantity - reserved_quantity</li>
 *   <li>RN-02: Atomicidade Transacional em reservas e baixas físicas</li>
 *   <li>RN-03: Impedimento de saldo físico negativo em baixas manuais extraordinárias</li>
 *   <li>RN-04: Diretriz de idioma em inglês técnico para enums, atributos e colunas</li>
 *   <li>RN-05: Reserva não bloqueante no modelo Make-to-Order (available_quantity &lt; 0 sinaliza necessidade de compra)</li>
 * </ul>
 */
package br.edu.ifpb.alumigest.stock;

package br.edu.ifpb.alumigest.clients.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Entidade que representa um cliente no sistema AlumiGest.
 * Suporta Pessoa Física (CPF) e Pessoa Jurídica (CNPJ) com controle via {@link PersonType}.
 */
@Entity
@Table(name = "tb_clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @NotBlank(message = "O nome completo é obrigatório")
    @Size(max = 150, message = "O nome completo deve ter no máximo 150 caracteres")
    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @NotNull(message = "O tipo de pessoa é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(name = "person_type", nullable = false, length = 20)
    private PersonType personType = PersonType.FISICA;

    @Size(max = 20, message = "O documento deve ter no máximo 20 caracteres")
    @Column(name = "document_number", length = 20)
    private String documentNumber;

    @Size(max = 20, message = "O telefone deve ter no máximo 20 caracteres")
    @Column(name = "phone", length = 20)
    private String phone;

    @Size(max = 100, message = "O e-mail deve ter no máximo 100 caracteres")
    @Column(name = "email", length = 100)
    private String email;

    @Size(max = 10, message = "O CEP deve ter no máximo 10 caracteres")
    @Column(name = "zip_code", length = 10)
    private String zipCode;

    @Size(max = 150, message = "O logradouro deve ter no máximo 150 caracteres")
    @Column(name = "street", length = 150)
    private String street;

    @Size(max = 20, message = "O número deve ter no máximo 20 caracteres")
    @Column(name = "number", length = 20)
    private String number;

    @Size(max = 100, message = "O complemento deve ter no máximo 100 caracteres")
    @Column(name = "complement", length = 100)
    private String complement;

    @Size(max = 100, message = "O bairro deve ter no máximo 100 caracteres")
    @Column(name = "neighborhood", length = 100)
    private String neighborhood;

    @Size(max = 100, message = "A cidade deve ter no máximo 100 caracteres")
    @Column(name = "city", length = 100)
    private String city;

    @Size(max = 2, message = "O estado (UF) deve ter no máximo 2 caracteres")
    @Column(name = "state", length = 2)
    private String state;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Client() {
    }

    public Client(String fullName, PersonType personType, String documentNumber, String phone, String email,
                  String zipCode, String street, String number, String complement,
                  String neighborhood, String city, String state, String notes) {
        this.fullName = fullName;
        this.personType = personType != null ? personType : PersonType.FISICA;
        this.documentNumber = documentNumber;
        this.phone = phone;
        this.email = email;
        this.zipCode = zipCode;
        this.street = street;
        this.number = number;
        this.complement = complement;
        this.neighborhood = neighborhood;
        this.city = city;
        this.state = state;
        this.notes = notes;
        this.isActive = true;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // Métodos de Domínio

    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void toggleStatus() {
        this.isActive = !this.isActive;
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public PersonType getPersonType() {
        return personType;
    }

    public void setPersonType(PersonType personType) {
        this.personType = personType;
    }

    public String getDocumentNumber() {
        return documentNumber;
    }

    public void setDocumentNumber(String documentNumber) {
        this.documentNumber = documentNumber;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public String getComplement() {
        return complement;
    }

    public void setComplement(String complement) {
        this.complement = complement;
    }

    public String getNeighborhood() {
        return neighborhood;
    }

    public void setNeighborhood(String neighborhood) {
        this.neighborhood = neighborhood;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Client client)) return false;
        return Objects.equals(id, client.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

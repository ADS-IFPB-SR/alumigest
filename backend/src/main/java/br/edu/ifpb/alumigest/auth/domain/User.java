package br.edu.ifpb.alumigest.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.UUID;

/**
 * Conta de acesso do Operador Único do AlumiGest (US-48).
 *
 * <p>Armazena exclusivamente o hash BCrypt da senha ({@code passwordHash}); a senha em texto puro
 * nunca é mantida na entidade, em DTOs ou em logs (RN-02).
 */
@Entity
@Table(name = "tb_users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @Column(name = "name", nullable = false, length = 150)
  private String name;

  @Column(name = "email", nullable = false, unique = true, length = 150)
  private String email;

  @Column(name = "password_hash", nullable = false, length = 255)
  private String passwordHash;

  @Column(name = "is_active", nullable = false)
  private boolean isActive = true;

  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  protected User() {
    // Construtor padrão exigido pelo JPA
  }

  /**
   * Cria uma conta ativa. O e-mail é normalizado (trim + minúsculas).
   *
   * @param name nome de exibição do operador
   * @param email e-mail de login
   * @param passwordHash hash BCrypt da senha (nunca a senha em texto puro)
   */
  public User(String name, String email, String passwordHash) {
    this.name = requireText(name, "O nome do usuário é obrigatório.");
    this.email = requireText(email, "O e-mail do usuário é obrigatório.")
        .toLowerCase(Locale.ROOT);
    this.passwordHash = requireText(passwordHash, "O hash da senha é obrigatório.");
  }

  @PrePersist
  protected void onCreate() {
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    if (this.createdAt == null) {
      this.createdAt = now;
    }
    this.updatedAt = now;
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  private static String requireText(String value, String message) {
    if (value == null || value.isBlank()) {
      throw new IllegalArgumentException(message);
    }
    return value.trim();
  }

  public UUID getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getEmail() {
    return email;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public boolean isActive() {
    return isActive;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof User other)) {
      return false;
    }
    return id != null && id.equals(other.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}

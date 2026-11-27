package br.edu.ifpb.alumigest.settings.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Objects;
import java.util.UUID;
import org.hibernate.annotations.Check;

/**
 * Entidade singleton que armazena os dados institucionais da empresa no AlumiGest ERP.
 *
 * <p>A unicidade física de um único registro na tabela {@code tb_company_settings} é garantida
 * pelas restrições {@code uk_company_settings_singleton} e {@code singleton_lock = TRUE}.
 */
@Entity
@Table(
    name = "tb_company_settings",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_company_settings_singleton",
            columnNames = "singleton_lock"))
@Check(constraints = "singleton_lock = TRUE")
public class CompanySettings {

  /** Identificador determinístico do registro singleton institucional. */
  public static final UUID SINGLETON_ID =
      UUID.fromString("00000000-0000-0000-0000-000000000001");

  @Id
  @Column(name = "id", nullable = false, updatable = false)
  private UUID id;

  @Column(name = "singleton_lock", nullable = false)
  private boolean singletonLock = true;

  @Column(name = "company_name", nullable = false, length = 150)
  private String companyName;

  @Column(name = "trade_name", nullable = false, length = 150)
  private String tradeName;

  @Column(name = "cnpj", nullable = false, length = 20)
  private String cnpj;

  @Column(name = "state_registration", length = 30)
  private String stateRegistration;

  @Column(name = "phone", nullable = false, length = 25)
  private String phone;

  @Column(name = "email", length = 150)
  private String email;

  @Column(name = "zip_code", length = 12)
  private String zipCode;

  @Column(name = "address", nullable = false, length = 255)
  private String address;

  @Column(name = "city_state", nullable = false, length = 100)
  private String cityState;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  /** Construtor padrão exigido pelo JPA. */
  public CompanySettings() {
    // Construtor padrão exigido pelo JPA
  }

  @PrePersist
  protected void onCreate() {
    if (this.id == null) {
      this.id = SINGLETON_ID;
    }
    this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public boolean isSingletonLock() {
    return singletonLock;
  }

  public void setSingletonLock(boolean singletonLock) {
    this.singletonLock = singletonLock;
  }

  public String getCompanyName() {
    return companyName;
  }

  public void setCompanyName(String companyName) {
    this.companyName = companyName;
  }

  public String getTradeName() {
    return tradeName;
  }

  public void setTradeName(String tradeName) {
    this.tradeName = tradeName;
  }

  public String getCnpj() {
    return cnpj;
  }

  public void setCnpj(String cnpj) {
    this.cnpj = cnpj;
  }

  public String getStateRegistration() {
    return stateRegistration;
  }

  public void setStateRegistration(String stateRegistration) {
    this.stateRegistration = stateRegistration;
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

  public String getAddress() {
    return address;
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public String getCityState() {
    return cityState;
  }

  public void setCityState(String cityState) {
    this.cityState = cityState;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof CompanySettings that)) {
      return false;
    }
    return Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}

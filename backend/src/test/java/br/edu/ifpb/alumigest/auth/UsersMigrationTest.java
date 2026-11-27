package br.edu.ifpb.alumigest.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@DisplayName("Migration V27 [US-48.1] - Schema de usuários e seed BCrypt")
class UsersMigrationTest {

  private static final String MIGRATION = "db/migration/V27__create_users_schema.sql";

  private static final String BCRYPT_REGEX = "\\$2[aby]\\$(\\d{2})\\$[./A-Za-z0-9]{53}";
  private static final Pattern BCRYPT_HASH = Pattern.compile("'" + BCRYPT_REGEX + "'");

  private static String readMigration() throws IOException {
    try (InputStream in = new ClassPathResource(MIGRATION).getInputStream()) {
      return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }
  }

  @Test
  @DisplayName("Deve criar tb_users com as colunas e constraints especificadas")
  void shouldDefineUsersSchema() throws IOException {
    String sql = readMigration();

    assertThat(sql)
        .contains("CREATE TABLE tb_users")
        .contains("id UUID DEFAULT uuid_generate_v4() PRIMARY KEY")
        .contains("name VARCHAR(150) NOT NULL")
        .contains("email VARCHAR(150) NOT NULL")
        .contains("password_hash VARCHAR(255) NOT NULL")
        .contains("is_active BOOLEAN NOT NULL DEFAULT TRUE")
        .contains("created_at TIMESTAMP WITH TIME ZONE NOT NULL")
        .contains("updated_at TIMESTAMP WITH TIME ZONE NOT NULL")
        .contains("CONSTRAINT uk_users_email UNIQUE (email)")
        .contains("CREATE INDEX idx_users_email_active ON tb_users (email, is_active)");
  }

  @Test
  @DisplayName("Deve aplicar V27 sem erros em banco em memória (modo PostgreSQL) e persistir o seed")
  void shouldApplyV27MigrationWithoutErrorsAndSeedOperator() throws Exception {
    String jdbcUrl = "jdbc:h2:mem:v27_migration_test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE";
    try (Connection conn = DriverManager.getConnection(jdbcUrl, "sa", "");
        Statement stmt = conn.createStatement()) {
      stmt.execute("CREATE ALIAS IF NOT EXISTS uuid_generate_v4 FOR 'java.util.UUID.randomUUID'");
      ScriptUtils.executeSqlScript(conn, new ClassPathResource(MIGRATION));

      try (PreparedStatement ps = conn.prepareStatement(
          "SELECT id, name, email, password_hash, is_active, created_at, updated_at "
              + "FROM tb_users WHERE email = ?")) {
        ps.setString(1, "admin@alumigest.com");
        try (ResultSet rs = ps.executeQuery()) {
          assertThat(rs.next()).isTrue();
          assertThat(rs.getObject("id")).isNotNull();
          assertThat(rs.getString("name")).isEqualTo("Operador AlumiGest");
          assertThat(rs.getString("email")).isEqualTo("admin@alumigest.com");
          assertThat(rs.getBoolean("is_active")).isTrue();
          assertThat(rs.getObject("created_at")).isNotNull();
          assertThat(rs.getObject("updated_at")).isNotNull();

          String seededHash = rs.getString("password_hash");
          assertThat(seededHash).matches(BCRYPT_REGEX);
          assertThat(new BCryptPasswordEncoder().matches(UUID.randomUUID().toString(), seededHash))
              .isFalse();
        }
      }
    }
  }

  @Test
  @DisplayName("Deve semear o operador inicial com hash BCrypt válido (custo 10-12)")
  void shouldSeedOperatorWithValidBcryptHash() throws IOException {
    String sql = readMigration();
    Matcher matcher = BCRYPT_HASH.matcher(sql);

    assertThat(matcher.find()).as("hash BCrypt no seed").isTrue();
    String hash = matcher.group(0).replace("'", "");
    int cost = Integer.parseInt(matcher.group(1));

    assertThat(hash).hasSize(60);
    assertThat(cost).isBetween(10, 12);
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    assertThat(encoder.matches(UUID.randomUUID().toString(), hash)).isFalse();

    String randomSample = "sample-" + UUID.randomUUID();
    String encodedSample = encoder.encode(randomSample);
    assertThat(encoder.matches(randomSample, encodedSample)).isTrue();
    assertThat(sql).contains("INSERT INTO tb_users").contains("'admin@alumigest.com'");
  }
}

# Stage 1: Build
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copia arquivo de dependências e fontes
COPY pom.xml .
COPY src ./src

# Compila o projeto gerando o arquivo JAR (sem rodar testes durante o build do container)
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copia o JAR compilado do estágio anterior
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

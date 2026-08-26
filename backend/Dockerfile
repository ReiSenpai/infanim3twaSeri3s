# Etapa 1: Construcción (Build)
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
# Copiamos los archivos necesarios para Maven
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

# Le damos permisos de ejecución al wrapper de Maven y compilamos el JAR
RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests

# Etapa 2: Imagen de Producción (Run)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copiamos solo el JAR generado en la etapa anterior
COPY --from=builder /app/target/*.jar app.jar

# Exponemos el puerto
EXPOSE 8080

# Comando para iniciar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
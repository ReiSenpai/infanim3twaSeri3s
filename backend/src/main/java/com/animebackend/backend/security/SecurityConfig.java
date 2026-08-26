package com.animebackend.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Conecta con nuestro CorsConfig para permitir peticiones del puerto 3000
            .cors(Customizer.withDefaults()) 
            
            // 2. Deshabilita CSRF (Es estándar deshabilitarlo en APIs REST porque no usamos cookies de sesión)
            .csrf(AbstractHttpConfigurer::disable) 
            
            // 3. Configuración de rutas
            .authorizeHttpRequests(auth -> auth
                // Permitimos que la API de lectura sea pública para tu app de Telegram
                .requestMatchers("/api/v1/animes/**").permitAll() 
                // 👇 AGREGA ESTA LÍNEA PARA PERMITIR EL PANEL DE ADMIN TEMPORALMENTE
                .requestMatchers("/api/v1/admin/**").permitAll()
                // Cualquier otra ruta (ej. un futuro panel para agregar animes) requerirá autenticación
                .anyRequest().authenticated() 
            );
        
        return http.build();
    }
}
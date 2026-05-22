package com.albaag.todolistalba.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Público: archivos estáticos del frontend, registro y documentación de la API
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/", "/index.html", "/css/**", "/js/**", "/img/**", "/assets/**", "/favicon.ico").permitAll()
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                // Categorías: cualquier usuario autenticado puede leer; solo ADMIN/GESTOR pueden escribir
                .requestMatchers(HttpMethod.GET, "/categories/**").authenticated()
                .requestMatchers("/categories/**").hasAnyRole("ADMIN", "GESTOR")
                // Usuarios: perfil propio y avatar accesibles para cualquier autenticado; GET de avatar es público (para etiquetas img)
                .requestMatchers(HttpMethod.GET, "/users/me").authenticated()
                .requestMatchers(HttpMethod.PUT, "/users/me").authenticated()
                .requestMatchers(HttpMethod.POST, "/users/me/avatar").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/users/me/avatar").authenticated()
                .requestMatchers(HttpMethod.GET, "/users/*/avatar").permitAll()
                .requestMatchers("/users/*/promote", "/users/*/demote").hasRole("ADMIN")
                .requestMatchers("/users/**").hasRole("ADMIN")
                // Todo lo demás requiere autenticación
                .anyRequest().authenticated()
            )
            .httpBasic(basic -> basic
                .authenticationEntryPoint((req, res, ex) ->
                    res.sendError(HttpServletResponse.SC_UNAUTHORIZED))
            );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

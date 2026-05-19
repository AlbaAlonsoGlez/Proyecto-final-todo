package com.albaag.todolistalba.config;

import com.albaag.todolistalba.model.*;
import com.albaag.todolistalba.repos.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Set;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(UserRepo userRepo, CategoryRepo categoryRepo,
                               TagRepo tagRepo, TaskRepo taskRepo,
                               PasswordEncoder passwordEncoder) {
        return args -> {
            var alba = findOrCreateUser(userRepo, passwordEncoder, "alba", "alba@todolist.com", "Alba", UserRole.ADMIN);
            var bizcocho = findOrCreateUser(userRepo, passwordEncoder, "bizcocho", "bizcocho@todolist.com", "Bizcocho", UserRole.GESTOR);
            var rober = findOrCreateUser(userRepo, passwordEncoder, "rober", "rober@todolist.com", "Rober", UserRole.USER);

            var trabajo = findOrCreateCategory(categoryRepo, "Trabajo", "#2B6CB0", "Tareas relacionadas con el trabajo");
            var personal = findOrCreateCategory(categoryRepo, "Personal", "#883955", "Asuntos personales del día a día");
            var estudios = findOrCreateCategory(categoryRepo, "Estudios", "#6B46C1", "Formación y aprendizaje");
            var hogar = findOrCreateCategory(categoryRepo, "Hogar", "#C05621", "Mantenimiento y organización del hogar");
            var deporte = findOrCreateCategory(categoryRepo, "Deporte", "#2C7A7B", "Actividades físicas y ejercicio");

            var codigo = findOrCreateTag(tagRepo, "Código", "#2B6CB0", "Tareas que implican programación o desarrollo");
            var diseno = findOrCreateTag(tagRepo, "Diseño", "#6B46C1", "Trabajo de diseño visual o de interfaces");
            var reunion = findOrCreateTag(tagRepo, "Reunión", "#B7791F", "Encuentros, llamadas o sesiones de equipo");
            var lectura = findOrCreateTag(tagRepo, "Lectura", "#2C7A7B", "Artículos, documentación o libros por leer");
            var investigacion = findOrCreateTag(tagRepo, "Investigación", "#9B2C2C", "Búsqueda de información y análisis de alternativas");
            var planificacion = findOrCreateTag(tagRepo, "Planificación", "#C05621", "Organización, estimación y seguimiento de tareas");

            if (taskRepo.count() > 0) return;

            var now = LocalDateTime.now();

            // Alba (ADMIN) - 3 tasks
            taskRepo.save(Task.builder()
                    .title("Terminar proyecto intermodular")
                    .description("Terminar la memoria del proyecto intermodular.")
                    .status(TaskStatus.EN_PROGRESO).priority(Priority.URGENTE).important(true)
                    .author(alba).createdAt(now.minusDays(3)).deadline(now.plusDays(2))
                    .categories(Set.of(estudios)).tags(Set.of(codigo, planificacion))
                    .build());

            taskRepo.save(Task.builder()
                    .title("Revisar documentación para el trabajo")
                    .description("Obtener documentación del SEPEPA.")
                    .status(TaskStatus.PENDIENTE).priority(Priority.MEDIA)
                    .author(alba).createdAt(now.minusDays(1)).deadline(now.plusDays(5))
                    .categories(Set.of(trabajo)).tags(Set.of(planificacion))
                    .build());

            taskRepo.save(Task.builder()
                    .title("Partida de rol")
                    .description("Preparar la partida de rol para el nuevo miembro del equipo.")
                    .status(TaskStatus.PENDIENTE).priority(Priority.BAJA)
                    .author(alba).createdAt(now.minusDays(5))
                    .categories(Set.of(personal)).tags(Set.of(lectura, investigacion))
                    .build());

            // Bizcocho (GESTOR) - 3 tasks
            taskRepo.save(Task.builder()
                    .title("Comer calecetines")
                    .description("Comer calcetines de mis dueños.")
                    .status(TaskStatus.COMPLETADA).priority(Priority.ALTA).completed(true)
                    .author(bizcocho).createdAt(now.minusDays(7)).updatedAt(now.minusDays(1))
                    .categories(Set.of(trabajo)).tags(Set.of(planificacion))
                    .build());

            taskRepo.save(Task.builder()
                    .title("Comer toda la comida")
                    .description("Buscar y comer toda la comida de la casa.")
                    .comments("Ignorar mi comida para comer la de mis dueños.")
                    .status(TaskStatus.EN_PROGRESO).priority(Priority.URGENTE).important(true)
                    .author(bizcocho).createdAt(now.minusDays(2)).deadline(now.plusDays(1))
                    .categories(Set.of(trabajo)).tags(Set.of(planificacion, investigacion))
                    .build());

            taskRepo.save(Task.builder()
                    .title("Tirar cosas al suelo")
                    .description("Desordenar la casa y tirar todos los objetos.")
                    .status(TaskStatus.PENDIENTE).priority(Priority.BAJA)
                    .author(bizcocho).createdAt(now)
                    .categories(Set.of(hogar)).tags(Set.of(planificacion))
                    .build());

            // Rober (USER) - 3 tasks
            taskRepo.save(Task.builder()
                    .title("Preparar partido del jueves")
                    .description("Preparar la alineación del partido de fútbol del jueves.")
                    .comments("Poner a Adrián como defensa.")
                    .status(TaskStatus.EN_PROGRESO).priority(Priority.URGENTE).important(true)
                    .author(rober).createdAt(now.minusDays(4)).deadline(now.plusDays(3))
                    .categories(Set.of(deporte)).tags(Set.of(planificacion, diseno))
                    .build());

            taskRepo.save(Task.builder()
                    .title("Entrenar con Daniel")
                    .description("Cita de entrenamiento con Daniel.")
                    .comments("Recordar llevar la botella de agua.")
                    .status(TaskStatus.PENDIENTE).priority(Priority.MEDIA)
                    .author(rober).createdAt(now.minusDays(2)).deadline(now.plusDays(10))
                    .categories(Set.of(deporte)).tags(Set.of(planificacion))
                    .build());

            taskRepo.save(Task.builder()
                    .title("Terminar frontend")
                    .description("Terminar el desarrollo del frontend.")
                    .status(TaskStatus.PENDIENTE).priority(Priority.BAJA)
                    .author(rober).createdAt(now.minusDays(1))
                    .categories(Set.of(trabajo)).tags(Set.of(investigacion, codigo))
                    .build());
        };
    }

    private User findOrCreateUser(UserRepo repo, PasswordEncoder encoder,
                                  String username, String email, String fullname, UserRole role) {
        return repo.findByUsernameOrEmail(username, email).orElseGet(() ->
                repo.save(User.builder()
                        .username(username).email(email).fullname(fullname)
                        .password(encoder.encode(username)).role(role)
                        .build()));
    }

    private Category findOrCreateCategory(CategoryRepo repo, String title, String color, String description) {
        return repo.findByTitle(title).orElseGet(() ->
                repo.save(Category.builder().title(title).color(color).description(description).build()));
    }

    private Tag findOrCreateTag(TagRepo repo, String name, String color, String description) {
        return repo.findByName(name).orElseGet(() ->
                repo.save(Tag.builder().name(name).color(color).description(description).build()));
    }
}

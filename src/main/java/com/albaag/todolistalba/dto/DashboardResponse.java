package com.albaag.todolistalba.dto;

/**
 * DTO de salida con las métricas del panel de control (dashboard).
 * Agrupa contadores de tareas por estado y otros indicadores clave.
 *
 * @param total         Número total de tareas
 * @param pending       Tareas pendientes
 * @param inProgress    Tareas en progreso
 * @param completed     Tareas completadas
 * @param overdue       Tareas vencidas (pasada la fecha límite)
 * @param important     Tareas marcadas como importantes
 * @param highPriority  Tareas con prioridad alta o urgente
 * @param nearDeadline  Tareas próximas a su fecha límite
 * @param categoryCount Número total de categorías
 * @param tagCount      Número total de etiquetas
 */
public record DashboardResponse(
        long total,
        long pending,
        long inProgress,
        long completed,
        long overdue,
        long important,
        long highPriority,
        long nearDeadline,
        long categoryCount,
        long tagCount
) {}

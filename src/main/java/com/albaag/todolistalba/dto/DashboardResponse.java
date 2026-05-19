package com.albaag.todolistalba.dto;

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

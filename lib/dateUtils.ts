export function getTodayISO(): string {
    return new Date().toISOString().split("T")[0];
}

export function getYesterdayISO(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split("T")[0];
}

export function adjustDateISO(dateString: string, days: number): string {
    const date = dateString ? new Date(dateString) : new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
}

export function calculateDurationFromTimes(
    startTime: string,
    endTime: string,
): number {
    if (!startTime || !endTime) return 0;

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes > startMinutes) {
        const durationMinutes = endMinutes - startMinutes;
        return Math.round((durationMinutes / 60) * 2) / 2; // Round to nearest 0.5
    }

    return 0;
}

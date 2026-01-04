// src/lib/date.ts
import { format, parseISO, isValid } from "date-fns";

export function safeFormatDate(value?: string, pattern = "dd/MM/yyyy") {
    if (!value) return "—";
    const date = parseISO(value);
    if (!isValid(date)) return "—";
    return format(date, pattern);
}

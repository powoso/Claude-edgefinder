import { format, formatDistanceToNow } from "date-fns";

export function formatGameDate(date: string | Date): string {
  return format(new Date(date), "EEE, MMM d · h:mm a");
}

export function formatShortDate(date: string | Date): string {
  return format(new Date(date), "MMM d");
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

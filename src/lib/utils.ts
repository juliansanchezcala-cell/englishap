import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseNumber(val: any): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const clean = val.replace(',', '.').replace(/[^\d.-]/g, '');
    return parseFloat(clean) || 0;
  }
  return 0;
}

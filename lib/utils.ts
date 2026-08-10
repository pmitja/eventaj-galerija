import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Združi razrede in razreši konflikte med Tailwind utilityji (zadnji zmaga). */
export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}

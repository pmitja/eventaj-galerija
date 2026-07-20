"use client";

import type { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { sl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import styles from "./ui.module.css";

export function Calendar({ className, locale = sl, ...props }: ComponentProps<typeof DayPicker>) {
  return <DayPicker className={cn(styles.calendar, className)} locale={locale} showOutsideDays {...props} />;
}

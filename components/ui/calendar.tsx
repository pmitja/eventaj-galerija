"use client";

import type { ComponentProps } from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { sl } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function Calendar({ className, classNames, locale = sl, ...props }: ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames();

  return (
    <DayPicker
      className={cn(
        "text-[14px] text-plum [--rdp-accent-background-color:var(--brand-soft)] [--rdp-accent-color:var(--brand)]",
        className,
      )}
      classNames={{
        month_caption: cn(defaults.month_caption, "min-h-10 items-center"),
        caption_label: cn(defaults.caption_label, "text-[15px] font-extrabold"),
        button_previous: cn(defaults.button_previous, "size-10 rounded-[10px]"),
        button_next: cn(defaults.button_next, "size-10 rounded-[10px]"),
        weekday: cn(defaults.weekday, "text-[12px] font-bold text-[#866a76]"),
        day_button: cn(
          defaults.day_button,
          "size-[38px] rounded-[10px] focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-brand/25 sm:size-10",
        ),
        selected: cn(defaults.selected, "[&_button]:font-extrabold"),
        ...classNames,
      }}
      locale={locale}
      showOutsideDays
      {...props}
    />
  );
}

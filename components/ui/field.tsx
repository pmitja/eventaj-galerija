import type { HTMLAttributes, LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./ui.module.css";

export function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn(styles.field, className)} {...props} />; }
export function FieldLabel({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) { return <label className={cn(styles.fieldLabel, className)} {...props} />; }
export function FieldDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p className={cn(styles.fieldDescription, className)} {...props} />; }
export function FieldError({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p className={cn(styles.fieldError, className)} {...props} />; }
export function RequiredMark() { return <span className={styles.required} aria-hidden="true"> *</span>; }

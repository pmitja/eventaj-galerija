import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./ui.module.css";

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn(styles.alert, className)} {...props} />; }
export function Separator({ className, ...props }: HTMLAttributes<HTMLHRElement>) { return <hr className={cn(styles.separator, className)} {...props} />; }

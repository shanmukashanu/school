import * as React from "react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

export type SimpleSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
};

export const SimpleSelect = React.forwardRef<HTMLSelectElement, SimpleSelectProps>(
  ({ className, label, options, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {label ? (
          <label className="text-sm font-medium text-foreground/80">{label}</label>
        ) : null}
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          )}
          {...props}
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
SimpleSelect.displayName = "SimpleSelect";

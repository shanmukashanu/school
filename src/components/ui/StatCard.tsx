import * as React from "react";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  title: string;
  value: number | string;
  color?: string; // e.g., bg-blue-100
  icon?: React.ReactNode;
  className?: string;
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, color = "bg-gray-100", icon, className }) => {
  return (
    <div className={cn("p-6 rounded-xl border border-border/40 bg-background", className)}>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", color)}>
        {icon}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
};

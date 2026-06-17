"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  variant?: "gold" | "electric";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, variant = "gold", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("progress-bar h-2 w-full", className)}
      {...props}
    >
      <div
        className={cn(
          "progress-fill h-full",
          variant === "electric" && "bg-gradient-to-r from-electric-500 to-electric-600"
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
);
Progress.displayName = "Progress";

export { Progress };

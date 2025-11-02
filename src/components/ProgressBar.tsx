import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
  variant?: "primary" | "secondary" | "success";
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ProgressBar = ({ 
  progress, 
  className, 
  variant = "primary", 
  showPercentage = false,
  size = "md"
}: ProgressBarProps) => {
  const variants = {
    primary: "gradient-primary",
    secondary: "gradient-secondary",
    success: "gradient-success",
  };

  const sizes = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="relative">
      <div className={cn(
        "w-full bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm border border-border/30", 
        sizes[size],
        className
      )}>
        {/* Background shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-pulse" />
        
        {/* Progress fill */}
        <div
          className={cn(
            "h-full progress-fill rounded-full relative overflow-hidden",
            variants[variant]
          )}
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Animated shimmer effect on progress */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
        </div>
      </div>
      
      {showPercentage && (
        <div className="absolute -top-6 right-0 text-xs font-medium text-muted-foreground">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
};
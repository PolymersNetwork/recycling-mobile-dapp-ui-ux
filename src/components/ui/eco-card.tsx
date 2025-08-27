import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ecoCardVariants = cva(
  "rounded-2xl border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border hover:shadow-lg hover:shadow-card-shadow/50",
        eco: "bg-gradient-eco text-white border-white/20 hover:shadow-xl hover:shadow-eco-primary/20",
        glass: "bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15",
        elevated: "bg-card shadow-card hover:shadow-eco border-border/50 hover:border-border",
        gradient: "bg-gradient-primary text-white border-white/20 hover:shadow-xl hover:shadow-eco-primary/30",
        success: "bg-gradient-to-br from-eco-success/10 to-eco-success/5 border-eco-success/20 hover:shadow-eco-success/20",
        warning: "bg-gradient-to-br from-eco-warning/10 to-eco-warning/5 border-eco-warning/20 hover:shadow-eco-warning/20",
      },
      padding: {
        none: "",
        xs: "p-2",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      size: "default",
    },
  }
);

export interface EcoCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ecoCardVariants> {
  /** Optional glassmorphism effect */
  glassmorphism?: boolean;
}

const EcoCard = React.forwardRef<HTMLDivElement, EcoCardProps>(
  ({ className, variant, padding, size, glassmorphism, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        ecoCardVariants({ variant, padding, size }),
        glassmorphism && "backdrop-blur-sm bg-white/5",
        className
      )}
      {...props}
    />
  )
);
EcoCard.displayName = "EcoCard";

const EcoCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
));
EcoCardHeader.displayName = "EcoCardHeader";

const EcoCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-display font-semibold leading-none tracking-tight text-lg sm:text-xl", className)}
    {...props}
  />
));
EcoCardTitle.displayName = "EcoCardTitle";

const EcoCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
EcoCardDescription.displayName = "EcoCardDescription";

const EcoCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
EcoCardContent.displayName = "EcoCardContent";

const EcoCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-0", className)}
    {...props}
  />
));
EcoCardFooter.displayName = "EcoCardFooter";

export {
  EcoCard,
  EcoCardHeader,
  EcoCardFooter,
  EcoCardTitle,
  EcoCardDescription,
  EcoCardContent,
};
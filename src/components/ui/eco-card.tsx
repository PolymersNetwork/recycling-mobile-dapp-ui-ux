import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ecoCardVariants = cva(
  "rounded-2xl border transition-all duration-300 hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border hover:shadow-eco-primary/10",
        eco: "bg-gradient-to-br from-eco-primary-light/10 to-eco-primary/5 border-eco-primary/20 hover:shadow-eco-primary/20",
        glass: "bg-white/10 backdrop-blur-md border-white/20 text-white",
        elevated: "bg-card shadow-md hover:shadow-xl border-border/50",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface EcoCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ecoCardVariants> {}

const EcoCard = React.forwardRef<HTMLDivElement, EcoCardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(ecoCardVariants({ variant, padding, className }))}
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
    className={cn("font-semibold leading-none tracking-tight", className)}
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
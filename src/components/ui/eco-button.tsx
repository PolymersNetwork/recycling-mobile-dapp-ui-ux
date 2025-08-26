import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ecoButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        eco: "bg-gradient-to-r from-eco-primary to-eco-success text-white hover:shadow-lg hover:shadow-eco-primary/25 hover:scale-105 active:scale-95",
        "eco-outline": "border-2 border-eco-primary text-eco-primary hover:bg-eco-primary hover:text-white",
        "eco-light": "bg-eco-primary-light/20 text-eco-primary hover:bg-eco-primary-light/30",
        success: "bg-eco-success text-white hover:bg-eco-success/90 hover:shadow-lg",
        warning: "bg-eco-warning text-white hover:bg-eco-warning/90",
        danger: "bg-eco-danger text-white hover:bg-eco-danger/90",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "eco",
      size: "default",
    },
  }
);

export interface EcoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ecoButtonVariants> {
  asChild?: boolean;
}

const EcoButton = React.forwardRef<HTMLButtonElement, EcoButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(ecoButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
EcoButton.displayName = "EcoButton";

export { EcoButton, ecoButtonVariants };
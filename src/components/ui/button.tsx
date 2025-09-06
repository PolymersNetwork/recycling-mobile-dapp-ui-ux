import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md focus-visible:ring-primary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md focus-visible:ring-destructive",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md focus-visible:ring-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md focus-visible:ring-primary",
        ghost: "hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary",
        // Brand variants for Polymers Network
        brand: "bg-gradient-to-r from-brand-primary to-brand-accent text-white hover:shadow-lg hover:scale-[1.02] shadow-md focus-visible:ring-brand-primary",
        "brand-outline": "border-2 border-brand-primary bg-transparent text-brand-primary hover:bg-brand-primary hover:text-white shadow-sm hover:shadow-md focus-visible:ring-brand-primary",
        "brand-ghost": "text-brand-primary hover:bg-brand-secondary/20 focus-visible:ring-brand-primary",
        wallet: "bg-brand-primary text-white hover:bg-brand-primary/90 shadow-md hover:shadow-lg hover:scale-[1.02] focus-visible:ring-brand-primary",
        "wallet-outline": "border-2 border-brand-primary bg-background text-brand-primary hover:bg-brand-primary hover:text-white shadow-sm hover:shadow-md focus-visible:ring-brand-primary",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 px-3 py-1 text-xs rounded-md",
        lg: "h-12 px-6 py-3 text-base rounded-lg",
        xl: "h-14 px-8 py-4 text-lg rounded-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

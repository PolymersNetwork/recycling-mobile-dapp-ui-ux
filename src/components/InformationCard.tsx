import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Info, 
  X, 
  ExternalLink, 
  Zap, 
  Shield, 
  Coins,
  Recycle,
  TrendingUp,
  Users,
  Globe
} from "lucide-react";

interface InformationCardProps {
  type?: "info" | "warning" | "success" | "tip";
  title: string;
  description: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  }>;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function InformationCard({
  type = "info",
  title,
  description,
  actions,
  dismissible = true,
  onDismiss
}: InformationCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const getTypeConfig = () => {
    switch (type) {
      case "warning":
        return {
          icon: Zap,
          bgGradient: "from-eco-warning/10 to-eco-warning/5",
          borderColor: "border-eco-warning/20",
          iconColor: "text-eco-warning",
          badgeVariant: "destructive" as const
        };
      case "success":
        return {
          icon: Shield,
          bgGradient: "from-eco-success/10 to-eco-success/5",
          borderColor: "border-eco-success/20",
          iconColor: "text-eco-success",
          badgeVariant: "secondary" as const
        };
      case "tip":
        return {
          icon: TrendingUp,
          bgGradient: "from-eco-primary/10 to-eco-primary/5",
          borderColor: "border-eco-primary/20",
          iconColor: "text-eco-primary",
          badgeVariant: "outline" as const
        };
      default:
        return {
          icon: Info,
          bgGradient: "from-blue-500/10 to-blue-500/5",
          borderColor: "border-blue-500/20",
          iconColor: "text-blue-500",
          badgeVariant: "secondary" as const
        };
    }
  };

  const { icon: Icon, bgGradient, borderColor, iconColor, badgeVariant } = getTypeConfig();

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`bg-gradient-to-r ${bgGradient} ${borderColor} border-2 shadow-lg`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${iconColor} bg-white rounded-full flex items-center justify-center shadow-sm`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                      <span>{title}</span>
                      <Badge variant={badgeVariant} className="text-xs">
                        {type.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </div>
                </div>
                
                {dismissible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-white/50"
                    onClick={handleDismiss}
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {description}
              </p>

              {actions && actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || "default"}
                      size="sm"
                      onClick={action.onClick}
                      className="flex items-center space-x-2"
                    >
                      <span>{action.label}</span>
                      <ExternalLink size={14} />
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Pre-built information cards for common use cases
export const NetworkInfoCard = () => (
  <InformationCard
    type="info"
    title="Polymers Network"
    description="A decentralized platform transforming waste into digital assets through IoT sensors, AI verification, and blockchain rewards."
    actions={[
      {
        label: "Learn More",
        onClick: () => window.open("https://polymers.network", "_blank"),
        variant: "outline"
      }
    ]}
  />
);

export const RewardsInfoCard = () => (
  <InformationCard
    type="success"
    title="Earn PLY Tokens"
    description="Scan recyclable items to earn PLY tokens and contribute to environmental sustainability. Higher quality items earn more rewards."
    actions={[
      {
        label: "Start Scanning",
        onClick: () => window.location.href = "/scan"
      }
    ]}
  />
);

export const WalletInfoCard = () => (
  <InformationCard
    type="tip"
    title="Connect Your Wallet"
    description="Connect a Solana wallet to receive PLY token rewards, trade on the marketplace, and manage your digital assets."
    actions={[
      {
        label: "Connect Wallet",
        onClick: () => {}, // Will be connected to wallet context
        variant: "default"
      }
    ]}
  />
);

export const DePINInfoCard = () => (
  <InformationCard
    type="warning"
    title="DePIN Infrastructure"
    description="Our decentralized physical infrastructure validates recycling activities through IoT sensors and AI-powered verification systems."
    actions={[
      {
        label: "View Nodes",
        onClick: () => window.location.href = "/nodes",
        variant: "outline"
      }
    ]}
  />
);
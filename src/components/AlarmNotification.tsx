import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  X, 
  Clock, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Info,
  TrendingUp,
  Gift
} from "lucide-react";

interface AlarmNotificationProps {
  id: string;
  type: "reward" | "challenge" | "system" | "deadline" | "achievement";
  title: string;
  message: string;
  timestamp: Date;
  priority?: "low" | "medium" | "high";
  autoHide?: boolean;
  hideDelay?: number;
  onDismiss?: (id: string) => void;
  onAction?: () => void;
  actionLabel?: string;
}

export function AlarmNotification({
  id,
  type,
  title,
  message,
  timestamp,
  priority = "medium",
  autoHide = false,
  hideDelay = 5000,
  onDismiss,
  onAction,
  actionLabel
}: AlarmNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, hideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, hideDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(id), 300);
  };

  const getTypeConfig = () => {
    switch (type) {
      case "reward":
        return {
          icon: Gift,
          color: "text-eco-success",
          bgColor: "from-eco-success/10 to-eco-success/5",
          borderColor: "border-eco-success/30",
          badgeColor: "bg-eco-success text-white"
        };
      case "challenge":
        return {
          icon: TrendingUp,
          color: "text-eco-warning",
          bgColor: "from-eco-warning/10 to-eco-warning/5",
          borderColor: "border-eco-warning/30",
          badgeColor: "bg-eco-warning text-white"
        };
      case "system":
        return {
          icon: Info,
          color: "text-blue-500",
          bgColor: "from-blue-500/10 to-blue-500/5",
          borderColor: "border-blue-500/30",
          badgeColor: "bg-blue-500 text-white"
        };
      case "deadline":
        return {
          icon: AlertTriangle,
          color: "text-red-500",
          bgColor: "from-red-500/10 to-red-500/5",
          borderColor: "border-red-500/30",
          badgeColor: "bg-red-500 text-white"
        };
      case "achievement":
        return {
          icon: CheckCircle,
          color: "text-eco-primary",
          bgColor: "from-eco-primary/10 to-eco-primary/5",
          borderColor: "border-eco-primary/30",
          badgeColor: "bg-eco-primary text-white"
        };
      default:
        return {
          icon: Bell,
          color: "text-gray-500",
          bgColor: "from-gray-500/10 to-gray-500/5",
          borderColor: "border-gray-500/30",
          badgeColor: "bg-gray-500 text-white"
        };
    }
  };

  const getPriorityConfig = () => {
    switch (priority) {
      case "high":
        return {
          animation: "animate-pulse",
          shadow: "shadow-lg shadow-red-500/20"
        };
      case "medium":
        return {
          animation: "",
          shadow: "shadow-md"
        };
      case "low":
        return {
          animation: "",
          shadow: "shadow-sm"
        };
      default:
        return {
          animation: "",
          shadow: "shadow-md"
        };
    }
  };

  const { icon: Icon, color, bgColor, borderColor, badgeColor } = getTypeConfig();
  const { animation, shadow } = getPriorityConfig();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`fixed top-4 right-4 z-50 max-w-sm ${animation}`}
        >
          <Card className={`bg-gradient-to-r ${bgColor} border-2 ${borderColor} ${shadow}`}>
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${color} bg-white rounded-full flex items-center justify-center shadow-sm`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground truncate">
                      {title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={`${badgeColor} text-xs px-2 py-0.5`}>
                        {type.toUpperCase()}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock size={10} />
                        <span>{formatTime(timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-white/50"
                  onClick={handleDismiss}
                >
                  <X size={16} />
                </Button>
              </div>

              {/* Message */}
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {message}
              </p>

              {/* Action Button */}
              {onAction && actionLabel && (
                <Button
                  size="sm"
                  onClick={onAction}
                  className="w-full bg-white/90 hover:bg-white text-gray-900 border-0"
                >
                  <Zap size={14} className="mr-2" />
                  {actionLabel}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Notification Manager Hook
export function useAlarmNotifications() {
  const [notifications, setNotifications] = useState<AlarmNotificationProps[]>([]);

  const addNotification = (notification: Omit<AlarmNotificationProps, "id" | "timestamp">) => {
    const newNotification: AlarmNotificationProps = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      onDismiss: (id) => removeNotification(id)
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  };
}

// Notification Container Component
export function AlarmNotificationContainer() {
  const { notifications } = useAlarmNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <AlarmNotification key={notification.id} {...notification} />
        ))}
      </AnimatePresence>
    </div>
  );
}
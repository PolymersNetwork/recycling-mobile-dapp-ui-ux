import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileHeaderProps {
  title?: string;
  showNotifications?: boolean;
  showSettings?: boolean;
  notificationCount?: number;
}

export function MobileHeader({ 
  title = "EcoLoop", 
  showNotifications = true, 
  showSettings = false,
  notificationCount = 0 
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-eco-primary to-eco-success rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">🌱</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {showNotifications && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
          )}
          
          {showSettings && (
            <Button variant="ghost" size="icon">
              <Settings size={20} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import polymersLogo from "@/assets/polymers-logo.png";

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
    <header className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-lg border-b border-brand-primary/20">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-brand-primary p-1">
            <img src={polymersLogo} alt="Polymers" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-lg font-bold text-white">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {showNotifications && (
            <Button variant="brand-ghost" size="icon" className="relative text-white hover:bg-brand-primary/20">
              <Bell size={20} />
              {notificationCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-brand-accent text-brand-dark font-bold"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
          )}
          
          {showSettings && (
            <Button variant="brand-ghost" size="icon" className="text-white hover:bg-brand-primary/20">
              <Settings size={20} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
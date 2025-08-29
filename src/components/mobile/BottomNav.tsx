import { Home, Scan, FolderOpen, ShoppingBag, Wallet, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";

const navItems = [
  { icon: Home, label: "Home", path: ROUTES.HOME },
  { icon: Scan, label: "Scan", path: ROUTES.SCAN },
  { icon: FolderOpen, label: "Projects", path: ROUTES.PROJECTS },
  { icon: ShoppingBag, label: "Market", path: ROUTES.MARKETPLACE },
  { icon: Wallet, label: "Portfolio", path: ROUTES.PORTFOLIO },
  { icon: User, label: "Profile", path: ROUTES.PROFILE },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200",
                "min-w-0 flex-1",
                isActive
                  ? "text-eco-primary bg-eco-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
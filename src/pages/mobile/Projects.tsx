import { useState } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle, EcoCardDescription } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, MapPin, Users, Zap, Clock, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@/types";

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Ocean Plastic Cleanup",
    description: "Removing plastic waste from ocean waters and beaches to protect marine life.",
    imageUrl: "/api/placeholder/400/200",
    targetAmount: 50000,
    currentAmount: 32750,
    contributors: 247,
    category: "cleanup",
    location: "Pacific Ocean",
    endDate: "2024-12-31",
    createdBy: "Ocean Foundation",
    impact: {
      co2Reduction: 1250,
      treesPlanted: 0,
      plasticRemoved: 25000
    }
  },
  {
    id: "2", 
    title: "Solar School Initiative",
    description: "Installing solar panels in rural schools to provide clean energy education.",
    imageUrl: "/api/placeholder/400/200",
    targetAmount: 75000,
    currentAmount: 18500,
    contributors: 89,
    category: "renewable",
    location: "Kenya",
    endDate: "2024-11-15",
    createdBy: "Green Education",
    impact: {
      co2Reduction: 2100,
      treesPlanted: 500,
      plasticRemoved: 0
    }
  }
];

export function Projects() {
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  const handleContribute = (projectId: string) => {
    toast({
      title: "Contribution Successful!",
      description: "Thank you for supporting this eco project!",
    });
  };

  const getTimeLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : "Ended";
  };

  const getCategoryColor = (category: Project['category']) => {
    const colors = {
      cleanup: "bg-blue-500/10 text-blue-700 border-blue-200",
      renewable: "bg-yellow-500/10 text-yellow-700 border-yellow-200", 
      conservation: "bg-green-500/10 text-green-700 border-green-200",
      education: "bg-purple-500/10 text-purple-700 border-purple-200"
    };
    return colors[category] || colors.cleanup;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <MobileHeader title="Eco Projects" />
      
      <main className="p-4 space-y-6">
        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {["all", "cleanup", "renewable", "conservation", "education"].map((category) => (
            <EcoButton
              key={category}
              variant={filter === category ? "eco" : "eco-outline"}
              size="sm"
              onClick={() => setFilter(category)}
              className="capitalize whitespace-nowrap"
            >
              {category}
            </EcoButton>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <EcoCard padding="sm" variant="eco">
            <div className="text-center">
              <TrendingUp className="w-5 h-5 text-eco-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Total Raised</p>
              <p className="text-sm font-bold text-eco-primary">$51.2K</p>
            </div>
          </EcoCard>
          
          <EcoCard padding="sm" variant="eco">
            <div className="text-center">
              <Users className="w-5 h-5 text-eco-success mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Contributors</p>
              <p className="text-sm font-bold text-eco-success">336</p>
            </div>
          </EcoCard>
          
          <EcoCard padding="sm" variant="eco">
            <div className="text-center">
              <Zap className="w-5 h-5 text-eco-warning mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">My Impact</p>
              <p className="text-sm font-bold text-eco-warning">1.2K</p>
            </div>
          </EcoCard>
        </div>

        {/* Project List */}
        <div className="space-y-4">
          {mockProjects.map((project) => (
            <EcoCard key={project.id} variant="elevated">
              <div className="relative">
                <div className="aspect-[2/1] bg-gradient-to-br from-eco-primary-light/20 to-eco-primary/10 rounded-t-2xl flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-eco-primary/20 rounded-full flex items-center justify-center mx-auto">
                      <Heart className="w-8 h-8 text-eco-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">Project Image</p>
                  </div>
                </div>
                
                <Badge 
                  className={`absolute top-3 right-3 ${getCategoryColor(project.category)}`}
                >
                  {project.category}
                </Badge>
              </div>
              
              <EcoCardContent>
                <EcoCardHeader>
                  <EcoCardTitle className="text-lg">{project.title}</EcoCardTitle>
                  <EcoCardDescription>{project.description}</EcoCardDescription>
                </EcoCardHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      ${project.currentAmount.toLocaleString()}/{project.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  
                  <Progress 
                    value={(project.currentAmount / project.targetAmount) * 100} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{project.contributors} contributors</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeLeft(project.endDate)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{project.location}</span>
                    </div>
                  </div>
                  
                  {/* Impact Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                    {project.impact.co2Reduction > 0 && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">CO₂ Reduced</p>
                        <p className="text-sm font-semibold text-eco-success">
                          {project.impact.co2Reduction}kg
                        </p>
                      </div>
                    )}
                    
                    {project.impact.treesPlanted > 0 && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Trees</p>
                        <p className="text-sm font-semibold text-eco-primary">
                          {project.impact.treesPlanted}
                        </p>
                      </div>
                    )}
                    
                    {project.impact.plasticRemoved > 0 && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Plastic (kg)</p>
                        <p className="text-sm font-semibold text-eco-warning">
                          {project.impact.plasticRemoved}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <EcoButton 
                    variant="eco" 
                    className="w-full mt-4"
                    onClick={() => handleContribute(project.id)}
                  >
                    <Heart className="w-4 h-4" />
                    Contribute Now
                  </EcoButton>
                </div>
              </EcoCardContent>
            </EcoCard>
          ))}
        </div>
      </main>
    </div>
  );
}
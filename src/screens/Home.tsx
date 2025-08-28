"use client";

import React, { useEffect } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useRecycling } from "@/contexts/RecyclingContext";

export function Home() {
  const { projects, contributeToProject, loading } = useRecycling();

  const handleContribute = async (projectId: string) => {
    try {
      await contributeToProject(projectId, 100, "PLY");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <MobileHeader title="Home" />

      <main className="p-4 space-y-6">
        {/* Projects List */}
        {projects.map((project) => (
          <EcoCard key={project.id} variant="elevated">
            <EcoCardHeader>
              <EcoCardTitle>{project.title}</EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent className="space-y-2">
              <p>{project.description}</p>
              <p>
                Progress: {project.currentAmount} / {project.targetAmount} tokens
              </p>
              <p>Contributors: {project.contributors}</p>
              <EcoButton
                variant="eco"
                disabled={loading}
                onClick={() => handleContribute(project.id)}
              >
                <Heart className="w-4 h-4 mr-1" /> Contribute
              </EcoButton>
            </EcoCardContent>
          </EcoCard>
        ))}
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Project } from '@/types';

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Ocean Cleanup Initiative',
    description: 'Remove 100 tons of plastic from Pacific Ocean using advanced cleanup systems and community collection efforts.',
    imageUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=300',
    targetAmount: 50000,
    currentAmount: 32450,
    contributors: 234,
    category: 'cleanup',
    location: 'Pacific Ocean',
    endDate: '2024-12-31',
    createdBy: 'Ocean Foundation',
    impact: {
      co2Reduction: 125000,
      treesPlanted: 0,
      plasticRemoved: 100000
    }
  },
  {
    id: '2', 
    title: 'Solar Panel Community Fund',
    description: 'Install solar panels in underserved communities to reduce carbon emissions and energy costs.',
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&h=300',
    targetAmount: 75000,
    currentAmount: 18750,
    contributors: 89,
    category: 'renewable',
    location: 'Global',
    endDate: '2024-10-15',
    createdBy: 'Green Energy Collective',
    impact: {
      co2Reduction: 500000,
      treesPlanted: 2000,
      plasticRemoved: 0
    }
  }
];

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  };

  const contributeToProject = async (projectId: string, amount: number, currency: 'PLY' | 'USDC' | 'SOL') => {
    setLoading(true);
    
    // Simulate contribution
    setTimeout(() => {
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, currentAmount: project.currentAmount + amount, contributors: project.contributors + 1 }
          : project
      ));
      setLoading(false);
    }, 2000);
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'currentAmount' | 'contributors'>) => {
    setLoading(true);
    
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      currentAmount: 0,
      contributors: 0
    };
    
    setTimeout(() => {
      setProjects(prev => [newProject, ...prev]);
      setLoading(false);
    }, 2000);
    
    return newProject;
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    fetchProjects,
    contributeToProject,
    createProject
  };
}
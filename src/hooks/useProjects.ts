import { useState, useEffect } from 'react';
import { Project } from '@/types';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProjects(mockProjects);
    } catch (err) {
      toast({ title: 'Failed to load projects', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const contributeToProject = async (projectId: string, amount: number, currency: 'PLY' | 'USDC' | 'SOL') => {
    setLoading(true);
    try {
      // Simulate blockchain/web3 contribution
      await new Promise(resolve => setTimeout(resolve, 2000));

      setProjects(prev =>
        prev.map(project =>
          project.id === projectId
            ? {
                ...project,
                currentAmount: project.currentAmount + amount,
                contributors: project.contributors + 1
              }
            : project
        )
      );

      toast({
        title: 'Contribution Successful',
        description: `You contributed ${amount} ${currency} to ${projects.find(p => p.id === projectId)?.title}`,
      });
    } catch (err) {
      toast({ title: 'Contribution Failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'currentAmount' | 'contributors'>) => {
    setLoading(true);
    try {
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        currentAmount: 0,
        contributors: 0
      };

      // Simulate API call / blockchain submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProjects(prev => [newProject, ...prev]);

      toast({
        title: 'Project Created',
        description: `Project "${newProject.title}" has been successfully added.`,
      });

      return newProject;
    } catch (err) {
      toast({ title: 'Project Creation Failed', variant: 'destructive' });
      throw err;
    } finally {
      setLoading(false);
    }
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

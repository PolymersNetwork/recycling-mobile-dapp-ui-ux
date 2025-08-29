import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User, Badge, Project, Challenge, RecyclingSubmission, UserStats } from '../types';

interface RecyclingContextType {
  user: User | null;
  projects: Project[];
  challenges: Challenge[];
  submissions: RecyclingSubmission[];
  stats: UserStats;
  
  // Actions
  submitRecycling: (data: Omit<RecyclingSubmission, 'id' | 'createdAt'>) => Promise<void>;
  contributeToProject: (projectId: string, amount: number) => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const RecyclingContext = createContext<RecyclingContextType | null>(null);

export const useRecycling = () => {
  const context = useContext(RecyclingContext);
  if (!context) {
    throw new Error('useRecycling must be used within a RecyclingProvider');
  }
  return context;
};

export const RecyclingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: '1',
    email: 'eco@user.com',
    name: 'Eco User',
    level: 1,
    totalTokens: 500,
    streakDays: 7,
    badges: [],
    createdAt: new Date().toISOString(),
  });

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Ocean Cleanup Initiative',
      description: 'Remove plastic waste from ocean waters',
      imageUrl: '/projects/ocean-cleanup.jpg',
      currentAmount: 750,
      targetAmount: 1000,
      contributors: 25,
      category: 'cleanup',
      location: 'Pacific Ocean',
      endDate: '2024-12-31',
      createdBy: 'Ocean Foundation',
      impact: {
        co2Reduction: 500,
        treesPlanted: 0,
        plasticRemoved: 1200,
      },
    },
    {
      id: '2',
      title: 'Solar Panel Installation',
      description: 'Install solar panels in rural communities',
      imageUrl: '/projects/solar-panels.jpg',
      currentAmount: 400,
      targetAmount: 800,
      contributors: 15,
      category: 'renewable',
      location: 'Rural Kenya',
      endDate: '2024-11-30',
      createdBy: 'Green Energy Co',
      impact: {
        co2Reduction: 1000,
        treesPlanted: 0,
        plasticRemoved: 0,
      },
    },
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Weekly Recycling Goal',
      description: 'Recycle 10 items this week',
      targetValue: 10,
      currentValue: 3,
      reward: 50,
      rewardType: 'POLY',
      deadline: '2024-12-31',
      completed: false,
    },
  ]);

  const [submissions, setSubmissions] = useState<RecyclingSubmission[]>([]);

  const [stats, setStats] = useState<UserStats>({
    totalRecycled: 0,
    tokensEarned: 0,
    carbonOffset: 0,
    rank: 100,
    streakDays: 0,
    badgesUnlocked: 0,
  });

  const submitRecycling = async (data: Omit<RecyclingSubmission, 'id' | 'createdAt'>) => {
    const newSubmission: RecyclingSubmission = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    setSubmissions(prev => [...prev, newSubmission]);
    
    // Update user tokens
    setUser(prev => prev ? {
      ...prev,
      totalTokens: prev.totalTokens + data.tokensEarned,
    } : null);

    // Update stats
    setStats(prev => ({
      ...prev,
      totalRecycled: prev.totalRecycled + data.weight,
      tokensEarned: prev.tokensEarned + data.tokensEarned,
      carbonOffset: prev.carbonOffset + (data.weight * 0.5), // Estimate
    }));
  };

  const contributeToProject = async (projectId: string, amount: number) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? {
              ...project,
              currentAmount: project.currentAmount + amount,
              contributors: project.contributors + 1,
            }
          : project
      )
    );

    // Deduct tokens from user
    setUser(prev => prev ? {
      ...prev,
      totalTokens: prev.totalTokens - amount,
    } : null);
  };

  const completeChallenge = async (challengeId: string) => {
    setChallenges(prev =>
      prev.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, completed: true, currentValue: challenge.targetValue }
          : challenge
      )
    );

    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge && user) {
      setUser(prev => prev ? {
        ...prev,
        totalTokens: prev.totalTokens + challenge.reward,
      } : null);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <RecyclingContext.Provider value={{
      user,
      projects,
      challenges,
      submissions,
      stats,
      submitRecycling,
      contributeToProject,
      completeChallenge,
      updateUser,
    }}>
      {children}
    </RecyclingContext.Provider>
  );
};
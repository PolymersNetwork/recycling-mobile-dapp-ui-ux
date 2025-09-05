import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePrivy } from '@privy-io/react-auth';
import { PLASTIC_TYPES, PlasticType, calculateReward } from '@/utils/plastics-types';
import { E_WASTE_TYPES, EWasteType, calculateEWasteReward } from '@/utils/e-waste';
import { useToast } from '@/hooks/use-toast';

export interface RecyclingSubmission {
  id?: string;
  user_id?: string;
  collection_point_id: string;
  plastic_type?: string;
  ewaste_type?: string;
  weight: number;
  location: string;
  photo_urls: string[];
  description?: string;
  status: 'pending' | 'verified' | 'rejected';
  reward_amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface RecyclingStats {
  totalSubmissions: number;
  totalRewards: number;
  plasticItemsRecycled: number;
  ewasteItemsRecycled: number;
  co2Saved: number;
  streak: number;
}

export function useRecycling() {
  const { user } = usePrivy();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<RecyclingSubmission[]>([]);
  const [stats, setStats] = useState<RecyclingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's recycling submissions
  const fetchSubmissions = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recycling_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions((data || []) as RecyclingSubmission[]);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit a new recycling item
  const submitRecycling = async (
    type: 'plastic' | 'ewaste',
    itemData: {
      plasticType?: PlasticType;
      ewasteType?: EWasteType;
      weight: number;
      condition: string;
      location: string;
      collectionPointId: string;
      photos: string[];
      description?: string;
    }
  ): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit recycling items.",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      // Calculate reward based on type
      let rewardAmount = 0;
      let itemTypeId = '';

      if (type === 'plastic' && itemData.plasticType) {
        rewardAmount = calculateReward(
          itemData.plasticType,
          itemData.weight,
          itemData.condition as any
        );
        itemTypeId = itemData.plasticType.id;
      } else if (type === 'ewaste' && itemData.ewasteType) {
        rewardAmount = calculateEWasteReward(
          itemData.ewasteType,
          itemData.condition as any
        );
        itemTypeId = itemData.ewasteType.id;
      }

      const submission = {
        user_id: user.id,
        collection_point_id: itemData.collectionPointId,
        plastic_type: type === 'plastic' && itemData.plasticType ? itemData.plasticType.id : 'OTHER',
        weight: itemData.weight,
        location: itemData.location,
        photo_urls: itemData.photos,
        description: itemData.description || '',
        status: 'pending' as const,
        reward_amount: rewardAmount
      };

      const { data, error } = await supabase
        .from('recycling_submissions')
        .insert(submission)
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setSubmissions(prev => [data as RecyclingSubmission, ...prev]);

      // Create reward entry
      await supabase
        .from('rewards')
        .insert([
          {
            user_id: user.id,
            type: 'recycling',
            amount: rewardAmount,
            submission_id: data.id,
            token: 'PLY',
            status: 'pending'
          }
        ]);

      toast({
        title: "Submission Successful!",
        description: `You've earned ${rewardAmount} PLY tokens for recycling.`
      });

      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error submitting recycling:', err);
      toast({
        title: "Submission Failed",
        description: err.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calculate user statistics
  const calculateStats = async () => {
    if (!user?.id) return;

    try {
      const { data: userSubmissions } = await supabase
        .from('recycling_submissions')
        .select('*')
        .eq('user_id', user.id);

      const { data: userRewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'recycling');

      const totalSubmissions = userSubmissions?.length || 0;
      const totalRewards = userRewards?.reduce((sum, reward) => sum + Number(reward.amount), 0) || 0;
      
      const plasticItems = userSubmissions?.filter(s => s.plastic_type).length || 0;
      const ewasteItems = userSubmissions?.filter(s => s.description?.includes('e-waste')).length || 0;

      // Mock CO2 calculation (in production, this would be more sophisticated)
      const co2Saved = totalSubmissions * 2.5; // 2.5 kg CO2 per item average

      // Calculate streak (consecutive days with submissions)
      let streak = 0;
      if (userSubmissions && userSubmissions.length > 0) {
        // Mock streak calculation
        streak = 7; // Placeholder
      }

      const stats: RecyclingStats = {
        totalSubmissions,
        totalRewards,
        plasticItemsRecycled: plasticItems,
        ewasteItemsRecycled: ewasteItems,
        co2Saved,
        streak
      };

      setStats(stats);
    } catch (err) {
      console.error('Error calculating stats:', err);
    }
  };

  // Get leaderboard position
  const getLeaderboardPosition = async (): Promise<number> => {
    if (!user?.id) return 0;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, total_earned')
        .order('total_earned', { ascending: false });

      if (error) throw error;

      const position = data.findIndex(profile => profile.user_id === user.id) + 1;
      return position || 0;
    } catch (err) {
      console.error('Error getting leaderboard position:', err);
      return 0;
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSubmissions();
      calculateStats();
    }
  }, [user?.id]);

  return {
    submissions,
    stats,
    loading,
    error,
    submitRecycling,
    fetchSubmissions,
    calculateStats,
    getLeaderboardPosition
  };
}
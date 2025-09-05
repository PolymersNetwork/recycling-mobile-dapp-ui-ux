import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get auth user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'GET') {
      // Get user profile with aggregated stats
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Get user statistics
      const [
        { data: submissions, error: submissionsError },
        { data: rewards, error: rewardsError },
        { data: transactions, error: transactionsError }
      ] = await Promise.all([
        supabaseClient
          .from('recycling_submissions')
          .select('*')
          .eq('user_id', user.id),
        supabaseClient
          .from('rewards')
          .select('*')
          .eq('user_id', user.id),
        supabaseClient
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
      ]);

      if (submissionsError) throw submissionsError;
      if (rewardsError) throw rewardsError;
      if (transactionsError) throw transactionsError;

      // Calculate aggregated statistics
      const stats = {
        total_submissions: submissions?.length || 0,
        total_rewards: rewards?.reduce((sum, r) => sum + Number(r.amount), 0) || 0,
        total_transactions: transactions?.length || 0,
        verified_submissions: submissions?.filter(s => s.status === 'verified').length || 0,
        pending_submissions: submissions?.filter(s => s.status === 'pending').length || 0,
        total_weight_recycled: submissions?.reduce((sum, s) => sum + Number(s.weight), 0) || 0,
        co2_saved: (submissions?.length || 0) * 2.5, // 2.5kg CO2 per item average
        streak_days: calculateStreak(submissions || []),
        current_level: calculateLevel(rewards?.reduce((sum, r) => sum + Number(r.amount), 0) || 0),
      };

      return new Response(
        JSON.stringify({
          profile: profile || {
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            created_at: user.created_at,
          },
          stats,
          submissions: submissions || [],
          rewards: rewards || [],
          transactions: transactions || []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      const {
        full_name,
        display_name,
        bio,
        avatar_url,
        wallet_address
      } = body;

      // Upsert profile
      const { data, error } = await supabaseClient
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name,
          display_name,
          bio,
          avatar_url,
          wallet_address,
          email: user.email,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ profile: data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in user-profile function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateStreak(submissions: any[]): number {
  if (!submissions.length) return 0;
  
  const sortedDates = submissions
    .map(s => new Date(s.created_at).toDateString())
    .sort()
    .reverse();
  
  const uniqueDates = [...new Set(sortedDates)];
  let streak = 0;
  let currentDate = new Date();
  
  for (const dateStr of uniqueDates) {
    const submissionDate = new Date(dateStr);
    const daysDiff = Math.floor((currentDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
      currentDate = submissionDate;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateLevel(totalRewards: number): number {
  if (totalRewards < 100) return 1;
  if (totalRewards < 500) return 2;
  if (totalRewards < 1000) return 3;
  if (totalRewards < 2500) return 4;
  if (totalRewards < 5000) return 5;
  return Math.floor(totalRewards / 1000) + 5;
}
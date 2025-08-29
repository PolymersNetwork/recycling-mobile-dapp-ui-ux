import React from 'react';
import { Link } from 'react-router-dom';
import { useRecycling } from '../../../packages/contexts/RecyclingContext';
import { useWallet } from '../../../packages/contexts/WalletContext';
import { ParticleEngine } from '../../../packages/components/particles/ParticleEngine';
import { Leaf, Coins, Users, Target } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, stats, challenges } = useRecycling();
  const { wallet, connect, disconnect, connecting } = useWallet();

  const handleRewardClick = (event: React.MouseEvent) => {
    ParticleEngine.trigger({
      target: event.currentTarget as HTMLElement,
      count: 20,
      colors: ['#22c55e', '#16a34a', '#15803d'],
      type: 'coin'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Eco Warrior'}! 🌱
            </h1>
            <p className="text-gray-600 mt-2">
              Continue your journey towards a sustainable future
            </p>
          </div>
          
          <div className="flex gap-4">
            {wallet?.connected ? (
              <button
                onClick={disconnect}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Disconnect Wallet
              </button>
            ) : (
              <button
                onClick={connect}
                disabled={connecting}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            className="bg-white rounded-xl p-6 shadow-lg cursor-pointer transform transition-transform hover:scale-105"
            onClick={handleRewardClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">POLY Tokens</p>
                <p className="text-3xl font-bold text-green-600">{user?.totalTokens || 0}</p>
              </div>
              <Coins className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Items Recycled</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalRecycled}</p>
              </div>
              <Leaf className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">CO₂ Offset (kg)</p>
                <p className="text-3xl font-bold text-purple-600">{stats.carbonOffset}</p>
              </div>
              <Target className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Global Rank</p>
                <p className="text-3xl font-bold text-orange-600">#{stats.rank}</p>
              </div>
              <Users className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Active Challenges */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Active Challenges</h2>
          <div className="space-y-4">
            {challenges.map(challenge => (
              <div key={challenge.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    +{challenge.reward} {challenge.rewardType}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{challenge.description}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(challenge.currentValue / challenge.targetValue) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {challenge.currentValue} / {challenge.targetValue}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            to="/marketplace"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 text-center hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
          >
            <h3 className="text-xl font-bold mb-2">🛒 Marketplace</h3>
            <p>Spend your tokens on eco-friendly products</p>
          </Link>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 text-center hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 cursor-pointer">
            <h3 className="text-xl font-bold mb-2">📸 Scan & Recycle</h3>
            <p>Earn tokens by recycling waste</p>
          </div>

          <Link 
            to="/profile"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 text-center hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            <h3 className="text-xl font-bold mb-2">👤 Profile</h3>
            <p>View your achievements and progress</p>
          </Link>
        </div>
      </div>
    </div>
  );
};
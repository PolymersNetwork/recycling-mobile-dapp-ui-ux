import React from 'react';
import { Link } from 'react-router-dom';
import { useRecycling } from '../../../packages/contexts/RecyclingContext';
import { ArrowLeft, Award, Calendar, Leaf, Target } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, stats, submissions } = useRecycling();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Profile Found</h2>
          <Link to="/" className="text-green-600 hover:text-green-700">
            Go back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/"
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Profile 👤</h1>
            <p className="text-gray-600 mt-2">Your eco-journey progress and achievements</p>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <div className="flex items-center gap-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Level {user.level}
                </span>
                <span className="text-gray-500">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">POLY Tokens</p>
                <p className="text-2xl font-bold text-green-600">{user.totalTokens}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Items Recycled</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalRecycled}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Streak Days</p>
                <p className="text-2xl font-bold text-orange-600">{user.streakDays}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Global Rank</p>
                <p className="text-2xl font-bold text-purple-600">#{stats.rank}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-bold mb-4">Achievements & Badges</h3>
          {user.badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {user.badges.map(badge => (
                <div key={badge.id} className="text-center p-4 border rounded-lg">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h4 className="font-semibold text-sm">{badge.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                    badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                    badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                    badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {badge.rarity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No badges earned yet. Start recycling to unlock achievements!</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Recent Recycling Activity</h3>
          {submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.slice(-5).reverse().map(submission => (
                <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      submission.type === 'plastic' ? 'bg-red-100' :
                      submission.type === 'paper' ? 'bg-yellow-100' :
                      submission.type === 'metal' ? 'bg-gray-100' :
                      'bg-green-100'
                    }`}>
                      {submission.type === 'plastic' ? '🍶' :
                       submission.type === 'paper' ? '📄' :
                       submission.type === 'metal' ? '🥫' : '🍃'}
                    </div>
                    <div>
                      <p className="font-semibold capitalize">{submission.type}</p>
                      <p className="text-sm text-gray-500">{submission.weight}kg • {submission.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+{submission.tokensEarned} POLY</p>
                    <p className="text-sm text-gray-500">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Leaf className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No recycling activity yet. Start scanning items to track your impact!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
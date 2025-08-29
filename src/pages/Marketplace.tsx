import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecycling } from '../contexts/RecyclingContext';
import { ParticleEngine } from '../components/particles/ParticleEngine';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

const marketplaceItems = [
  {
    id: '1',
    title: 'Eco Water Bottle',
    description: 'Made from 100% recycled plastic',
    price: 50,
    currency: 'POLY',
    imageUrl: '/api/placeholder/300/200',
    category: 'eco-products',
    available: true,
  },
  {
    id: '2',
    title: 'Carbon Credit - 1 Ton',
    description: 'Verified carbon offset from reforestation',
    price: 100,
    currency: 'POLY',
    imageUrl: '/api/placeholder/300/200',
    category: 'carbon-credits',
    available: true,
  },
  {
    id: '3',
    title: 'Ocean Cleanup Donation',
    description: 'Support marine conservation efforts',
    price: 75,
    currency: 'POLY',
    imageUrl: '/api/placeholder/300/200',
    category: 'donations',
    available: true,
  },
];

export const Marketplace: React.FC = () => {
  const { user, updateUser } = useRecycling();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (item: typeof marketplaceItems[0], event: React.MouseEvent) => {
    if (!user || user.totalTokens < item.price) return;

    setPurchasing(item.id);
    
    // Trigger particle effect
    ParticleEngine.trigger({
      target: event.currentTarget as HTMLElement,
      count: 25,
      colors: ['#FFD700', '#FFAA00', '#FFFF00'],
      type: 'coin'
    });

    // Simulate purchase
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateUser({
      totalTokens: user.totalTokens - item.price,
    });

    setPurchasing(null);
    
    // Success particles
    setTimeout(() => {
      ParticleEngine.trigger({
        target: event.currentTarget as HTMLElement,
        count: 15,
        colors: ['#22c55e', '#16a34a', '#10b981'],
        type: 'sparkle'
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/"
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Marketplace 🛒</h1>
            <p className="text-gray-600 mt-2">
              Spend your POLY tokens on eco-friendly products and services
            </p>
          </div>
        </div>

        {/* User Balance */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Your Balance</p>
              <p className="text-3xl font-bold text-green-600">
                {user?.totalTokens || 0} POLY
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Available to Spend</p>
              <p className="text-lg font-semibold text-gray-900">
                ${((user?.totalTokens || 0) * 0.1).toFixed(2)} USD
              </p>
            </div>
          </div>
        </div>

        {/* Marketplace Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplaceItems.map(item => {
            const canAfford = (user?.totalTokens || 0) >= item.price;
            const isPurchasing = purchasing === item.id;
            
            return (
              <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img 
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        {item.price}
                      </span>
                      <span className="text-gray-500">{item.currency}</span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {item.category}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handlePurchase(item, e)}
                    disabled={!canAfford || isPurchasing}
                    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 ${
                      canAfford && !isPurchasing
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isPurchasing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        {canAfford ? 'Purchase' : 'Insufficient Balance'}
                      </>
                    )}
                  </button>

                  {!canAfford && (
                    <p className="text-red-500 text-sm mt-2 text-center">
                      Need {item.price - (user?.totalTokens || 0)} more POLY tokens
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Categories */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold mb-2">🌱 Eco Products</h3>
              <p>Sustainable products made from recycled materials</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold mb-2">🌍 Carbon Credits</h3>
              <p>Offset your carbon footprint with verified credits</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold mb-2">💚 Donations</h3>
              <p>Support environmental causes and initiatives</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
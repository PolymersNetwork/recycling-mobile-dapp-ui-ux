"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import type { MarketplaceItem } from "@/types";

export function useMarketplace() {
  const { wallet } = useWallet();
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock marketplace items
  useEffect(() => {
    setMarketplaceItems([
      {
        id: "1",
        title: "Eco Water Bottle",
        description: "Recycled plastic water bottle with eco-friendly design",
        price: 50,
        currency: "PLY",
        imageUrl: "/marketplace/water-bottle.jpg",
        category: "eco-products",
        available: true,
      },
      {
        id: "2", 
        title: "Carbon Credit - 1 Ton",
        description: "Verified carbon offset credit from reforestation project",
        price: 25,
        currency: "PLY",
        imageUrl: "/marketplace/carbon-credit.jpg",
        category: "carbon-credits",
        available: true,
      },
      {
        id: "3",
        title: "Ocean Cleanup Donation",
        description: "Support ocean plastic removal initiatives",
        price: 100,
        currency: "PLY", 
        imageUrl: "/marketplace/ocean-cleanup.jpg",
        category: "donations",
        available: true,
      },
    ]);
  }, []);

  const purchaseItem = async (itemId: string) => {
    if (!wallet?.publicKey) throw new Error("Wallet not connected");
    
    setLoading(true);
    try {
      // Simulate purchase logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMarketplaceItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, available: false }
            : item
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    marketplaceItems,
    purchaseItem,
    loading,
  };
}
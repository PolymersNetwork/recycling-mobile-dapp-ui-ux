import { useState, useEffect } from "react";
import { MarketplaceItem } from "@/types";
import { TOKEN_METADATA } from "@/constants";

const mockItems: MarketplaceItem[] = [
  {
    id: "1",
    title: "Carbon Credit Pack",
    description: "Offset 100kg CO2 emissions",
    imageUrl: "https://images.unsplash.com/photo-1581091870620-0d7f52f0e0e5?w=400&h=300",
    price: 50,
    currency: "PLY",
    type: "carbon-credit",
    seller: "EcoFund",
    available: true,
    category: "carbon-offset",
  },
  {
    id: "2",
    title: "Reusable Bottle",
    description: "Eco-friendly stainless steel bottle",
    imageUrl: "https://images.unsplash.com/photo-1556911073-52527ac437f5?w=400&h=300",
    price: 25,
    currency: "USDC",
    type: "eco-product",
    seller: "EcoStore",
    available: true,
    category: "products",
  },
  {
    id: "3",
    title: "Plant a Tree Donation",
    description: "Support tree planting campaigns worldwide",
    imageUrl: "https://images.unsplash.com/photo-1600185362811-0d6c3a2b12b6?w=400&h=300",
    price: 10,
    currency: "SOL",
    type: "donation",
    seller: "GreenWorld",
    available: true,
    category: "donations",
  },
];

export function useMarketplace() {
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);

  /** Simulate fetching marketplace items */
  const fetchMarketplace = async () => {
    setLoading(true);
    setTimeout(() => {
      setMarketplaceItems(mockItems);
      setLoading(false);
    }, 1000);
  };

  /** Purchase an item (simulate blockchain transaction) */
  const purchaseItem = async (itemId: string) => {
    const item = marketplaceItems.find(i => i.id === itemId);
    if (!item || !item.available) throw new Error("Item not available");

    setLoading(true);
    return new Promise<MarketplaceItem>((resolve) => {
      setTimeout(() => {
        setMarketplaceItems(prev =>
          prev.map(i => i.id === itemId ? { ...i, available: false } : i)
        );
        setLoading(false);
        resolve(item);
      }, 2000);
    });
  };

  /** Filter items by type or category */
  const filterItems = (type?: MarketplaceItem["type"], category?: string) => {
    return marketplaceItems.filter(item => 
      (!type || item.type === type) && (!category || item.category === category)
    );
  };

  useEffect(() => {
    fetchMarketplace();
  }, []);

  return {
    marketplaceItems,
    loading,
    fetchMarketplace,
    purchaseItem,
    filterItems,
  };
}

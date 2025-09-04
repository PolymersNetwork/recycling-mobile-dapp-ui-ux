export interface EWasteType {
  id: string;
  name: string;
  category: 'smartphones' | 'computers' | 'appliances' | 'batteries' | 'cables' | 'other';
  description: string;
  hazardousMaterials: string[];
  recyclingComplexity: 'low' | 'medium' | 'high' | 'specialized';
  rewardMultiplier: number;
  averageLifespan: number; // in years
  color: string;
  icon: string;
}

export const E_WASTE_TYPES: Record<string, EWasteType> = {
  SMARTPHONE: {
    id: 'SMARTPHONE',
    name: 'Smartphone',
    category: 'smartphones',
    description: 'Mobile phones and smartphones containing precious metals and batteries',
    hazardousMaterials: ['Lithium', 'Cobalt', 'Rare earth elements', 'Lead'],
    recyclingComplexity: 'high',
    rewardMultiplier: 3.0,
    averageLifespan: 3,
    color: '#6366f1',
    icon: '📱'
  },
  LAPTOP: {
    id: 'LAPTOP',
    name: 'Laptop Computer',
    category: 'computers',
    description: 'Portable computers with batteries and various electronic components',
    hazardousMaterials: ['Mercury', 'Lead', 'Cadmium', 'Lithium', 'Flame retardants'],
    recyclingComplexity: 'high',
    rewardMultiplier: 5.0,
    averageLifespan: 5,
    color: '#8b5cf6',
    icon: '💻'
  },
  TABLET: {
    id: 'TABLET',
    name: 'Tablet',
    category: 'computers',
    description: 'Touchscreen tablets with lithium batteries and displays',
    hazardousMaterials: ['Lithium', 'Indium', 'Rare earth elements'],
    recyclingComplexity: 'high',
    rewardMultiplier: 2.5,
    averageLifespan: 4,
    color: '#06b6d4',
    icon: '📟'
  },
  TV: {
    id: 'TV',
    name: 'Television',
    category: 'appliances',
    description: 'LCD, LED, or OLED televisions with various electronic components',
    hazardousMaterials: ['Mercury', 'Lead', 'Cadmium', 'Flame retardants'],
    recyclingComplexity: 'medium',
    rewardMultiplier: 4.0,
    averageLifespan: 8,
    color: '#ef4444',
    icon: '📺'
  },
  BATTERY_LITHIUM: {
    id: 'BATTERY_LITHIUM',
    name: 'Lithium Battery',
    category: 'batteries',
    description: 'Rechargeable lithium-ion batteries from various devices',
    hazardousMaterials: ['Lithium', 'Cobalt', 'Nickel', 'Electrolytes'],
    recyclingComplexity: 'specialized',
    rewardMultiplier: 2.0,
    averageLifespan: 3,
    color: '#f59e0b',
    icon: '🔋'
  },
  HEADPHONES: {
    id: 'HEADPHONES',
    name: 'Headphones/Earbuds',
    category: 'other',
    description: 'Audio devices with small batteries and electronic components',
    hazardousMaterials: ['Lithium', 'Rare earth elements', 'Plastic polymers'],
    recyclingComplexity: 'medium',
    rewardMultiplier: 1.5,
    averageLifespan: 2,
    color: '#10b981',
    icon: '🎧'
  },
  CABLES: {
    id: 'CABLES',
    name: 'Electronic Cables',
    category: 'cables',
    description: 'Various electronic cables and adapters',
    hazardousMaterials: ['Copper', 'PVC', 'Lead (older cables)'],
    recyclingComplexity: 'low',
    rewardMultiplier: 0.5,
    averageLifespan: 5,
    color: '#64748b',
    icon: '🔌'
  },
  GAME_CONSOLE: {
    id: 'GAME_CONSOLE',
    name: 'Gaming Console',
    category: 'appliances',
    description: 'Video game consoles and gaming accessories',
    hazardousMaterials: ['Lead', 'Mercury', 'Flame retardants', 'Rare earth elements'],
    recyclingComplexity: 'high',
    rewardMultiplier: 4.5,
    averageLifespan: 7,
    color: '#dc2626',
    icon: '🎮'
  }
};

export const getEWasteTypeById = (id: string): EWasteType | null => {
  return E_WASTE_TYPES[id] || null;
};

export const getEWasteTypesByCategory = (category: EWasteType['category']): EWasteType[] => {
  return Object.values(E_WASTE_TYPES).filter(type => type.category === category);
};

export const calculateEWasteReward = (
  ewasteType: EWasteType, 
  condition: 'damaged' | 'functional' | 'like-new',
  hasOriginalPackaging: boolean = false
): number => {
  const baseReward = 15; // Base PLY tokens for e-waste
  
  const conditionMultiplier = {
    damaged: 0.5,
    functional: 1.0,
    'like-new': 1.5
  }[condition];

  const packagingBonus = hasOriginalPackaging ? 1.2 : 1.0;
  
  return Math.round(
    baseReward * 
    ewasteType.rewardMultiplier * 
    conditionMultiplier * 
    packagingBonus * 
    10
  ) / 10;
};

export const getEnvironmentalImpact = (ewasteType: EWasteType): {
  co2Saved: number;
  materialsRecovered: string[];
  energySaved: number;
} => {
  const impactData: Record<string, { co2: number; materials: string[]; energy: number }> = {
    SMARTPHONE: {
      co2: 70, // kg CO2 equivalent
      materials: ['Gold', 'Silver', 'Copper', 'Palladium', 'Lithium'],
      energy: 1200 // kWh
    },
    LAPTOP: {
      co2: 300,
      materials: ['Aluminum', 'Copper', 'Gold', 'Silver', 'Rare earths'],
      energy: 2500
    },
    TV: {
      co2: 500,
      materials: ['Copper', 'Aluminum', 'Glass', 'Plastic'],
      energy: 3000
    },
    BATTERY_LITHIUM: {
      co2: 150,
      materials: ['Lithium', 'Cobalt', 'Nickel', 'Copper'],
      energy: 800
    }
  };

  const data = impactData[ewasteType.id] || { co2: 50, materials: ['Various metals'], energy: 500 };
  
  return {
    co2Saved: data.co2,
    materialsRecovered: data.materials,
    energySaved: data.energy
  };
};

export const identifyEWasteFromImage = async (imageData: string): Promise<{
  ewasteType: EWasteType;
  confidence: number;
  condition: 'damaged' | 'functional' | 'like-new';
  estimatedAge: number;
}> => {
  // Mock AI identification - in production, this would call your AI service
  await new Promise(resolve => setTimeout(resolve, 1500));

  const randomTypes = Object.values(E_WASTE_TYPES);
  const randomType = randomTypes[Math.floor(Math.random() * randomTypes.length)];
  
  return {
    ewasteType: randomType,
    confidence: 0.80 + Math.random() * 0.15, // 80-95% confidence
    condition: ['damaged', 'functional', 'like-new'][Math.floor(Math.random() * 3)] as any,
    estimatedAge: Math.floor(Math.random() * randomType.averageLifespan * 2) + 1
  };
};
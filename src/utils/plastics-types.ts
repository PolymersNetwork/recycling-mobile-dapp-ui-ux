export interface PlasticType {
  id: string;
  name: string;
  code: string;
  recyclingCode: number;
  description: string;
  commonUses: string[];
  recyclingDifficulty: 'easy' | 'medium' | 'hard';
  rewardMultiplier: number;
  color: string;
  icon: string;
}

export const PLASTIC_TYPES: Record<string, PlasticType> = {
  PET: {
    id: 'PET',
    name: 'Polyethylene Terephthalate',
    code: 'PET',
    recyclingCode: 1,
    description: 'Most commonly recycled plastic, used for bottles and containers',
    commonUses: ['Water bottles', 'Soda bottles', 'Food containers', 'Polyester clothing'],
    recyclingDifficulty: 'easy',
    rewardMultiplier: 1.0,
    color: '#22c55e',
    icon: '♻️'
  },
  HDPE: {
    id: 'HDPE',
    name: 'High-Density Polyethylene',
    code: 'HDPE',
    recyclingCode: 2,
    description: 'Durable plastic commonly used for containers and pipes',
    commonUses: ['Milk jugs', 'Detergent bottles', 'Shopping bags', 'Plastic lumber'],
    recyclingDifficulty: 'easy',
    rewardMultiplier: 1.1,
    color: '#3b82f6',
    icon: '🥛'
  },
  PVC: {
    id: 'PVC',
    name: 'Polyvinyl Chloride',
    code: 'PVC',
    recyclingCode: 3,
    description: 'Versatile but difficult to recycle plastic',
    commonUses: ['Pipes', 'Wire insulation', 'Medical devices', 'Flooring'],
    recyclingDifficulty: 'hard',
    rewardMultiplier: 1.5,
    color: '#ef4444',
    icon: '🔧'
  },
  LDPE: {
    id: 'LDPE',
    name: 'Low-Density Polyethylene',
    code: 'LDPE',
    recyclingCode: 4,
    description: 'Flexible plastic used for bags and films',
    commonUses: ['Plastic bags', 'Food wrap', 'Squeeze bottles', 'Flexible lids'],
    recyclingDifficulty: 'medium',
    rewardMultiplier: 1.2,
    color: '#f59e0b',
    icon: '🛍️'
  },
  PP: {
    id: 'PP',
    name: 'Polypropylene',
    code: 'PP',
    recyclingCode: 5,
    description: 'Heat-resistant plastic with good chemical resistance',
    commonUses: ['Yogurt containers', 'Bottle caps', 'Straws', 'Automotive parts'],
    recyclingDifficulty: 'medium',
    rewardMultiplier: 1.1,
    color: '#8b5cf6',
    icon: '🍶'
  },
  PS: {
    id: 'PS',
    name: 'Polystyrene',
    code: 'PS',
    recyclingCode: 6,
    description: 'Lightweight plastic, often expanded into foam',
    commonUses: ['Disposable cups', 'Takeout containers', 'Packaging foam', 'CD cases'],
    recyclingDifficulty: 'hard',
    rewardMultiplier: 1.3,
    color: '#ec4899',
    icon: '☕'
  },
  OTHER: {
    id: 'OTHER',
    name: 'Other Plastics',
    code: 'OTHER',
    recyclingCode: 7,
    description: 'Mixed or specialized plastics',
    commonUses: ['Multi-layer packaging', 'Electronics', 'Automotive parts', 'Specialty items'],
    recyclingDifficulty: 'hard',
    rewardMultiplier: 1.8,
    color: '#64748b',
    icon: '📱'
  }
};

export const getPlasticTypeByCode = (code: string): PlasticType | null => {
  const upperCode = code.toUpperCase();
  return PLASTIC_TYPES[upperCode] || null;
};

export const getPlasticTypeByRecyclingCode = (recyclingCode: number): PlasticType | null => {
  return Object.values(PLASTIC_TYPES).find(type => type.recyclingCode === recyclingCode) || null;
};

export const calculateReward = (plasticType: PlasticType, weight: number, condition: 'poor' | 'fair' | 'good' | 'excellent'): number => {
  const baseReward = 5; // Base PLY tokens per item
  const weightMultiplier = Math.min(weight * 0.1, 2); // Max 2x for weight
  
  const conditionMultiplier = {
    poor: 0.5,
    fair: 0.8,
    good: 1.0,
    excellent: 1.2
  }[condition];

  return Math.round(baseReward * plasticType.rewardMultiplier * weightMultiplier * conditionMultiplier * 10) / 10;
};

export const identifyPlasticFromImage = async (imageData: string): Promise<{
  plasticType: PlasticType;
  confidence: number;
  condition: 'poor' | 'fair' | 'good' | 'excellent';
  estimatedWeight: number;
}> => {
  // Mock AI identification - in production, this would call your AI service
  await new Promise(resolve => setTimeout(resolve, 1000));

  const randomTypes = Object.values(PLASTIC_TYPES);
  const randomType = randomTypes[Math.floor(Math.random() * randomTypes.length)];
  
  return {
    plasticType: randomType,
    confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
    condition: ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)] as any,
    estimatedWeight: 0.1 + Math.random() * 0.9 // 0.1-1.0 kg
  };
};
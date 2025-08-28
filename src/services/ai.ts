interface PlasticDetection {
  type: string;
  confidence: number;
  estimatedWeight: number;
  recyclable: boolean;
  suggestions: string[];
}

interface EcoTip {
  title: string;
  description: string;
  impact: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export class AIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  }

  async detectPlastic(imageData: string): Promise<PlasticDetection> {
    // Mock AI plastic detection
    // In production, this would use TensorFlow Lite or cloud AI
    const plasticTypes = ['PET Bottle', 'HDPE Container', 'PP Cup', 'LDPE Bag', 'PS Container'];
    const randomType = plasticTypes[Math.floor(Math.random() * plasticTypes.length)];
    
    return {
      type: randomType,
      confidence: 0.85 + Math.random() * 0.14,
      estimatedWeight: 0.1 + Math.random() * 0.9,
      recyclable: Math.random() > 0.1,
      suggestions: [
        'Clean before recycling',
        'Remove labels if possible',
        'Check local recycling guidelines'
      ]
    };
  }

  async generateEcoTips(userContext: {
    recycledWeight: number;
    location: string;
    preferences: string[];
  }): Promise<EcoTip[]> {
    // Mock eco tips generation
    // In production, this would use OpenAI GPT API
    const tips: EcoTip[] = [
      {
        title: 'Use Reusable Water Bottles',
        description: 'Switch to a reusable water bottle to reduce plastic waste.',
        impact: 'Saves 156 plastic bottles per year',
        difficulty: 'easy'
      },
      {
        title: 'Compost Organic Waste',
        description: 'Start composting food scraps to reduce methane emissions.',
        impact: 'Reduces CO₂ by 0.5 tons annually',
        difficulty: 'medium'
      },
      {
        title: 'Walk or Bike Short Distances',
        description: 'Use active transportation for trips under 2 miles.',
        impact: 'Saves 2.6 lbs CO₂ per mile',
        difficulty: 'easy'
      }
    ];

    return tips;
  }

  async analyzeRecyclingPattern(history: any[]): Promise<{
    efficiency: number;
    recommendations: string[];
    carbonSaved: number;
  }> {
    // Mock pattern analysis
    const totalWeight = history.reduce((sum, item) => sum + (item.weight || 0), 0);
    
    return {
      efficiency: Math.min(95, 60 + totalWeight * 2),
      recommendations: [
        'Try to recycle more consistently',
        'Focus on heavier items for bigger impact',
        'Join community clean-up events'
      ],
      carbonSaved: totalWeight * 2.1 // kg CO₂ saved per kg recycled
    };
  }

  async detectFraud(recycleData: any): Promise<{
    isFraud: boolean;
    confidence: number;
    reasons: string[];
  }> {
    // Mock fraud detection
    const suspiciousFactors = [];
    
    if (recycleData.weight > 5) {
      suspiciousFactors.push('Unusually high weight');
    }
    
    if (recycleData.confidence < 0.7) {
      suspiciousFactors.push('Low AI confidence');
    }

    return {
      isFraud: suspiciousFactors.length > 1,
      confidence: Math.random() * 0.3 + 0.7,
      reasons: suspiciousFactors
    };
  }
}

export const aiService = new AIService();
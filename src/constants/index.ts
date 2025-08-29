export const ROUTES = {
  HOME: '/',
  SCAN: '/scan',
  PROJECTS: '/projects',
  MARKETPLACE: '/marketplace',
  PORTFOLIO: '/portfolio',
  PROFILE: '/profile',
  PROJECT_DETAIL: '/projects/:id',
  SUBMISSION_DETAIL: '/submissions/:id',
  MARKETPLACE_ITEM: '/marketplace/:id',
} as const;

export const WALLET_TYPES = {
  PHANTOM: 'phantom',
  SOLFLARE: 'solflare', 
  BACKPACK: 'backpack',
  SUI: 'sui',
} as const;

export const TOKEN_METADATA = {
  POLY: {
    symbol: 'POLY',
    name: 'Polymer Token',
    decimals: 9,
    color: '#1B5E20',
  },
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    color: '#9945FF',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    color: '#2775CA',
  },
  SUI: {
    symbol: 'SUI',
    name: 'Sui',
    decimals: 9,
    color: '#4DA9FF',
  },
} as const;

export const PLASTIC_TYPES = [
  'PET',
  'HDPE',
  'PVC',
  'LDPE',
  'PP',
  'PS',
  'OTHER',
] as const;

export const REWARD_THRESHOLDS = {
  DAILY_SCAN: 10,
  WEEKLY_SCAN: 50,
  MONTHLY_SCAN: 200,
  HIGH_CONFIDENCE: 0.8,
  VERIFIED_SUBMISSION: 25,
} as const;

export const PROJECT_CATEGORIES = [
  'renewable',
  'conservation',
  'cleanup',
  'education',
] as const;

export const BADGE_RARITIES = [
  'common',
  'rare', 
  'epic',
  'legendary',
] as const;

export const NOTIFICATION_TYPES = [
  'reward',
  'challenge',
  'project',
  'system',
] as const;

export const COLORS = {
  ECO_PRIMARY: '#1B5E20',
  ECO_PRIMARY_LIGHT: '#A5D6A7',
  ECO_SUCCESS: '#4CAF50',
  ECO_WARNING: '#FF9800',  
  ECO_DANGER: '#F44336',
  WHITE: '#FFFFFF',
  LIGHT_GRAY: '#F5F5F5',
  DARK_GRAY: '#333333',
  SEMI_BLACK: '#00000033',
} as const;
# 🟢 Polymers Platform – Monorepo

The Polymers Platform is a full-stack, gamified recycling ecosystem built on Solana and Expo/React Native, combining token rewards, NFT badges, interactive dashboards, and IoT-enabled recycling stations.

## 📱 Mobile App Screens & Components

### Core Screens

| Screen | Description |
|--------|-------------|
| **Dashboard** | Wallet summary (POLY/SOL balances), rewards cards, streaks, and leaderboard of top recyclers. |
| **Scan Bin** | Camera-based QR/NFC scanning, interactive map pins showing nearby recycling stations. |
| **Upload Proof** | Capture photos or upload IoT sensor data to validate recycling events. |
| **Reward Preview** | Real-time calculation panel for POLY, SOL, USDC earned per recycling action. |
| **Claim Reward** | Solana Pay integration for instant redemption of earned tokens. |
| **Donate to NGO** | Select tokens for donation, confirm transaction, and track impact metrics. |
| **PoR NFT Viewer** | NFT card display with metadata, QR codes, and badge animations. |
| **Batch Submission** | Multi-upload component for submitting multiple recycling proofs with progress tracking. |
| **Challenges** | Gamified eco-challenges with streak tracking, progress bars, and leaderboard rankings. |
| **Corporate Dashboard** | ESG-focused NFT viewer, audit reports, and corporate sustainability analytics. |

### UI Components
- **Gradient Buttons** – Eco-friendly design system, consistent branding.
- **Animated Counters** – Live updates of POLY/CRT balances and eco actions.
- **ParticleEngine Effects** – Coin and sparkle bursts on token earning, NFT unlocks, and purchases.
- **NFT Galleries** – Display unlocked NFTs, metadata, and rarity badges.
- **Interactive Maps** – Show recycling bin locations with clickable pins.
- **Progress Tracking** – Weekly challenges, streaks, and milestone indicators.
- **Notifications** – Push/SMS alerts for milestones, badges, and leaderboard updates.

## ⚡ Key Features
- **Live Wallet Integration** – Connect mobile wallets (Solana Mobile Wallet Adapter).
- **Automatic PLY Token Minting** – On recycling scans, contributions, and purchases.
- **NFT Badge Minting** – Candy Machine integration with particle animations.
- **Gamified Interactions** – Live updates, particle bursts, and animated badges.
- **IoT-Enabled Recycling Machines** – Supports Raspberry Pi and sensor data submissions.
- **Leaderboard & Challenges** – Encourage eco-friendly actions through gamification.
- **Reusable Components** – Works across mobile and web dashboard.

## 🛠️ Tech Stack
- **Frontend**: React Native (Expo), TailwindCSS, React Navigation
- **Backend**: Express + Prisma + PostgreSQL
- **Blockchain**: Solana Web3.js, SPL Token, Metaplex Candy Machine for NFTs
- **Payments**: Solana Pay integration
- **IoT / Hardware**: Raspberry Pi, NFC/QR-enabled recycling stations
- **State Management**: Context + Hooks (usePortfolio, RecyclingProvider, WalletProvider)

## 🔧 Environment Variables

Set these in `.env.local` or on Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_MINT_API_URL=https://api.actions.polymers.net/mint
TOKEN_PROGRAM_ID=TokenkegQfeZyiNwAJbNbGKPFXkQd5J8X8wnF8MPzYx
NFT_PROGRAM_ID=gEb7nD9yLkau1P4uyMdke9byJNrat61suH4vYiPUuiR
DEFAULT_WALLET_ADDRESS=gEb7nD9yLkau1P4uyMdke9byJNrat61suH4vYiPUuiR
WALLETCONNECT_BRIDGE=https://bridge.walletconnect.org
METADATA_SERVICE_URL=https://api.example.com/upload-metadata
ERROR_TRACKING_SERVICE_URL=https://errors.example.com/report
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-key-here
NODE_ENV=development
```

## 🎮 Usage

### Recycling
1. Open **Scan Bin** screen.
2. Point camera at a recycling station QR/NFC code.
3. Earn PLY tokens automatically.
4. Receive NFT badge rewards for milestones.
5. Observe particle animations and live balance updates.

### Marketplace
1. Navigate to **Marketplace**.
2. Choose an item (eco products, carbon credits, donations).
3. Confirm purchase.
4. Tokens are deducted from wallet.
5. NFT badges mint with particle effects, balances update live.

## 🏗️ Monorepo Structure

```
/polymers-platform
├─ /apps
│  ├─ /mobile       # Expo React Native app
│  ├─ /dashboard    # Web React dashboard
├─ /packages
│  ├─ /contexts     # WalletProvider, RecyclingProvider, PortfolioContext
│  ├─ /hooks        # usePortfolio, useWallet, useRewards
│  ├─ /components
│  │  ├─ /ui        # EcoCard, EcoButton, AnimatedBadge, AnimatedCounter
│  │  ├─ /particles # ParticleEngine, ParticleTrigger
│  ├─ /types        # TypeScript interfaces (Users, Projects, Marketplace, Badges)
│  ├─ /utils        # Tokens, NFT, Rewards, Charts, SolanaHelpers
│  ├─ /actions      # Contributions, Purchases, NFT Minting
│  ├─ /services     # Backend API, Solana Pay, IoT integration
│  ├─ /constants    # App constants, colors, endpoints
├─ /programs        # On-chain programs and smart contracts
├─ /backend         # Express + Prisma API
├─ App.tsx          # Main entry point (navigation + providers)
├─ package.json
├─ tsconfig.json
├─ README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- iOS Simulator (Mac only) or Android Studio for mobile testing

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd polymers-platform

# Install dependencies
npm install

# Start development server (web)
cd apps/dashboard
npm run dev

# Start mobile development
cd apps/mobile
npm start
```

### 📱 Mobile Development with Capacitor

This app uses **Capacitor** for native mobile functionality:

```bash
# Build the web app
npm run build

# Add mobile platforms
npx cap add ios     # Mac only
npx cap add android

# Sync web code to native platforms  
npx cap sync

# Run on device/simulator
npx cap run ios
npx cap run android
```

**Important**: After any code changes, run `npm run build` then `npx cap sync` to update the mobile apps.

## 🔗 Backend Integration Required

⚠️ **Important**: For full functionality, you must connect your Lovable project to **Supabase** using our native integration:

1. Click the green **Supabase** button on the top right of your Lovable interface
2. Connect your Supabase account
3. This enables all backend functionality

### 🔐 Backend Features (Requires Supabase Connection):
- **Authentication**: Email/password login system
- **Database**: Store user profiles, submissions, projects
- **File Storage**: Upload scan images and documents  
- **Real-time**: Live updates across devices
- **Edge Functions**: Backend APIs for AI processing
- **Push Notifications**: Automated reward notifications
- **Analytics**: Track user behavior and app performance

## 🏆 Roadmap
- ✅ Animated counters & particles
- ✅ NFT badge integration
- ✅ Marketplace gamification
- ✅ IoT recycling machine integration
- 🔜 Leaderboards & social sharing
- 🔜 Cross-chain rewards
- 🔜 Corporate ESG dashboards and audit reports

---

**Ready to build a sustainable future?** 🌱 Enhanced with beautiful mobile-first design!

[Connect to Supabase](https://docs.lovable.dev/integrations/supabase/) to unlock full functionality!
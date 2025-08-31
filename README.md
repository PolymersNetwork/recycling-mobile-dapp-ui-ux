🌍 Polymers Network Mobile App

An Expo React Native app for recycling tracking, rewards, and corporate ESG management. Users earn PLY tokens for verified recycling, unlock NFT badges, and interact with a fully gamified, blockchain-powered ecosystem.

⸻

🚀 Features

♻️ Recycle & Scan
	•	AI Camera Scan: Detect plastic type and estimate weight.
	•	NFC Scan: Tap NFC-enabled items for instant verification.
	•	Instant Rewards: Earn PLY tokens proportional to recycled weight.
	•	Particle Effects: Coins, sparkles, and bursts animate rewards.
	•	NFT Badges: Unlock eco badges at milestone contributions.

🛍️ Marketplace
	•	Redeem PLY/CRT tokens for:
	•	Carbon credits
	•	Eco-friendly products
	•	Tree planting donations
	•	Visual Feedback: Particle bursts and badge animations on purchases.
	•	NFT Minting: Automatically mint Candy Machine NFTs for eco achievements.

👤 Profile & Settings
	•	Live Balances: PLY and CRT token counters.
	•	Animated Badges: View unlocked NFTs with professional animations.
	•	User Preferences: Manage wallet, notifications, and theme (dark/light).

🏢 Corporate Dashboard
	•	Stake & Burn CRT to generate ESG proofs.
	•	Carbon Offset History: On-chain transactions with TX links and copy-to-clipboard.
	•	NFT Badges: Threshold-based NFT rewards for corporate sustainability milestones.
	•	Gamified Analytics: Particle effects & animated counters for engagement.

📊 Gamification
	•	Leaderboards for recyclers and corporate participants.
	•	Streak tracking and milestone badges.
	•	Historical charts and contribution analytics.
	•	Real-time on-chain verification via Solana Pay and Helius events.

⸻

🧩 Tech Stack
	•	Expo & React Native (Mobile cross-platform)
	•	TypeScript for type safety
	•	React Navigation & Expo Router for tab navigation
	•	Solana Web3.js + Metaplex SDK for blockchain interactions
	•	SPL Tokens (PLY & CRT)
	•	ParticleEngine for gamified animations
	•	Firebase Analytics for tracking
	•	Supabase for backend data
	•	Resend / Email for notifications
	•	Clerk for authentication
	•	Circle & Solana Pay for payments
	•	DePIN IoT integration for hardware verification

⸻

📂 Folder Structure

/app
  /screens
    RecycleScreen.tsx
    MarketplaceScreen.tsx
    ProfileScreen.tsx
    SettingsScreen.tsx
    CorporateDashboard.tsx

/contexts
  RewardsContext.tsx
  ParticleContext.tsx
  WalletContext.tsx

/hooks
  useScan.ts
  useLocation.ts
  useRewards.ts
  usePortfolio.ts

/components
  AnimatedBadge.tsx
  AnimatedCounter.tsx
  GradientBackground.tsx
  ParticleEngine.tsx
  ActionButton.tsx

/utils
  api.ts
  blockchain.ts
  nft.ts
  rewards.ts
  tokens.ts
  analytics.ts
  charts.ts
  constants.ts
  types.ts
  email.ts
  payments.ts

/services
  solanaHelpers.ts
  notifications.ts
  walletAdapters.ts


⸻

⚡ Environment Variables

Set these in .env or .env.local:

# Solana
VITE_APP_SOLANA_CLUSTER=devnet
VITE_APP_SOLANA_RPC=https://api.devnet.solana.com
VITE_APP_SOLANA_MAINNET_RPC=https://api.mainnet-beta.solana.com
VITE_APP_HELIUS_API_KEY=your_helius_api_key

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# NFT Programs
VITE_POLYMER_PROGRAM_ID=YourPolymerProgram111111111111111111111111111
VITE_MARKETPLACE_PROGRAM_ID=YourMarketplace11111111111111111111111111
VITE_REWARDS_PROGRAM_ID=YourRewards11111111111111111111111111111111

# Tokens
POLY_MINT=YourPolyMint111111111111111111111111111111111
CRT_MINT=YourCRTTokenMint1111111111111111111111111111


⸻

📦 Installation

# Clone repo
git clone https://github.com/PolymersNetwork/polymers-mobile-app.git
cd polymers-mobile-app

# Install dependencies
npm install
# or
yarn install

# Start Expo
npx expo start


⸻

🎮 Usage
	1.	Recycle
	•	Scan plastic with camera or NFC.
	•	Earn PLY tokens instantly.
	•	Unlock NFT badges with milestone contributions.
	•	Watch ParticleEngine bursts for rewards.
	2.	Marketplace
	•	Redeem PLY/CRT tokens.
	•	Purchase carbon credits, eco products, or NFTs.
	•	Animated counters and NFT badge unlocks trigger automatically.
	3.	Profile & Settings
	•	Check live PLY/CRT balances.
	•	Manage wallet, notifications, and theme.
	•	View unlocked NFT badges with animated effects.
	4.	Corporate Dashboard
	•	Stake/Burn CRT for ESG proofs.
	•	Monitor Carbon Offset History with TX links.
	•	View NFT badge rewards for milestones.
	•	Real-time blockchain verification with Solana Pay + Helius events.

⸻

🏗 Roadmap
	•	✅ Recycle & Scan with AI/NFC
	•	✅ Rewards with PLY/CRT tokens
	•	✅ ParticleEngine gamification
	•	✅ NFT badges via Candy Machine
	•	✅ Marketplace with token redemption
	•	✅ Corporate Dashboard with ESG proofs
	•	🔜 Leaderboards & social sharing
	•	🔜 Multi-chain wallet support
	•	🔜 DePIN IoT network expansion

⸻

📄 License

MIT © 2025 Polymers Network

📱 Polymers – Mobile-First Circular Economy App

Polymers is a mobile-first circular economy application that rewards users for eco-friendly behavior, plastic collection, energy saving, and community contributions. The app integrates Web3 wallets, AI plastic detection, IoT verification, Supabase backend, offline-first queue, gamification, crowdfunding, marketplace, and analytics, all in a sleek, professional UI.

⸻

Features

Plastic Collection & Rewards
	•	Capture plastic waste via camera.
	•	On-device AI detection + confidence scoring.
	•	IoT verification prevents fake submissions.
	•	Rewards in $POLY tokens credited to connected wallets.
	•	Offline queue with automatic background sync and retry logic.

Multi-Chain Wallet & Portfolio
	•	Supports Solana (Phantom, Solflare, Backpack) and SUI wallets.
	•	Unified portfolio screen showing $POLY, USDC, SOL, SUI balances.
	•	Real-time sync with blockchain and Supabase events.
	•	Portfolio analytics with trends, total rewards, and achievements.

Crowdfunding & Community Projects
	•	Browse eco-projects from Supabase.
	•	Contribute using $POLY or USDC.
	•	Track contributions in Portfolio and Project screens.
	•	Earn gamified badges for community support.

Marketplace
	•	Buy, sell, or donate carbon credits and eco-items.
	•	Real-time updates and transaction validation.
	•	Transactions reflected in portfolio balances.

Gamification & AI Eco-Coach
	•	Daily streaks, badges, levels, and leaderboards.
	•	AI Eco-Coach provides personalized challenges and energy-saving tips.
	•	Gamified achievements trigger token bonuses.

Offline-First & Background Sync
	•	Persistent SQLite queue for submissions and wallet actions.
	•	Intelligent background sync prioritizing high-confidence actions.
	•	Automatic retries with conflict resolution against Supabase events.

Impact Analytics & Social Sharing
	•	Track personal CO₂ reduction and community impact.
	•	Share badges and milestones on social media.
	•	Visual charts for contributions and eco-progress.

Push Notifications
	•	Streak reminders, AI challenge updates, project milestones, reward notifications.
	•	Triggered via Supabase events and Expo Push Notifications.
	•	Customizable notification preferences.

⸻

Tech Stack
	•	Frontend: React Native + Expo + TypeScript
	•	Wallets: Phantom, Solflare, Backpack (Solana), SUI Wallet
	•	Backend: Supabase (Auth, Database, Storage, Realtime)
	•	AI: TensorFlow Lite for on-device plastic detection
	•	Offline Storage: SQLite + AsyncStorage
	•	Networking: Axios + Web3 RPC
	•	Notifications: Expo Push + Supabase triggers
	•	Other: Expo Camera, ImageManipulator, BackgroundFetch / TaskManager

⸻

Project Structure

/react_native_starter
├─ /assets          # images, icons, fonts
├─ /constants       # colors, tokens, routes, env
├─ /data            # sample data
├─ /screens         # Home, Scan, Projects, Marketplace, Portfolio, Profile, AI Coach
├─ /hooks           # useWallet, usePortfolio, useSubmissions, useProjects, useMarketplace
├─ /router          # AppRouter, routingUtils
├─ /services        # supabase, wallets, tokens, ai, sync, notifications
├─ /actions         # submissionActions, projectActions, marketplaceActions
├─ App.tsx
├─ package.json
└─ README.md


⸻

Installation
	1.	Clone the repository

git clone https://github.com/your-username/polymers-app.git
cd polymers-app

	2.	Install dependencies

yarn install
# or
npm install

	3.	Set up environment variables (.env)

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_MINT_API_URL=https://api.actions.barkprotocol.net/mint

	4.	Run the app

expo start

	5.	Install Expo Go on your device or run simulator for iOS/Android.

⸻

Key Screens
	•	Home: Dashboard, rewards, quick actions
	•	Scan: Plastic submission workflow (camera + AI + IoT)
	•	Projects: Crowdfunding list + contributions
	•	Marketplace: Carbon credits / eco-items
	•	Portfolio: Unified wallet balances, analytics
	•	Profile / AI Coach: Badges, eco-challenges, settings

⸻

Usage
	1.	Connect your wallet (Phantom, Solflare, Backpack, SUI).
	2.	Scan and submit plastic waste to earn $POLY.
	3.	Contribute to eco-projects or buy carbon credits.
	4.	Track achievements, rewards, and eco-impact in Portfolio and AI Coach.
	5.	Enable push notifications to stay on top of challenges and rewards.

⸻

Offline & Background Sync
	•	Submissions and transactions persist offline in a SQLite queue.
	•	Automatic background sync updates Supabase and wallet balances.
	•	Retry failed submissions with intelligent conflict resolution.

⸻

UI / UX
	•	Professional, sleek design: black, white, light gray, dark green, dark gray
	•	Typography: Oswald (titles), Poppins Light (body), Syne (badges)
	•	Buttons: Dark green gradient, rounded, smooth press animation
	•	Cards: Light gray with shadow, subtle elevation, rounded corners
	•	Animations: Progress bars, AI detection overlay, screen transitions

⸻

Contributing
	•	Fork the repo and submit pull requests for bug fixes, features, or UI improvements.
	•	Follow TypeScript and React Native best practices.

⸻

License

MIT License © 2025 Polymers Project

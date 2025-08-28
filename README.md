# 🌱 Polymers v1.0 - Mobile Eco App

A comprehensive mobile-first sustainability application built with React, Capacitor, and TypeScript. Polymers gamifies environmental action by rewarding users for plastic collection, eco-project contributions, and sustainable behaviors.

## ✨ Features

### 🎯 Core Functionality
- **AI Plastic Detection**: Scan and identify plastic waste using camera + AI
- **Token Rewards**: Earn POLY tokens for verified environmental actions
- **Multi-Chain Wallets**: Support for Phantom, Solflare, Backpack (Solana), SUI wallets
- **Crowdfunding**: Contribute to environmental projects with real impact tracking
- **Carbon Marketplace**: Buy, sell, and donate carbon credits
- **Gamification**: Levels, badges, streaks, and daily challenges
- **Offline-First**: Queue actions when offline, sync when connected

### 📱 Mobile Experience  
- **Progressive Web App**: Installable on iOS/Android via Capacitor
- **Native Camera**: Direct camera access for plastic scanning
- **Push Notifications**: Real-time updates on rewards and challenges
- **Responsive Design**: Optimized for all screen sizes with mobile-first approach
- **Touch Gestures**: Intuitive mobile interactions with smooth animations

### 🎨 Design System
- **Eco Theme**: Dark green (#1B5E20) and light green (#A5D6A7) palette
- **Typography**: Sora display font + Inter body text with proper font loading
- **Animations**: Smooth transitions, micro-interactions, and glassmorphism effects
- **Cards**: Enhanced with shadows, gradients, and hover effects
- **Mobile-First**: Optimized spacing, typography, and touch targets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- iOS Simulator (Mac only) or Android Studio for mobile testing

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd polymers-mobile-app

# Install dependencies
npm install

# Start development server
npm run dev
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

## 🎨 Enhanced Design System

### Typography & Fonts
- **Display Font**: Sora (headings, titles, brands) - loaded via Google Fonts
- **Body Font**: Inter (paragraphs, UI text, forms) - anti-aliased rendering
- **Font Weights**: 300-800 available with proper fallbacks

### Enhanced Card System
```tsx
<EcoCard variant="eco" className="shadow-glow animate-fade-in">
  <EcoCardHeader>
    <EcoCardTitle>Enhanced Cards</EcoCardTitle>
  </EcoCardHeader>
  <EcoCardContent>
    - Better spacing and responsive design
    - Glassmorphism effects and gradients
    - Smooth hover animations
    - Mobile-optimized touch targets
  </EcoCardContent>
</EcoCard>
```

### Mobile-First Improvements
- ✅ **Better Spacing**: Optimized padding and margins for mobile screens
- ✅ **Enhanced Cards**: Multiple variants with shadows, gradients, and animations
- ✅ **Responsive Typography**: Proper scaling across all screen sizes
- ✅ **Touch Interactions**: Larger touch targets and feedback animations
- ✅ **Loading States**: Skeleton screens and smooth transitions
- ✅ **Accessibility**: WCAG compliant with proper contrast and focus states

## 📱 Updated Features

### ✅ Enhanced UI Components:
- 🎨 **Hero Stats Card**: Gradient background with animated elements
- 📊 **Quick Stats Grid**: Three-column layout with icon indicators  
- 🏆 **Enhanced Challenges**: Better visual hierarchy and progress tracking
- 📈 **Activity Feed**: Improved spacing and badge system
- 💫 **Smooth Animations**: Fade-in, slide-up, and bounce effects
- 🎯 **Action Buttons**: Enhanced with hover effects and better sizing

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Mobile**: Capacitor for iOS/Android deployment
- **Styling**: Tailwind CSS with custom eco theme + enhanced design tokens
- **UI Components**: shadcn/ui with custom eco variants
- **Fonts**: Google Fonts (Sora + Inter) with proper loading
- **Animations**: Custom CSS animations with Tailwind utilities

## 📄 License

This project is licensed under the MIT License.

---

**Ready to build a sustainable future?** 🌱 Enhanced with beautiful mobile-first design!

[Connect to Supabase](https://docs.lovable.dev/integrations/supabase/) to unlock full functionality!

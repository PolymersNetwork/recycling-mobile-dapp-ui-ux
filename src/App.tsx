import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter, SolflareWalletAdapter, BackpackWalletAdapter } from "@solana/wallet-adapter-wallets";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { RecyclingProvider } from "./contexts/RecyclingContext";

import { Home } from "./screens/Home";
import { Scan } from "./screens/Scan";
import { RecycleScreen } from "./screens/RecycleScreen";
import { Projects } from "./screens/Projects";
import { Portfolio } from "./screens/Portfolio";
import { Profile } from "./screens/Profile";
import { Marketplace } from "./screens/Marketplace";

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Bottom Tabs Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          if (route.name === "Home") iconName = "home";
          if (route.name === "Scan") iconName = "qr-code";
          if (route.name === "Recycle") iconName = "leaf";
          if (route.name === "Projects") iconName = "cube";
          if (route.name === "Portfolio") iconName = "wallet";
          if (route.name === "Profile") iconName = "person";
          if (route.name === "Marketplace") iconName = "cart";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Scan" component={Scan} />
      <Tab.Screen name="Recycle" component={RecycleScreen} />
      <Tab.Screen name="Projects" component={Projects} />
      <Tab.Screen name="Portfolio" component={Portfolio} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Marketplace" component={Marketplace} />
    </Tab.Navigator>
  );
}

// Main App
export default function App() {
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new BackpackWalletAdapter()];

  return (
    <SafeAreaProvider>
      <ConnectionProvider endpoint={RPC_URL}>
        <WalletProvider wallets={wallets} autoConnect>
          <RecyclingProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <MainTabs />
            </NavigationContainer>
          </RecyclingProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SafeAreaProvider>
  );
}

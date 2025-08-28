import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { WalletProvider } from "@/contexts/WalletContext";
import { RecyclingProvider } from "@/contexts/RecyclingContext";

import { Start } from "@/pages/mobile/Start";
import { Home } from "@/pages/mobile/Home";
import { RecycleScreen } from "@/pages/mobile/RecycleScreen";
import { Marketplace } from "@/pages/mobile/Marketplace";
import { Profile } from "@/pages/mobile/Profile";
import { Projects } from "@/pages/mobile/Projects";
import { Portfolio } from "@/pages/mobile/Portfolio";

import { Toaster } from "@/components/ui/toaster";
import { ParticleEngine } from "@/components/ui/ParticleEngine";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <WalletProvider>
        <RecyclingProvider>
          <NavigationContainer>
            <ParticleEngine />
            <Toaster />
            <Stack.Navigator
              initialRouteName="Start"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Start" component={Start} />
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Recycle" component={RecycleScreen} />
              <Stack.Screen name="Marketplace" component={Marketplace} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="Projects" component={Projects} />
              <Stack.Screen name="Portfolio" component={Portfolio} />
            </Stack.Navigator>
          </NavigationContainer>
        </RecyclingProvider>
      </WalletProvider>
    </SafeAreaProvider>
  );
}

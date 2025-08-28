import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { WalletProvider } from "@/contexts/WalletContext";
import { RecyclingProvider } from "@/contexts/RecyclingContext";

import { Start } from "@/pages/Start";
import { Home } from "@/pages/mobile/Home";
import { Scan } from "@/pages/mobile/Scan";
import { RecycleScreen } from "@/pages/mobile/RecycleScreen";
import { Marketplace } from "@/pages/mobile/Marketplace";
import { Portfolio } from "@/pages/mobile/Portfolio";
import { Profile } from "@/pages/mobile/Profile";

export type RootStackParamList = {
  Start: undefined;
  Home: undefined;
  Scan: undefined;
  Recycle: undefined;
  Marketplace: undefined;
  Portfolio: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <WalletProvider>
        <RecyclingProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Start"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Start" component={Start} />
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Scan" component={Scan} />
              <Stack.Screen name="Recycle" component={RecycleScreen} />
              <Stack.Screen name="Marketplace" component={Marketplace} />
              <Stack.Screen name="Portfolio" component={Portfolio} />
              <Stack.Screen name="Profile" component={Profile} />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="light" />
        </RecyclingProvider>
      </WalletProvider>
    </SafeAreaProvider>
  );
}

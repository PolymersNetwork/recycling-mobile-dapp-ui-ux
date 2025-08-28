import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { WalletProvider } from "@/contexts/WalletContext";
import { RecyclingProvider } from "@/contexts/RecyclingContext";
import { Home } from "@/screens/Home";
import { Marketplace } from "@/screens/Marketplace";
import { Profile } from "@/screens/Profile";
import { Settings } from "@/screens/Settings";
import { Home as HomeIcon, ShoppingCart, User, Settings as SettingsIcon } from "lucide-react-native";
import { View, Text } from "react-native";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <WalletProvider>
      <RecyclingProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: { backgroundColor: "#111", borderTopColor: "#222" },
              tabBarActiveTintColor: "#FFD700",
              tabBarInactiveTintColor: "#888",
            }}
          >
            <Tab.Screen
              name="Home"
              component={Home}
              options={{
                tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
              }}
            />
            <Tab.Screen
              name="Marketplace"
              component={Marketplace}
              options={{
                tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
              }}
            />
            <Tab.Screen
              name="Profile"
              component={Profile}
              options={{
                tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
              }}
            />
            <Tab.Screen
              name="Settings"
              component={Settings}
              options={{
                tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </RecyclingProvider>
    </WalletProvider>
  );
}

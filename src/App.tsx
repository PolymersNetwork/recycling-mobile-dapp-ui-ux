import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { WalletProvider } from "@/contexts/WalletContext";
import { RecyclingProvider } from "@/contexts/RecyclingContext";

import { Home } from "@/screens/Home";
import { Scan } from "@/screens/Scan";
import { RecycleScreen } from "@/screens/RecycleScreen";
import { Marketplace } from "@/screens/Marketplace";
import { Profile } from "@/screens/Profile";
import { Portfolio } from "@/screens/Portfolio";

import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <WalletProvider>
      <RecyclingProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarIcon: ({ color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap = "home";

                switch (route.name) {
                  case "Home":
                    iconName = "home";
                    break;
                  case "Scan":
                    iconName = "camera";
                    break;
                  case "Recycle":
                    iconName = "leaf";
                    break;
                  case "Marketplace":
                    iconName = "cart";
                    break;
                  case "Profile":
                    iconName = "person";
                    break;
                  case "Portfolio":
                    iconName = "stats-chart";
                    break;
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: "#00FFAA",
              tabBarInactiveTintColor: "#888",
            })}
          >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Scan" component={Scan} />
            <Tab.Screen name="Recycle" component={RecycleScreen} />
            <Tab.Screen name="Marketplace" component={Marketplace} />
            <Tab.Screen name="Portfolio" component={Portfolio} />
            <Tab.Screen name="Profile" component={Profile} />
          </Tab.Navigator>
        </NavigationContainer>
      </RecyclingProvider>
    </WalletProvider>
  );
}

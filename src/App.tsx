import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { WalletProvider } from "@/contexts/WalletContext";
import { RecyclingProvider } from "@/contexts/RecyclingContext";
import { Home } from "@/screens/Home";
import { RecycleScreen } from "@/screens/RecycleScreen";
import { Marketplace } from "@/screens/Marketplace";
import { Profile } from "@/screens/Profile";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <WalletProvider>
      <RecyclingProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: { backgroundColor: "#1E1E1E" },
              tabBarActiveTintColor: "#FFD700",
              tabBarInactiveTintColor: "#AAAAAA",
              tabBarIcon: ({ color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap = "home";

                switch (route.name) {
                  case "Home":
                    iconName = "home";
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
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Recycle" component={RecycleScreen} />
            <Tab.Screen name="Marketplace" component={Marketplace} />
            <Tab.Screen name="Profile" component={Profile} />
          </Tab.Navigator>
        </NavigationContainer>
      </RecyclingProvider>
    </WalletProvider>
  );
}

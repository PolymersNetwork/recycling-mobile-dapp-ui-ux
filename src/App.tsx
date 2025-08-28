import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { WalletProvider } from "@/contexts/WalletContext"; // Your Mobile Wallet Adapter context
import { RecyclingProvider } from "@/contexts/RecyclingContext"; // Portfolio + gamification context
import { Home } from "@/screens/Home";
import { Marketplace } from "@/screens/Marketplace";
import { Profile } from "@/screens/Profile";
import { Settings } from "@/screens/Settings";
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
                let iconName: string = "";

                switch (route.name) {
                  case "Home":
                    iconName = "home-outline";
                    break;
                  case "Marketplace":
                    iconName = "cart-outline";
                    break;
                  case "Profile":
                    iconName = "person-outline";
                    break;
                  case "Settings":
                    iconName = "settings-outline";
                    break;
                }

                return <Ionicons name={iconName as any} size={size} color={color} />;
              },
              tabBarActiveTintColor: "#00C48C",
              tabBarInactiveTintColor: "gray",
            })}
          >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Marketplace" component={Marketplace} />
            <Tab.Screen name="Profile" component={Profile} />
            <Tab.Screen name="Settings" component={Settings} />
          </Tab.Navigator>
        </NavigationContainer>
      </RecyclingProvider>
    </WalletProvider>
  );
}

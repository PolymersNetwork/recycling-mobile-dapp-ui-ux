import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Appearance, AppearancePreferences } from "react-native";

interface Theme {
  mode: "light" | "dark";
  colors: {
    background: string;
    card: string;
    text: string;
    primary: string;
    muted: string;
    success: string;
  };
}

const lightColors = {
  background: "#F7F7F7",
  card: "#FFFFFF",
  text: "#1F1F1F",
  primary: "#4CAF50",
  muted: "#E0E0E0",
  success: "#00C851",
};

const darkColors = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  primary: "#00C851",
  muted: "#2C2C2C",
  success: "#00C851",
};

interface ThemeContextProps {
  colors: Theme["colors"];
  mode: Theme["mode"];
}

const ThemeContext = createContext<ThemeContextProps>({
  colors: lightColors,
  mode: "light",
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = Appearance.getColorScheme();
  const [mode, setMode] = useState<"light" | "dark">(colorScheme === "dark" ? "dark" : "light"));
  const colors = mode === "dark" ? darkColors : lightColors;

  useEffect(() => {
    const subscription = Appearance.addChangeListener(
      ({ colorScheme }: AppearancePreferences) => {
        setMode(colorScheme === "dark" ? "dark" : "light");
      }
    );
    return () => subscription.remove();
  }, []);

  return <ThemeContext.Provider value={{ colors, mode }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

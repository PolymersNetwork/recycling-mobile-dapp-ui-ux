import React from "react";
import { Text, TextProps } from "react-native";
import { useTheme } from "../../theme/theme";

export const Typography = ({ children, variant, style, ...props }: TextProps & { variant?: "title" | "body" }) => {
  const { colors } = useTheme();
  const fontSize = variant === "title" ? 18 : 14;
  return (
    <Text style={[{ color: colors.text, fontSize }, style]} {...props}>
      {children}
    </Text>
  );
};

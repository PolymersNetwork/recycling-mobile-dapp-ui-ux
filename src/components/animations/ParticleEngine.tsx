"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { View, Animated, Easing, Dimensions, StyleSheet, Image } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// Coin and sparkle images
const COIN_IMG = require("@/assets/coin.png");
const SPARKLE_IMG = require("@/assets/sparkle.png");

// Badge rarity colors
const rarityColors: Record<string, string> = {
  legendary: "gold",
  epic: "blue",
  rare: "green",
  common: "gray",
};

// Particle type
interface Particle {
  id: string;
  type: "coin" | "sparkle";
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  color?: string;
}

// Methods exposed to parent via ref
export interface ParticleEngineHandle {
  emitCoins: (sourceId: string, amount: number) => void;
  emitSparkles: (sourceId: string, rarity: string) => void;
}

export const ParticleEngine = forwardRef<ParticleEngineHandle>((_, ref) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Helper to create a coin particle
  const createCoin = (x: number, y: number): Particle => {
    const id = Math.random().toString();
    return {
      id,
      type: "coin",
      x: new Animated.Value(x),
      y: new Animated.Value(y),
      scale: new Animated.Value(1),
      rotation: new Animated.Value(Math.random() * 360),
    };
  };

  // Helper to create a sparkle particle
  const createSparkle = (x: number, y: number, color: string): Particle => {
    const id = Math.random().toString();
    return {
      id,
      type: "sparkle",
      x: new Animated.Value(x),
      y: new Animated.Value(y),
      scale: new Animated.Value(0),
      rotation: new Animated.Value(Math.random() * 360),
      color,
    };
  };

  // Animate coin falling with gravity & bounce
  const animateCoin = (particle: Particle) => {
    const gravity = 0.6;
    const bounce = 0.5;
    const duration = 1000 + Math.random() * 500;

    Animated.timing(particle.y, {
      toValue: SCREEN_HEIGHT - 100,
      duration,
      easing: Easing.bounce,
      useNativeDriver: true,
    }).start(() => {
      // Optional: remove particle after animation
      setParticles((prev) => prev.filter((p) => p.id !== particle.id));
    });

    Animated.sequence([
      Animated.timing(particle.rotation, {
        toValue: particle.rotation.__getValue() + 720,
        duration,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(particle.scale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animate sparkle popping
  const animateSparkle = (particle: Particle) => {
    Animated.parallel([
      Animated.timing(particle.scale, {
        toValue: 1.5,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(particle.y, {
        toValue: particle.y.__getValue() - 30,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(particle.rotation, {
        toValue: particle.rotation.__getValue() + 360,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(particle.scale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setParticles((prev) => prev.filter((p) => p.id !== particle.id));
      });
    });
  };

  // Public methods
  useImperativeHandle(ref, () => ({
    emitCoins: (sourceId: string, amount: number) => {
      const sourceX = SCREEN_WIDTH / 2; // For now, center, could map to sourceId's component
      const sourceY = 150;

      const newParticles = Array.from({ length: amount }).map(() => createCoin(sourceX + Math.random() * 50 - 25, sourceY));
      setParticles((prev) => [...prev, ...newParticles]);
      newParticles.forEach(animateCoin);
    },
    emitSparkles: (sourceId: string, rarity: string) => {
      const sourceX = SCREEN_WIDTH / 2;
      const sourceY = 150;
      const color = rarityColors[rarity] || "white";

      const newParticles = Array.from({ length: 8 }).map(() => createSparkle(sourceX + Math.random() * 30 - 15, sourceY, color));
      setParticles((prev) => [...prev, ...newParticles]);
      newParticles.forEach(animateSparkle);
    },
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <Animated.View
          key={p.id}
          style={{
            position: "absolute",
            transform: [
              { translateX: p.x },
              { translateY: p.y },
              { scale: p.scale },
              { rotate: p.rotation.interpolate({ inputRange: [0, 360], outputRange: ["0deg", "360deg"] }) },
            ],
          }}
        >
          <Image
            source={p.type === "coin" ? COIN_IMG : SPARKLE_IMG}
            style={{ width: 24, height: 24, tintColor: p.color || "white" }}
          />
        </Animated.View>
      ))}
    </View>
  );
});

"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { View, Animated, Easing, StyleSheet, Image, findNodeHandle, UIManager } from "react-native";

const SCREEN_WIDTH = 360; // fallback, adjust dynamically if needed
const SCREEN_HEIGHT = 640;

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

// Particle engine methods
export interface ParticleEngineHandle {
  emitCoins: (targetRef: React.RefObject<any>, amount: number) => void;
  emitSparkles: (targetRef: React.RefObject<any>, rarity: string) => void;
}

export const ParticleEngine = forwardRef<ParticleEngineHandle>((_, ref) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Helper to create particle
  const createParticle = (
    x: number,
    y: number,
    type: "coin" | "sparkle",
    color?: string
  ): Particle => {
    const id = Math.random().toString();
    return {
      id,
      type,
      x: new Animated.Value(x),
      y: new Animated.Value(y),
      scale: new Animated.Value(type === "coin" ? 1 : 0),
      rotation: new Animated.Value(Math.random() * 360),
      color,
    };
  };

  // Animate coin with gravity + bounce
  const animateCoin = (p: Particle) => {
    const duration = 800 + Math.random() * 400;
    Animated.parallel([
      Animated.timing(p.y, {
        toValue: SCREEN_HEIGHT - 100,
        duration,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
      Animated.timing(p.rotation, {
        toValue: p.rotation.__getValue() + 720,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(p.scale, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(p.scale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setParticles((prev) => prev.filter((particle) => particle.id !== p.id));
    });
  };

  // Animate sparkle with upward burst
  const animateSparkle = (p: Particle) => {
    Animated.parallel([
      Animated.timing(p.scale, {
        toValue: 1.5,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(p.y, {
        toValue: p.y.__getValue() - 40,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(p.rotation, {
        toValue: p.rotation.__getValue() + 360,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(p.scale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setParticles((prev) => prev.filter((particle) => particle.id !== p.id));
      });
    });
  };

  // Measure target component coordinates
  const measureTarget = (ref: React.RefObject<any>): Promise<{ x: number; y: number }> => {
    return new Promise((resolve) => {
      if (!ref.current) return resolve({ x: SCREEN_WIDTH / 2, y: 150 });
      const handle = findNodeHandle(ref.current);
      if (!handle) return resolve({ x: SCREEN_WIDTH / 2, y: 150 });
      UIManager.measure(handle, (_fx, _fy, _w, _h, px, py) => {
        resolve({ x: px + (_w || 0) / 2, y: py + (_h || 0) / 2 });
      });
    });
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    emitCoins: async (targetRef, amount: number) => {
      const { x, y } = await measureTarget(targetRef);
      const newParticles = Array.from({ length: amount }).map(() =>
        createParticle(x + Math.random() * 30 - 15, y + Math.random() * 30 - 15, "coin")
      );
      setParticles((prev) => [...prev, ...newParticles]);
      newParticles.forEach(animateCoin);
    },
    emitSparkles: async (targetRef, rarity: string) => {
      const { x, y } = await measureTarget(targetRef);
      const color = rarityColors[rarity] || "white";
      const newParticles = Array.from({ length: 8 }).map(() =>
        createParticle(x + Math.random() * 20 - 10, y + Math.random() * 20 - 10, "sparkle", color)
      );
      setParticles((prev) => [...prev, ...newParticles]);
      newParticles.forEach(animateSparkle);
    },
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <Animated.Image
          key={p.id}
          source={p.type === "coin" ? COIN_IMG : SPARKLE_IMG}
          style={{
            position: "absolute",
            width: 24,
            height: 24,
            tintColor: p.color,
            transform: [
              { translateX: p.x },
              { translateY: p.y },
              { scale: p.scale },
              {
                rotate: p.rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
});

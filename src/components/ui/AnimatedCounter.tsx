"use client";

import { useEffect, useState, useRef } from "react";
import { ParticleEngine, ParticleTriggerOptions } from "@/components/particles/ParticleEngine";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  decimals?: number;
  particleOptions?: Partial<ParticleTriggerOptions>;
}

export function AnimatedCounter({
  value,
  duration = 800,
  className,
  decimals = 0,
  particleOptions,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    if (startValue === endValue) return;

    const startTime = performance.now();

    const step = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentValue = startValue + (endValue - startValue) * easeOutQuad(progress);
      setDisplayValue(parseFloat(currentValue.toFixed(decimals)));

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);

    // Trigger particle burst only if the value increased
    if (value > prevValueRef.current && counterRef.current) {
      ParticleEngine.trigger({
        target: counterRef.current,
        count: 20,
        type: "coin",
        colors: ["#FFD700", "#FFAA00", "#FFFF00"], // gold coins
        ...particleOptions,
      });
    }

    prevValueRef.current = value;
  }, [value, duration, decimals, particleOptions]);

  const easeOutQuad = (t: number) => t * (2 - t);

  return <span ref={counterRef} className={className}>{displayValue.toLocaleString()}</span>;
}

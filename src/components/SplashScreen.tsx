import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Recycle, Leaf, Coins } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-eco-primary to-eco-success"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="mb-8"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
          <span className="text-eco-primary text-3xl font-bold">🌱</span>
        </div>
      </motion.div>

      <motion.div
        className="text-center mb-6"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Polymers</h1>
        <div className="flex items-center justify-center space-x-2 text-white/90">
          <span className="text-lg">Network</span>
        </div>
      </motion.div>

      <motion.p
        className="text-white/90 text-center text-lg font-medium px-8 mb-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        Transforming Waste into Digital Assets
      </motion.p>
    </motion.div>
  );
}
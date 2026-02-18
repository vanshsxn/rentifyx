import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const words = [
  { text: "RentifyX", color: "text-foreground" },
  { text: "Find.", color: "text-morph-blue" },
  { text: "Rent.", color: "text-destructive" },
  { text: "Relax.", color: "text-success" },
];

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= words.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onComplete, 600);
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    // Safety timeout
    const safetyTimeout = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 600);
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimeout);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-card"
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* SVG Gooey filter */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="gooey"
            />
          </filter>
        </defs>
      </svg>

      <div style={{ filter: "url(#gooey)" }}>
        <AnimatePresence mode="wait">
          <motion.h1
            key={currentIndex}
            className={`text-6xl md:text-8xl font-bold tracking-tight ${words[currentIndex].color}`}
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {words[currentIndex].text}
          </motion.h1>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SplashScreen;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const words = [
  { text: "RentifyX", color: "text-black" }, // Using standard tailwind colors for clarity
  { text: "Find.", color: "text-blue-600" },
  { text: "Rent.", color: "text-red-600" },
  { text: "Relax.", color: "text-green-600" },
];

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [index, setIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Cycle through words
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev >= words.length - 1) {
          clearInterval(interval);
          setTimeout(() => setIsExiting(true), 1000); // Wait on "Relax"
          setTimeout(onComplete, 1600); // Final fade out
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Optimized SVG Gooey filter */}
      <svg className="absolute h-0 w-0">
        <defs>
          <filter id="gooey">
            {/* Reduced deviation from 6 to 4 for cleaner edges */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="gooey"
            />
          </filter>
        </defs>
      </svg>

      <div className="relative flex items-center justify-center" style={{ filter: "url(#gooey)" }}>
        {words.map((word, i) => (
          <motion.h1
            key={i}
            className={`absolute whitespace-nowrap text-6xl font-bold tracking-tighter md:text-8xl ${word.color}`}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ 
              opacity: i === index ? 1 : 0, 
              filter: i === index ? "blur(0px)" : "blur(10px)",
              scale: i === index ? 1 : 0.9
            }}
            transition={{ 
              duration: 0.8, 
              ease: "easeInOut" 
            }}
          >
            {word.text}
          </motion.h1>
        ))}
      </div>
    </motion.div>
  );
};

export default SplashScreen;
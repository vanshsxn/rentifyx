import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const words = [
  { text: "RentifyX", color: "text-black" },
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
    // Total duration: 4 seconds (4000ms)
    // 3 transitions * 800ms = 2400ms
    // Final word "Relax" shows for 800ms
    // Final exit animation = 800ms
    const wordInterval = 800; 

    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev >= words.length - 1) {
          clearInterval(interval);
          // Start exit slightly after the last word appears
          setTimeout(() => setIsExiting(true), 700); 
          setTimeout(onComplete, 1200); 
          return prev;
        }
        return prev + 1;
      });
    }, wordInterval);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* HIGH VISIBILITY SVG FILTER */}
      <svg className="absolute h-0 w-0">
        <defs>
          <filter id="gooey">
            {/* Reduced from 4 to 3 for much sharper text edges */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              // Increased contrast (20) and tighter threshold (-9) for maximum visibility
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="gooey"
            />
          </filter>
        </defs>
      </svg>

      <div className="relative flex items-center justify-center" style={{ filter: "url(#gooey)" }}>
        {words.map((word, i) => (
          <motion.h1
            key={i}
            className={`absolute whitespace-nowrap text-7xl font-black tracking-tighter md:text-9xl ${word.color}`}
            initial={{ opacity: 0, filter: "blur(5px)" }}
            animate={{ 
              opacity: i === index ? 1 : 0, 
              filter: i === index ? "blur(0px)" : "blur(5px)",
              scale: i === index ? 1 : 0.95 // Subtle scale for more "impact"
            }}
            transition={{ 
              duration: 0.4, // Faster transition for a 4s total time
              ease: [0.23, 1, 0.32, 1] // Custom cubic-bezier for "snappy" feel
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
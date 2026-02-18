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
    // We stay on each word longer to make it readable
    const wordInterval = 1000; 

    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev >= words.length - 1) {
          clearInterval(interval);
          // Give "Relax" a moment of peace before the app loads
          setTimeout(() => setIsExiting(true), 900); 
          setTimeout(onComplete, 1500); 
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
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <svg className="absolute h-0 w-0">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
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
            initial={{ opacity: 0, filter: "blur(8px)", scale: 0.9 }}
            animate={{ 
              opacity: i === index ? 1 : 0, 
              filter: i === index ? "blur(0px)" : "blur(8px)",
              scale: i === index ? 1 : 1.05 // Outgoing word expands slightly as it melts
            }}
            transition={{ 
              duration: 0.9, // Slower transition duration for a "liquid" feel
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
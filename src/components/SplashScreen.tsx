import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const words = [
  { text: "RentifyX", color: "text-black" },
  { text: "Find", color: "text-blue-600" },
  { text: "Rent", color: "text-red-600" },
  { text: "Relax.", color: "text-green-600" },
];

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"morph" | "exit">("morph");

  useEffect(() => {
    // Reduced motion: skip splash entirely
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onComplete();
      return;
    }

    // Faster cadence: 450ms per word (~1.8s total then 300ms exit)
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev >= words.length - 1) {
          clearInterval(interval);
          setTimeout(() => setPhase("exit"), 350);
          setTimeout(onComplete, 700);
          return prev;
        }
        return prev + 1;
      });
    }, 450);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <svg className="absolute h-0 w-0" aria-hidden="true">
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
      <div
        className="relative flex items-center justify-center"
        style={{ filter: "url(#gooey)", willChange: "filter" }}
      >
        {words.map((word, i) => (
          <motion.h1
            key={i}
            className={`absolute whitespace-nowrap text-6xl font-black tracking-tighter sm:text-7xl md:text-9xl ${word.color}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{
              opacity: i === index ? 1 : 0,
              scale: i === index ? 1 : 1.04,
            }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            style={{ willChange: "opacity, transform" }}
          >
            {word.text}
          </motion.h1>
        ))}
      </div>
    </motion.div>
  );
};

export default SplashScreen;

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
  const [phase, setPhase] = useState<"morph" | "loader" | "exit">("morph");

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev >= words.length - 1) {
          clearInterval(interval);
          setTimeout(() => setPhase("loader"), 600);
          setTimeout(() => setPhase("exit"), 3200);
          setTimeout(onComplete, 3800);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: phase === "loader" || phase === "exit" ? "#404456" : "#ffffff" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {phase === "morph" && (
        <>
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
                  scale: i === index ? 1 : 1.05,
                }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
              >
                {word.text}
              </motion.h1>
            ))}
          </div>
        </>
      )}

      {(phase === "loader" || phase === "exit") && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-[5.4em] h-[5.4em]"
        >
          <div
            className="absolute left-0 -bottom-[0.1em] w-[1em] h-[1em] bg-transparent border-[0.25em] border-white/90 rounded-[15%]"
            style={{
              transform: "translate(0, -1em) rotate(-45deg)",
              animation: "box-push 2.5s cubic-bezier(.79,0,.47,.97) infinite",
            }}
          />
          <div
            className="absolute w-[7.1em] h-[7.1em] top-[1.7em] left-[1.7em] bg-transparent border-l-[0.25em] border-white/90"
            style={{ transform: "rotate(45deg)" }}
          >
            <div className="absolute w-[7.1em] h-[7.1em] left-0" style={{ backgroundColor: "#404456" }} />
          </div>
        </motion.div>
      )}

      <style>{`
        @keyframes box-push {
          0% { transform: translate(0, -1em) rotate(-45deg); }
          5% { transform: translate(0, -1em) rotate(-50deg); }
          20% { transform: translate(1em, -2em) rotate(47deg); }
          25% { transform: translate(1em, -2em) rotate(45deg); }
          30% { transform: translate(1em, -2em) rotate(40deg); }
          45% { transform: translate(2em, -3em) rotate(137deg); }
          50% { transform: translate(2em, -3em) rotate(135deg); }
          55% { transform: translate(2em, -3em) rotate(130deg); }
          70% { transform: translate(3em, -4em) rotate(217deg); }
          75% { transform: translate(3em, -4em) rotate(220deg); }
          100% { transform: translate(0, -1em) rotate(-225deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default SplashScreen;

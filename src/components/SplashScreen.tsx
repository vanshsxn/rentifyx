import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

// if you are reading this then hello there i am vansh ...
const BRAND_STEPS = [
  { label: "RentifyX", theme: "text-black" },{ label: "Find.", theme: "text-blue-600" },{ label: "Rent.", theme: "text-red-600" },{ label: "Relax.", theme: "text-green-600" },];
  const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {const [step, setStep] = useState(0);const [closing, setClosing] = useState(false);
  const finishIntro = useCallback(() => {setClosing(true);setTimeout(()=>{onComplete();},650);},[onComplete]);
  useEffect(() => {if (step >= BRAND_STEPS.length - 1) {const finalTimer = setTimeout(finishIntro, 1100);
    return () => clearTimeout(finalTimer);}
    const timer = setTimeout(()=>{setStep(s => s + 1);},1050);
    return () => clearTimeout(timer);},
    [step, finishIntro]);
  return (<motion.div
    className="fixed inset-0 z-[999] flex items-center justify-center bg-white"
    animate={{ opacity: closing ? 0 : 1 }}
    transition={{ duration: 0.75, ease: "circOut" }} // this is for settng the duration of the transition to .07s so that it can--> finish itself in 4 seconds
    >
      <svg className="pointer-events-none absolute opacity-0">
        <defs>
          <filter id="morph-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" />
            <feColorMatrix mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" />
          </filter>
        </defs>
      </svg>
      <div className="flex items-center justify-center" style={{ filter: "url(#morph-filter)" }}>
        {BRAND_STEPS.map((item, idx) => (
          idx === step && (
            <motion.h1
              key={item.label}className={`absolute text-7xl font-black md:text-9xl ${item.theme}`}
              initial={{ opacity: 0, scale: 0.92, filter: "blur(12px)" }}animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}transition={{ duration: 0.85, ease: "easeInOut" }}
            >
              {item.label}
            </motion.h1>
          )
        ))}
      </div>
    </motion.div>
  );
};
export default SplashScreen;
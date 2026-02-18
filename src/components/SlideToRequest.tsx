import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, AlertTriangle } from "lucide-react";

interface SlideToRequestProps {
  onComplete: () => void;
  urgent: boolean;
  onUrgentChange: (urgent: boolean) => void;
}

const TRACK_WIDTH = 320;
const HANDLE_SIZE = 52;
const THRESHOLD = TRACK_WIDTH - HANDLE_SIZE - 8;

const SlideToRequest = ({ onComplete, urgent, onUrgentChange }: SlideToRequestProps) => {
  const [completed, setCompleted] = useState(false);
  const x = useMotionValue(0);
  const progress = useTransform(x, [0, THRESHOLD], [0, 1]);
  const trackBg = useTransform(
    progress,
    [0, 1],
    ["hsl(210 40% 96%)", "hsl(239 84% 67%)"]
  );
  const textOpacity = useTransform(progress, [0, 0.5], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.point.x > 0 && x.get() >= THRESHOLD * 0.9) {
      setCompleted(true);
      onComplete();
    }
  };

  if (completed) {
    return (
      <motion.div
        className="flex items-center justify-center gap-2 h-14 rounded-full gradient-success"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Check className="w-5 h-5 text-success-foreground" />
        <span className="text-sm font-semibold text-success-foreground">Request Sent!</span>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Urgent toggle */}
      <button
        onClick={() => onUrgentChange(!urgent)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
          urgent
            ? "bg-warning/10 text-warning border border-warning/20"
            : "bg-secondary text-muted-foreground border border-border"
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        {urgent ? "Urgent Request" : "Mark as Urgent"}
      </button>

      {/* Slide track */}
      <motion.div
        className="relative h-14 rounded-full overflow-hidden border border-border"
        style={{ width: TRACK_WIDTH, backgroundColor: trackBg }}
      >
        <motion.span
          className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground font-medium pointer-events-none"
          style={{ opacity: textOpacity }}
        >
          Slide to send request →
        </motion.span>

        <motion.div
          className="absolute top-1 left-1 w-12 h-12 rounded-full gradient-primary flex items-center justify-center cursor-grab active:cursor-grabbing shadow-elevated"
          drag="x"
          dragConstraints={{ left: 0, right: THRESHOLD }}
          dragElastic={0}
          dragMomentum={false}
          style={{ x }}
          onDragEnd={handleDragEnd}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SlideToRequest;

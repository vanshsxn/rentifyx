const BoxLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#404456]">
      <div className="relative w-[5.4em] h-[5.4em]">
        {/* The rolling box */}
        <div
          className="absolute left-0 -bottom-[0.1em] w-[1em] h-[1em] bg-transparent border-[0.25em] border-white/90 rounded-[15%]"
          style={{
            transform: "translate(0, -1em) rotate(-45deg)",
            animation: "box-push 2.5s cubic-bezier(.79,0,.47,.97) infinite",
          }}
        />
        {/* The hill */}
        <div
          className="absolute w-[7.1em] h-[7.1em] top-[1.7em] left-[1.7em] bg-transparent border-l-[0.25em] border-white/90"
          style={{ transform: "rotate(45deg)" }}
        >
          <div className="absolute w-[7.1em] h-[7.1em] left-0 bg-[#404456]" />
        </div>
      </div>

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
    </div>
  );
};

export default BoxLoader;

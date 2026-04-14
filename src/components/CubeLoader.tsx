const CubeLoader = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="cube-container">
        <div className="cube-holder">
          <div className="cube-box" />
        </div>
        <div className="cube-holder">
          <div className="cube-box" />
        </div>
        <div className="cube-holder">
          <div className="cube-box" />
        </div>
      </div>

      <style>{`
        .cube-container {
          transform-style: preserve-3d;
          perspective: 2000px;
          transform: rotateX(-30deg) rotateY(-45deg);
          position: relative;
          width: 3em;
          height: 3em;
        }
        .cube-holder {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-style: preserve-3d;
          transform: translate3d(0em, 3em, 1.5em);
        }
        .cube-holder:last-child {
          transform: rotateY(-90deg) rotateX(90deg) translate3d(0, 3em, 1.5em);
        }
        .cube-holder:first-child {
          transform: rotateZ(-90deg) rotateX(-90deg) translate3d(0, 3em, 1.5em);
        }
        .cube-holder:nth-child(1) .cube-box { background-color: #1FBCD3; }
        .cube-holder:nth-child(1) .cube-box::before { background-color: #0e8a9e; }
        .cube-holder:nth-child(1) .cube-box::after { background-color: #14a3b8; }
        .cube-holder:nth-child(2) .cube-box { background-color: #CBE2B4; }
        .cube-holder:nth-child(2) .cube-box::before { background-color: #9cc476; }
        .cube-holder:nth-child(2) .cube-box::after { background-color: #b3d395; }
        .cube-holder:nth-child(3) .cube-box { background-color: #F6B6CA; }
        .cube-holder:nth-child(3) .cube-box::before { background-color: #e87da0; }
        .cube-holder:nth-child(3) .cube-box::after { background-color: #ef99b5; }
        .cube-box {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-style: preserve-3d;
          animation: ani-cube-box 6s infinite;
          width: 3em;
          height: 3em;
        }
        .cube-box::before,
        .cube-box::after {
          position: absolute;
          width: 100%;
          height: 100%;
          content: "";
        }
        .cube-box::before {
          left: 100%;
          bottom: 0;
          transform: rotateY(90deg);
          transform-origin: 0 50%;
        }
        .cube-box::after {
          left: 0;
          bottom: 100%;
          transform: rotateX(90deg);
          transform-origin: 0 100%;
        }
        @keyframes ani-cube-box {
          8.33% { transform: translate3d(-50%, -50%, 0) scaleZ(2); }
          16.7% { transform: translate3d(-50%, -50%, -3em) scaleZ(1); }
          25% { transform: translate3d(-50%, -100%, -3em) scaleY(2); }
          33.3% { transform: translate3d(-50%, -150%, -3em) scaleY(1); }
          41.7% { transform: translate3d(-100%, -150%, -3em) scaleX(2); }
          50% { transform: translate3d(-150%, -150%, -3em) scaleX(1); }
          58.3% { transform: translate3d(-150%, -150%, 0) scaleZ(2); }
          66.7% { transform: translate3d(-150%, -150%, 0) scaleZ(1); }
          75% { transform: translate3d(-150%, -100%, 0) scaleY(2); }
          83.3% { transform: translate3d(-150%, -50%, 0) scaleY(1); }
          91.7% { transform: translate3d(-100%, -50%, 0) scaleX(2); }
          100% { transform: translate3d(-50%, -50%, 0) scaleX(1); }
        }
      `}</style>
    </div>
  );
};

export default CubeLoader;

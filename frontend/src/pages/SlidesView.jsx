import { useCallback, useEffect, useRef } from "react";
import DemoNav from "../components/DemoNav.jsx";

const TOTAL = 6;

export default function SlidesView({ slideIndex, onSlideChange, demoMode, onSelectRole, onGoToSlides }) {
  const videoRef = useRef(null);

  const prev = useCallback(() => {
    onSlideChange((i) => Math.max(0, i - 1));
  }, [onSlideChange]);

  const next = useCallback(() => {
    onSlideChange((i) => Math.min(TOTAL - 1, i + 1));
  }, [onSlideChange]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // restart video whenever slide changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [slideIndex]);

  const src = `/slides/${slideIndex + 1}.mp4`;

  return (
    <div className="slides-view">
      {demoMode && (
        <DemoNav
          activeView="slides"
          onSelectRole={onSelectRole}
          onGoToSlides={onGoToSlides}
        />
      )}

      <button
        className="slides-arrow slides-arrow-prev"
        onClick={prev}
        disabled={slideIndex === 0}
        aria-label="Previous slide"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <video
        ref={videoRef}
        className="slides-video"
        src={src}
        autoPlay
        playsInline
        muted
        aria-label={`Slide ${slideIndex + 1} of ${TOTAL}`}
      />

      <button
        className="slides-arrow slides-arrow-next"
        onClick={next}
        disabled={slideIndex === TOTAL - 1}
        aria-label="Next slide"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <div className="slides-counter" aria-live="polite">
        {slideIndex + 1} <span>/</span> {TOTAL}
      </div>
    </div>
  );
}

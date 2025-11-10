import { useEffect, useId, useMemo, useState } from 'react';

import eggFillSrc from '../assets/svg/egg-gold-flat.svg';
import eggShellSrc from '../assets/svg/egg-white-flat.svg';
import './LoadingOverlay.css';

export type LoadingStatus = {
  progress: number;
  message: string;
};

type LoadingOverlayProps = {
  status: LoadingStatus;
};

const SVG_WIDTH = 120;
const SVG_HEIGHT = 160;
const WAVE_SEGMENTS = 10;
const FILL_INSET_X = 0;
const FILL_INSET_Y = 0;
const FILL_SCALE_X = (SVG_WIDTH - FILL_INSET_X * 2) / SVG_WIDTH;
const FILL_SCALE_Y = (SVG_HEIGHT - FILL_INSET_Y * 2) / SVG_HEIGHT;
const FILL_TRANSFORM = `translate(${FILL_INSET_X}, ${FILL_INSET_Y}) scale(${FILL_SCALE_X} ${FILL_SCALE_Y})`;

function clampProgress(progress: number): number {
  if (Number.isNaN(progress)) {
    return 0;
  }
  return Math.max(0, Math.min(1, progress));
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(query.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

export function LoadingOverlay({ status }: LoadingOverlayProps) {
  const percentage = Math.max(
    0,
    Math.min(100, Math.round(status.progress * 100))
  );
  const prefersReducedMotion = usePrefersReducedMotion();
  const clipPathId = useId();
  const targetProgress = clampProgress(status.progress);
  const [wavePhase, setWavePhase] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(targetProgress);

  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimatedProgress(targetProgress);
      return;
    }

    let frameId: number;
    let start = Date.now();
    const duration = 600;
    const initial = animatedProgress;
    const target = targetProgress;

    if (initial === target) {
      return;
    }

    const step = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);

      const nextValue = initial + (target - initial) * eased;
      setAnimatedProgress(nextValue);

      if (t < 1) {
        frameId = window.requestAnimationFrame(step);
      } else {
        setAnimatedProgress(target);
      }
    };

    frameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [targetProgress, prefersReducedMotion, animatedProgress]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    let frameId: number;
    const step = (time: number) => {
      setWavePhase(time / 1000);
      frameId = window.requestAnimationFrame(step);
    };

    frameId = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(frameId);
  }, [prefersReducedMotion]);

  const wavePath = useMemo(() => {
    const baseY = SVG_HEIGHT * (1 - animatedProgress);

    const amplitude = prefersReducedMotion
      ? 0
      : Math.max(3, 10 - animatedProgress * 4);
    const phase = prefersReducedMotion ? 0 : wavePhase * 1.4;
    const tilt = prefersReducedMotion ? 0 : Math.sin(wavePhase * 0.8) * 8;

    const startY = Math.max(
      0,
      Math.min(SVG_HEIGHT, baseY + Math.sin(phase) * amplitude + tilt)
    );

    let path = `M0 ${SVG_HEIGHT} L0 ${startY.toFixed(2)}`;

    for (let i = 1; i <= WAVE_SEGMENTS; i++) {
      const progress = i / WAVE_SEGMENTS;
      const x = progress * SVG_WIDTH;
      const sine = Math.sin(phase + progress * Math.PI * 2);
      const dynamicTilt = tilt * (1 - Math.abs(0.5 - progress) * 1.6);
      const y =
        baseY +
        sine * amplitude +
        dynamicTilt -
        Math.cos(progress * Math.PI) * 4 * Math.min(1, animatedProgress + 0.2);

      const clampedY = Math.max(0, Math.min(SVG_HEIGHT, y));
      path += ` L${x.toFixed(2)} ${clampedY.toFixed(2)}`;
    }

    path += ` L${SVG_WIDTH} ${SVG_HEIGHT} Z`;

    return path;
  }, [animatedProgress, wavePhase, prefersReducedMotion]);

  return (
    <div className="loading-overlay">
      <div className="loading-overlay__content">
        <div className="loading-overlay__egg-container">
          <div className="loading-overlay__egg-fill-wrapper">
            <svg
              className="loading-overlay__egg-fill"
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              role="presentation"
              aria-hidden="true"
              style={{
                transform: prefersReducedMotion
                  ? undefined
                  : `rotate(${Math.sin(wavePhase * 0.8) * 4}deg)`,
              }}
            >
              <defs>
                <clipPath id={clipPathId}>
                  <path d={wavePath} />
                </clipPath>
              </defs>
              <image
                href={eggFillSrc}
                clipPath={`url(#${clipPathId})`}
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
                transform={FILL_TRANSFORM}
                preserveAspectRatio="xMidYMid slice"
              />
            </svg>
          </div>
          <img
            src={eggShellSrc}
            alt=""
            className="loading-overlay__egg-shell"
            loading="eager"
            aria-hidden="true"
          />
        </div>
        <div className="loading-overlay__status">{status.message}</div>
        <div className="loading-overlay__percentage">{percentage}%</div>
        <div className="loading-overlay__sr-message" aria-live="polite">
          {status.message}
        </div>
      </div>
    </div>
  );
}

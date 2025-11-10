import { useEffect, useId, useMemo, useState } from 'react';

const EGG_SHELL_PATH =
  'M 11.572032 30.626894 C 13.195086 30.626894 14.472609 30.186552 15.768286 29.488800 C 18.873883 27.816370 21.719542 22.041264 22.557304 18.689818 C 22.807578 17.688634 23.581721 14.210572 23.300863 13.367922 C 23.223213 13.134928 22.881550 12.909206 22.693091 12.585482 C 22.862431 12.698388 22.963490 12.868238 23.093963 12.824738 C 23.532571 12.678523 23.015411 9.847272 22.867662 9.403989 C 22.043338 6.930727 20.948618 4.964925 18.897709 3.286715 C 15.878748 0.816385 10.975051 0.235203 7.518021 2.096894 C 6.826283 2.469405 6.089278 2.848610 5.474844 3.351380 C 5.154935 3.613158 4.872470 4.069692 4.395070 4.308418 C 3.388376 5.270205 2.678400 6.493044 2.170864 7.677440 C -0.134425 13.057038 1.238891 19.134327 3.910140 24.095774 C 4.788476 25.727153 5.879988 27.430077 7.336978 28.622293 C 8.353246 29.453878 9.410161 29.998876 10.653901 30.413498 C 10.895615 30.494083 11.176848 30.468803 11.572032 30.626894 Z';

import type { LoadingStatus } from '../Loading/loading.machine';
import './LoadingOverlay.css';

type LoadingOverlayProps = {
  status: LoadingStatus;
};

const SVG_WIDTH = 120;
const SVG_HEIGHT = 160;
const WAVE_SEGMENTS = 10;

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
  const rawId = useId();
  const idBase = useMemo(
    () => rawId.replace(/[^a-zA-Z0-9_-]/g, '') || 'loader',
    [rawId]
  );
  const waveClipId = `${idBase}-wave-clip`;
  const eggClipId = `${idBase}-egg-clip`;
  const fillGradientId = `${idBase}-fill-gradient`;
  const shellGradientId = `${idBase}-shell-gradient`;
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
                <clipPath id={eggClipId}>
                  <g transform={`scale(${SVG_WIDTH / 30}, ${SVG_HEIGHT / 40})`}>
                    <g transform="scale(1,-1) translate(0,-40)">
                      <path d={EGG_SHELL_PATH} transform="translate(2.8,-0.8)" />
                    </g>
                  </g>
                </clipPath>
                <clipPath id={waveClipId}>
                  <path d={wavePath} />
                </clipPath>
                <linearGradient
                  id={fillGradientId}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ffff07" />
                  <stop offset="100%" stopColor="#ff007f" />
                </linearGradient>
              </defs>
              <g clipPath={`url(#${eggClipId})`}>
                <rect
                  width={SVG_WIDTH}
                  height={SVG_HEIGHT}
                  fill={`url(#${fillGradientId})`}
                  clipPath={`url(#${waveClipId})`}
                />
              </g>
            </svg>
          </div>
          <svg
            className="loading-overlay__egg-shell"
            viewBox="0 0 30 40"
            role="presentation"
            aria-hidden="true"
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
          >
            <defs>
              <radialGradient
                id={shellGradientId}
                cx="12"
                cy="15"
                r="53"
                fx="12"
                fy="15"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="100%" stopColor="#ff007f" stopOpacity="1" />
              </radialGradient>
            </defs>
            <g transform="scale(1,-1) translate(0,-40)">
              <path
                d={EGG_SHELL_PATH}
                transform="translate(2.8,-0.8)"
                fill={`url(#${shellGradientId})`}
              />
            </g>
          </svg>
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

import { useId } from 'react';

import './LoadingOverlay.css';

export type LoadingStatus = {
  progress: number;
  message: string;
};

type LoadingOverlayProps = {
  status: LoadingStatus;
};

const DEFAULT_WIDTH = 160;
const DEFAULT_HEIGHT = 220;
const EGG_OUTLINE_PATH =
  'M80 12c-26 0-50 40-50 98 0 52 30 98 50 98s50-46 50-98C130 52 106 12 80 12z';

function clampProgress(progress: number): number {
  if (Number.isNaN(progress)) {
    return 0;
  }
  return Math.max(0, Math.min(1, progress));
}

function EggProgressGraphic({ progress }: { progress: number }) {
  const clamped = clampProgress(progress);
  const fillHeight = DEFAULT_HEIGHT * clamped;
  const fillY = DEFAULT_HEIGHT - fillHeight;
  const clipPathId = useId();
  const strokeId = useId();

  return (
    <svg
      className="loading-overlay__egg"
      viewBox={`0 0 ${DEFAULT_WIDTH} ${DEFAULT_HEIGHT}`}
      role="img"
      aria-label={`Loading ${Math.round(clamped * 100)} percent`}
    >
      <defs>
        <clipPath id={clipPathId}>
          <path d={EGG_OUTLINE_PATH} />
        </clipPath>
        <linearGradient id={strokeId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f4d35e" />
          <stop offset="100%" stopColor="#ee964b" />
        </linearGradient>
      </defs>

      <path
        d={EGG_OUTLINE_PATH}
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="4"
      />
      <g clipPath={`url(#${clipPathId})`}>
        <rect
          x="0"
          y={fillY}
          width={DEFAULT_WIDTH}
          height={fillHeight}
          fill={`url(#${strokeId})`}
          opacity="0.85"
        />
      </g>
      <path
        d={EGG_OUTLINE_PATH}
        fill="none"
        stroke={`url(#${strokeId})`}
        strokeWidth="4"
      />
    </svg>
  );
}

export function LoadingOverlay({ status }: LoadingOverlayProps) {
  const percentage = Math.max(
    0,
    Math.min(100, Math.round(status.progress * 100))
  );
  const progressDecimal = clampProgress(status.progress);

  return (
    <div className="loading-overlay">
      <div className="loading-overlay__content">
        <EggProgressGraphic progress={progressDecimal} />
        <div className="loading-overlay__status">{status.message}</div>
        <div className="loading-overlay__percentage">{percentage}%</div>
        <div className="loading-overlay__sr-message" aria-live="polite">
          {status.message}
        </div>
      </div>
    </div>
  );
}

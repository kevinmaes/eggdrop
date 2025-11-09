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

function clampProgress(progress: number): number {
  if (Number.isNaN(progress)) {
    return 0;
  }
  return Math.max(0, Math.min(1, progress));
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
        <div className="loading-overlay__egg-container">
          <img
            src={eggShellSrc}
            alt=""
            className="loading-overlay__egg-shell"
            loading="eager"
            aria-hidden="true"
          />
          <img
            src={eggFillSrc}
            alt=""
            className="loading-overlay__egg-fill"
            loading="eager"
            aria-hidden="true"
            style={{
              clipPath: `inset(${Math.max(0, (1 - progressDecimal) * 100)}% 0 0 0)`,
            }}
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

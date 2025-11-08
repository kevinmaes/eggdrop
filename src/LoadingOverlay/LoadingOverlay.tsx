import './LoadingOverlay.css';

export type LoadingStatus = {
  progress: number;
  message: string;
};

type LoadingOverlayProps = {
  status: LoadingStatus;
};

export function LoadingOverlay({ status }: LoadingOverlayProps) {
  const percentage = Math.max(
    0,
    Math.min(100, Math.round(status.progress * 100))
  );

  return (
    <div className="loading-overlay">
      <div className="loading-overlay__content">
        <div className="loading-overlay__title">Eggdrop</div>
        <div className="loading-overlay__message">{status.message}</div>
        <div className="loading-overlay__progress">
          <div
            className="loading-overlay__progress-bar"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="loading-overlay__percentage">{percentage}%</div>
      </div>
    </div>
  );
}


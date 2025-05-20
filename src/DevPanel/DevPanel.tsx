import { useEffect, useState } from 'react';

import { Fragment } from 'react/jsx-runtime';

import './DevPanel.css';
import { AppActorContext } from '../app.machine';
import { sounds } from '../sounds';

import type { GenerationStats, LevelResults } from '../GameLevel/types';

function formatGenerationStats(generationStats: GenerationStats) {
  // Return a clone of generationStats with so that each value is formatted to 2 decimal places.
  return Object.entries(generationStats).reduce(
    (acc, [key, value]) => {
      switch (key) {
        // 2 decimal places
        case 'averageFitness':
        case 'averageHenSpeed':
        case 'averageStationaryEggLayingRate':
        case 'averageMovingEggLayingRate':
        case 'averageBlackEggRate':
        case 'averageGoldEggRate':
          acc[key as keyof GenerationStats] = value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          break;

        // 1 decimal place
        // Average phenotype values
        case 'averageMaxEggs':
        // Average stats
        case 'averageEggsBroken':
        case 'averageEggsOffscreen':
        case 'averageEggsHatched':
        case 'averageEggsLaid':
        case 'averageHatchRate':
          acc[key as keyof GenerationStats] = value.toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          });
          break;

        case 'catchRate':
          acc[key as keyof GenerationStats] = `${(value * 100).toFixed(0)}%`;
          break;

        default:
          // Rounded values
          acc[key as keyof GenerationStats] = value.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          });
      }
      return acc;
    },
    {} as Record<keyof GenerationStats, string>
  );
}

export function DevPanel() {
  const { levelResultsHistory } = AppActorContext.useSelector(state => ({
    levelResultsHistory: state.context.levelResultsHistory,
  }));

  const [showDevPanel, setShowDevPanel] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Identify if the command and 'd' keys are pressed
      if (e.key === 'd' && e.metaKey) {
        e.preventDefault();
        setShowDevPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const statNames = [
    '',
    'totalEggsLaid',
    'averageEggsLaid',
    'catchRate',
    '',
    // GA values including phenotype values
    'averageFitness',
    'averageHenSpeed',
    'averageBaseTweenDurationSeconds',
    'averageStationaryEggLayingRate',
    'averageMovingEggLayingRate',
    'averageHatchRate',
    'averageMinXMovement',
    'averageMaxXMovement',
    'averageMinStopMS',
    'averageMaxStopMS',
    'averageMaxEggs',
    'averageBlackEggRate',
    'averageGoldEggRate',
    'averageRestAfterLayingEggMS',
    '',
    // Averages
    // 'averageEggsLaid',
    // 'averageEggsBroken',
    // 'averageEggsHatched',
    // '',
    // Result totals
    // 'totalBlackEggsLaid',
    // 'totalGoldEggsLaid',
    // 'totalWhiteEggsLaid',
    // 'totalEggsBroken',
    // 'totalEggsCaught',
    // 'totalBlackEggsCaught',
    // 'totalGoldEggsCaught',
    // 'totalWhiteEggsCaught',
    // 'totalEggsHatched',
  ];

  if (!showDevPanel) {
    return null;
  }

  return (
    <div className="dev-panel">
      <div className="control-buttons">
        <button
          onClick={() => {
            sounds.yipee.play();
          }}
        >
          Test sound
        </button>
      </div>
      <div
        className="grid-container"
        style={{
          gridTemplateColumns: `300px repeat(${levelResultsHistory.length}, 1fr)`,
        }}
      >
        {/* Insert the first row for headers */}
        <div className="grid-item header generation-label">Generation</div>{' '}
        {levelResultsHistory.map(levelResults => (
          <div
            key={`header-${levelResults.generationNumber}`}
            className="grid-item header"
          >
            {`${levelResults.generationNumber}`}
          </div>
        ))}
        {/* Hardcoded prop names in the first column */}
        {statNames.map((statName, rowIndex) => (
          <Fragment key={rowIndex}>
            <div
              className={`grid-item title ${statName.length === 0 ? 'empty-space' : ''}`}
            >
              {statName}
            </div>
            {levelResultsHistory.map((levelResults, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`grid-item numeric ${statName.length === 0 ? 'empty-space' : ''}`}
              >
                {
                  formatGenerationStats(levelResults.levelStats)[
                    statName as keyof LevelResults['levelStats']
                  ]
                }
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

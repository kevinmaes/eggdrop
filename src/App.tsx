import { Layer, Stage } from 'react-konva';

import { AppActorContext } from './app.machine';
import { BackgroundLayer } from './BackgroundLayer/BackgroundLayer';
import { BetweenLevelsLayer } from './BetweenLevelsLayer/BetweenLevelsLayer';
import { DevPanel } from './DevPanel/DevPanel';
import { getBorderRadius } from './gameConfig';
import { GameLevel } from './GameLevel/GameLevel';
import { LoadingOverlay } from './LoadingOverlay/LoadingOverlay';
import { MuteButton } from './MuteButton/MuteButton';
import { TransparentButton } from './TransparentButton/TransparentButton';
import './App.css';

function App() {
  const { isLoading, showError, showGamePlayLevel, loadingStatus } =
    AppActorContext.useSelector((state) => ({
      stateValue: state.value,
      showError: state.matches('Show Error'),
      isLoading: state.matches('Loading'),
      showGameIntro: state.matches('Intro'),
      showGamePlay: state.matches('Game Play'),
      showGamePlayLevel: state.hasTag('actively playing'),
      loadingStatus: state.context.loadingStatus,
    }));

  if (showError) {
    return <div>Error loading the game...</div>;
  }

  // Persistent stage: Always render the Konva stage (even during loading)
  // so the scene is ready the moment gameplay begins. This helps "cover up"
  // the fact that mounting some graphics takes time that is noticeable.
  return (
    <div className="app-page">
      <KonvaStageAndBackground>
        <BetweenLevelsLayer />
        {showGamePlayLevel && <GameLevel />}
      </KonvaStageAndBackground>
      {/* LoadingOverlay renders as a translucent curtain atop the stage */}
      {isLoading && <LoadingOverlay status={loadingStatus} />}
    </div>
  );
}

function KonvaStageAndBackground({ children }: { children: React.ReactNode }) {
  const appActorRef = AppActorContext.useActorRef();
  const { gameConfig, showGameIntro } = AppActorContext.useSelector(
    (state) => ({
      gameConfig: state.context.gameConfig,
      showGameIntro: state.matches('Intro'),
    })
  );

  return (
    <div className="app-stage-wrapper">
      <div className="app-stage-container">
        <div className="app-stage-container-middle">
          <div
            className="app-stage-container-inner"
            style={{
              width: gameConfig.stage.width,
              height: gameConfig.stage.height,
            }}
          >
            <Stage
              width={gameConfig.stage.width}
              height={gameConfig.stage.height}
              style={{
                borderRadius: `${getBorderRadius()}px`,
                overflow: 'hidden',
              }}
            >
              {/* Background graphics layer - static (no events) */}
              <BackgroundLayer />
              {children}
              {/* Dynamic App UI Layer */}
              <Layer>
                <MuteButton />
                {showGameIntro && (
                  // Play button
                  <TransparentButton
                    x={0.5 * gameConfig.stage.width - 500}
                    y={0.5 * gameConfig.stage.height - 250}
                    width={1000}
                    height={500}
                    onClick={() => appActorRef.send({ type: 'Play' })}
                  />
                )}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
      <DevPanel />
    </div>
  );
}

export default App;

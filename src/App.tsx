import { Layer, Stage } from 'react-konva';

import { AppActorContext } from './app.machine';
import { BackgroundLayer } from './BackgroundLayer/BackgroundLayer';
import { BetweenLevelsLayer } from './BetweenLevelsLayer/BetweenLevelsLayer';
import { DevPanel } from './DevPanel/DevPanel';
import { GameLevel } from './GameLevel/GameLevel';
import './App.css';
import { LoadingOverlay } from './LoadingOverlay/LoadingOverlay';
import { MuteButton } from './MuteButton/MuteButton';
import { TransparentButton } from './TransparentButton/TransparentButton';

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

  if (isLoading) {
    return <LoadingOverlay status={loadingStatus} />;
  }

  return (
    <KonvaStageAndBackground>
      <BetweenLevelsLayer />
      {showGamePlayLevel && <GameLevel />}
    </KonvaStageAndBackground>
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
    <>
      <Stage
        width={gameConfig.stage.width}
        height={gameConfig.stage.height}
        style={{
          border: '5px solid',
          borderColor: '#98aace',
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
      <DevPanel />
    </>
  );
}

export default App;

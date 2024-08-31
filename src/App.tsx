import { Layer, Stage } from 'react-konva';
import { AppActorContext } from './app.machine';
import { GameLevel } from './GameLevel/GameLevel';

import './App.css';
import { DevPanel } from './DevPanel/DevPanel';
import { BetweenLevelsLayer } from './BetweenLevelsLayer/BetweenLevelsLayer';
import { MuteButton } from './MuteButton/MuteButton';
import { BackgroundLayer } from './BackgroundLayer/BackgroundLayer';
import { TransparentButton } from './TransparentButton/TransparentButton';

function App() {
	const { isLoading, showError, showGamePlayLevel } =
		AppActorContext.useSelector((state) => ({
			stateValue: state.value,
			showError: state.matches('Show Error'),
			isLoading: state.matches('Loading'),
			showGameIntro: state.matches('Intro'),
			showGamePlay: state.matches('Game Play'),
			showGamePlayLevel: state.hasTag('actively playing'),
		}));

	if (showError) {
		return <div>Error loading the game...</div>;
	}

	if (isLoading) {
		return <div>Loading...</div>;
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
				width={gameConfig.stageDimensions.width}
				height={gameConfig.stageDimensions.height}
				style={{ background: 'blue', border: '1px solid black' }}
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
							x={0.5 * gameConfig.stageDimensions.width - 500}
							y={0.5 * gameConfig.stageDimensions.height - 250}
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

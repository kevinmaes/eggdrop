import { Layer, Stage } from 'react-konva';
import { AppActorContext } from './app.machine';
import { GameLevel } from './GameLevel/GameLevel';

import './App.css';
import { DevPanel } from './DevPanel/DevPanel';
import { Button } from './Button/Button';
import { BetweenLevelsLayer } from './BetweenLevelsLayer/BetweenLevelsLayer';
import { MuteButton } from './MuteButton/MuteButton';
import { BackgroundLayer } from './BackgroundLayer/BackgroundLayer';

function App() {
	const { isLoading, showError } = AppActorContext.useSelector((state) => ({
		stateValue: state.value,
		showError: state.matches('Show Error'),
		isLoading: state.matches('Loading'),
		showGameIntro: state.matches('Intro'),
		showGamePlay: state.matches('Game Play'),
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
			<GameLevel />
		</KonvaStageAndBackground>
	);
}

function KonvaStageAndBackground({ children }: { children: React.ReactNode }) {
	const appActorRef = AppActorContext.useActorRef();
	const { gameConfig, showGameIntro } = AppActorContext.useSelector(
		(state) => ({
			gameConfig: state.context.gameConfig,
			showGameIntro: state.matches('Intro'),
			isMuted: state.context.isMuted,
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
						<Button
							x={gameConfig.stageDimensions.width / 2 - 60}
							y={490}
							width={200}
							height={60}
							bgColor={gameConfig.colors.secondaryBlue}
							borderColor="white"
							textColor="white"
							text="Play"
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

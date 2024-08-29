import { Circle, Group, Image, Layer, Rect, Stage } from 'react-konva';
import { AppActorContext } from './app.machine';
import { GameLevel } from './GameLevel/GameLevel';

import './App.css';
import { DevPanel } from './DevPanel/DevPanel';
import useImage from 'use-image';
import { Button } from './Button/Button';
import { BetweenLevels } from './BetweenLevels/BetweenLevels';

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
			<>
				<BetweenLevels />
				<GameLevel />
			</>
		</KonvaStageAndBackground>
	);
}

function KonvaStageAndBackground({ children }: { children: React.ReactNode }) {
	const appActorRef = AppActorContext.useActorRef();
	const { gameConfig, isMuted, showGameIntro } = AppActorContext.useSelector(
		(state) => ({
			gameConfig: state.context.gameConfig,
			showGameIntro: state.matches('Intro'),
			isMuted: state.context.isMuted,
		})
	);

	const [kitchenBgImage] = useImage('images/kitchen-bg-4.png');
	const [henBeamImage] = useImage('images/hen-beam-gray.png');
	const [titleImage] = useImage('images/egg-drop-title-0.png');

	return (
		<>
			<Stage
				width={gameConfig.stageDimensions.width}
				height={gameConfig.stageDimensions.height}
				style={{ background: 'blue', border: '1px solid black' }}
			>
				{/* Background graphics layer - static (no events) */}
				<Layer listening={false}>
					{/* Background kitchen image */}
					<Group>
						<Image
							image={kitchenBgImage}
							width={gameConfig.stageDimensions.width}
							height={gameConfig.stageDimensions.height}
						/>
						{/* Translucent overlay to mute the background image */}
						<Rect
							width={gameConfig.stageDimensions.width}
							height={gameConfig.stageDimensions.height}
							opacity={0.5}
							fill="black"
							y={0}
						/>
						<Image
							image={henBeamImage}
							width={gameConfig.henBeam.width}
							height={gameConfig.henBeam.height}
							x={gameConfig.henBeam.x}
							y={gameConfig.henBeam.y}
						/>
					</Group>
					{showGameIntro && (
						<Group>
							<Rect
								width={1000}
								height={500}
								x={0.5 * gameConfig.stageDimensions.width - 500}
								y={0.5 * gameConfig.stageDimensions.height - 250}
								borderRadius={60}
								fill="black"
								opacity={0.5}
								stroke="white"
								strokeWidth={10}
								cornerRadius={20}
							/>
							<Image
								image={titleImage}
								width={900}
								height={405}
								x={0.5 * gameConfig.stageDimensions.width - 450}
								y={0.5 * gameConfig.stageDimensions.height - 202}
							/>
						</Group>
					)}
				</Layer>
				{children}
				{/* Dynamic App UI Layer */}
				<Layer>
					<Circle
						x={200}
						y={200}
						radius={20}
						onClick={() => {
							appActorRef.send({ type: 'Toggle mute' });
						}}
						fill={isMuted ? 'black' : 'green'}
					/>
					{showGameIntro && (
						// Play button
						<Button
							x={gameConfig.stageDimensions.width / 2 - 60}
							y={490}
							width={200}
							height={60}
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

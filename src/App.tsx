import { Circle, Group, Image, Layer, Rect, Stage, Text } from 'react-konva';
import { AppActorContext } from './app.machine';
import { GameLevel } from './GameLevel/GameLevel';

import './App.css';
import { DevPanel } from './DevPanel/DevPanel';
import useImage from 'use-image';

interface KonvaButtonProps {
	x: number;
	y: number;
	width: number;
	height: number;
	text: string;
	onClick: () => void;
}

function KonvaButton({ x, y, width, height, text, onClick }: KonvaButtonProps) {
	return (
		<>
			<Rect
				x={x}
				y={y}
				width={width}
				height={height}
				fill="lightblue"
				shadowBlur={5}
				cornerRadius={10}
				onClick={onClick} // Handle button clicks
				onMouseEnter={(e) => {
					// Change cursor to pointer on hover
					const container = e.target.getStage()?.container();
					if (container) {
						container.style.cursor = 'pointer';
					}
				}}
				onMouseLeave={(e) => {
					// Change cursor back to default when not hovering
					const container = e.target.getStage()?.container();
					if (container) {
						container.style.cursor = 'default';
					}
				}}
			/>
			<Text
				listening={false}
				x={x}
				y={y}
				text={text}
				fontSize={36}
				fontFamily="Arial"
				fill="black"
				align="center"
				width={width}
				height={height}
				verticalAlign="middle"
			/>
		</>
	);
}

function App() {
	const appActorRef = AppActorContext.useActorRef();
	const {
		stateValue,
		gameConfig,
		isLoading,
		showError,
		isBetweenLevels,
		gameScore,
	} = AppActorContext.useSelector((state) => ({
		stateValue: state.value,
		gameConfig: state.context.gameConfig,
		showError: state.matches('Show Error'),
		isLoading: state.matches('Loading'),
		showGameIntro: state.matches('Intro'),
		showGamePlay: state.matches('Game Play'),
		isBetweenLevels: state.hasTag('between levels'),
		gameScore: state.context.gameScore,
	}));

	if (showError) {
		return <div>Error loading the game...</div>;
	}

	if (isLoading) {
		return <div>Loading...</div>;
	}
	console.log('App render', stateValue);

	return (
		<KonvaStageAndBackground>
			<>
				{isBetweenLevels ? (
					<Layer>
						<KonvaButton
							x={gameConfig.stageDimensions.width / 2 - 150}
							y={gameConfig.stageDimensions.height / 2 - 50}
							width={300}
							height={100}
							text="Play next level"
							onClick={() => appActorRef.send({ type: 'Play' })}
						/>
						{/* Game score and other UI */}
						<Text
							x={10}
							y={300}
							text={`Score: ${gameScore}`}
							fontSize={30}
							fontFamily="Arial"
							fill="black"
						/>
					</Layer>
				) : (
					<GameLevel />
				)}
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

	const [bgImage] = useImage('images/kitchen-bg-4.png');
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
							image={bgImage}
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
							width={gameConfig.stageDimensions.width}
							height={35}
							y={80}
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
						<KonvaButton
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

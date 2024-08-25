import { Circle, Image, Layer, Rect, Stage, Text } from 'react-konva';
import { AppActorContext } from './app.machine';
import { GameLevel } from './GameLevel/GameLevel';
import { ActorRefFrom } from 'xstate';
import { gameLevelMachine } from './GameLevel/gameLevel.machine';

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

const App = () => {
	const appActorRef = AppActorContext.useActorRef();
	const {
		gameConfig,
		isLoading,
		showError,
		showGameIntro,
		showGamePlay,
		isInitializingLevel,
		isBetweenLevels,
		gameScore,
	} = AppActorContext.useSelector((state) => ({
		gameConfig: state.context.gameConfig,
		showError: state.matches('Show Error'),
		isLoading: state.matches('Loading'),
		showGameIntro: state.matches('Intro'),
		showGamePlay: state.matches('Game Play'),
		isInitializingLevel: state.hasTag('init level'),
		isBetweenLevels: state.hasTag('between levels'),
		gameScore: state.context.gameScore,
	}));

	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;

	// const [bgImage] = useImage('images/kitchen-bg-1.png');
	const [bgImage] = useImage('images/kitchen-bg-2.png');
	// const [bgImage] = useImage('images/kitchen-bg-3.png');

	if (showError) {
		return <div>Error loading the game...</div>;
	}

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (showGameIntro) {
		return (
			<Stage
				width={gameConfig.stageDimensions.width}
				height={gameConfig.stageDimensions.height}
				style={{ background: 'blue', border: '1px solid black' }}
			>
				<Layer>
					<Text
						x={gameConfig.stageDimensions.width / 2 - 200}
						y={gameConfig.stageDimensions.height / 2 - 50}
						text="EGG DROP"
						fontSize={80}
						fontFamily="Arial"
						fill="black"
					/>
					<KonvaButton
						x={gameConfig.stageDimensions.width / 2 - 150}
						y={400}
						width={300}
						height={100}
						text="Play"
						onClick={() => appActorRef.send({ type: 'Play' })}
					/>
				</Layer>
			</Stage>
		);
	}

	if (showGamePlay) {
		return (
			<>
				<Stage
					width={gameConfig.stageDimensions.width}
					height={gameConfig.stageDimensions.height}
					style={{ background: 'blue', border: '1px solid black' }}
				>
					{/* Background graphics layer - static */}
					<Layer listening={false}>
						<Image
							image={bgImage}
							width={gameConfig.stageDimensions.width}
							height={gameConfig.stageDimensions.height}
						/>
					</Layer>
					{isInitializingLevel ? (
						// Init level UI
						<Layer>
							<Text
								x={200}
								y={50}
								text="Init Level"
								fontSize={30}
								fontFamily="Arial"
								fill="black"
							/>
							<Circle x={100} y={100} radius={50} fill="red" />
						</Layer>
					) : isBetweenLevels ? (
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
					) : gameLevelActorRef ? (
						<GameLevel
							stageDimensions={gameConfig.stageDimensions}
							gameLevelActorRef={gameLevelActorRef}
						/>
					) : null}
				</Stage>
				<DevPanel />
				<button onClick={() => appActorRef.send({ type: 'Quit' })}>Quit</button>
			</>
		);
	}
};

export default App;

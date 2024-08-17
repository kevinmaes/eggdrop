import { Circle, Layer, Rect, Stage, Text } from 'react-konva';
import { AppActorContext } from './app.machine';
import { STAGE_DIMENSIONS } from './GameLevel/gameConfig';
import { GameLevel } from './GameLevel/GameLevel';
import { ActorRefFrom } from 'xstate';
import { gameLevelMachine } from './GameLevel/gameLevel.machine';

import './App.css';
import { DevPanel } from './DevPanel/DevPanel';

interface KonvaButtonProps {
	x: number;
	y: number;
	width: number;
	height: number;
	text: string;
	onClick: () => void;
}

function KonvaButton({ x, y, width, height, text, onClick }: KonvaButtonProps) {
	console.log('x', x, 'width', width);
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
		isLoading,
		showError,
		showGameIntro,
		showGamePlay,
		isInitializingLevel,
		isBetweenLevels,
	} = AppActorContext.useSelector((state) => ({
		showError: state.matches('Show Error'),
		isLoading: state.matches('Loading'),
		showGameIntro: state.matches('Intro'),
		showGamePlay: state.matches('Game Play'),
		isInitializingLevel: state.hasTag('init level'),
		isBetweenLevels: state.hasTag('between levels'),
	}));

	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;

	if (showError) {
		return <div>Error loading the game...</div>;
	}

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (showGameIntro) {
		return (
			<Stage
				width={STAGE_DIMENSIONS.width}
				height={STAGE_DIMENSIONS.height}
				style={{ background: 'pink', border: '1px solid black' }}
			>
				<Layer>
					<Text
						x={STAGE_DIMENSIONS.width / 2 - 200}
						y={STAGE_DIMENSIONS.height / 2 - 50}
						text="EGG DROP"
						fontSize={80}
						fontFamily="Arial"
						fill="black"
					/>
					<KonvaButton
						x={STAGE_DIMENSIONS.width / 2 - 150}
						y={400}
						width={300}
						height={100}
						text="Play"
						onClick={() => appActorRef.send({ type: 'Start' })}
					/>
				</Layer>
			</Stage>
		);
	}

	if (showGamePlay) {
		return (
			<>
				<Stage
					width={STAGE_DIMENSIONS.width}
					height={STAGE_DIMENSIONS.height}
					style={{ background: 'pink', border: '1px solid black' }}
				>
					{/* Background graphics layer - static */}
					<Layer>
						<Text
							x={1200}
							y={50}
							text="Kitchen bg"
							fontSize={30}
							fontFamily="Arial"
							fill="black"
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
							<Circle
								x={100}
								y={100}
								radius={50}
								fill="orange"
								onClick={() => appActorRef.send({ type: 'Start next level' })}
							/>
						</Layer>
					) : gameLevelActorRef ? (
						<GameLevel
							stageDimensions={STAGE_DIMENSIONS}
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

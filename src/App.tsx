import { Circle, Layer, Stage, Text } from 'react-konva';
import { AppActorContext } from './app.machine';
import { STAGE_DIMENSIONS } from './GameLevel/gameConfig';
import { GameLevel } from './GameLevel/GameLevel';
import { ActorRefFrom } from 'xstate';
import { gameLevelMachine } from './GameLevel/gameLevel.machine';

import './App.css';

console.log('env', process.env.NODE_ENV);

const App = () => {
	const appActorRef = AppActorContext.useActorRef();
	const {
		isLoading,
		showError,
		showGameIntro,
		showGamePlay,
		isInitializingLevel,
		showLevelSummary,
	} = AppActorContext.useSelector((state) => ({
		showError: state.matches('Show Error'),
		isLoading: state.matches('Loading'),
		showGameIntro: state.matches('Intro'),
		showGamePlay: state.matches('Game Play'),
		isInitializingLevel: state.hasTag('init level'),
		showLevelSummary: state.hasTag('level summary'),
	}));
	const lastLevelResults = AppActorContext.useSelector(
		(state) => state.context.levelResultsHistory.slice(-1)[0]
	);
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
			<div className="intro-container">
				<h1>Egg Drop</h1>
				<button onClick={() => appActorRef.send({ type: 'Start' })}>
					Start
				</button>
				{/* {process.env.NODE_ENV === 'development' && (
					<button
						onClick={() => {
							sounds.yipee.play();
						}}
					>
						Play caught
					</button>
				)} */}
			</div>
		);
	}

	console.log('levelStats', lastLevelResults?.levelStats);

	if (showGamePlay) {
		return (
			<>
				<Stage
					width={STAGE_DIMENSIONS.width}
					height={STAGE_DIMENSIONS.height}
					style={{ background: 'pink', border: '1px solid black' }}
				>
					{/* Background graphics layer */}
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
					) : showLevelSummary ? (
						<Layer>
							<Text
								x={200}
								y={50}
								text="In between levels"
								fontSize={30}
								fontFamily="Arial"
								fill="black"
							/>
							<Text
								x={400}
								y={450}
								text={`Total eggs laid ${lastLevelResults?.levelStats.totalEggsLaid}`}
								fontSize={30}
								fontFamily="Arial"
								fill="black"
							/>
							<Text
								x={400}
								y={500}
								text={`Total eggs caught ${lastLevelResults?.levelStats.totalEggsCaught}`}
								fontSize={30}
								fontFamily="Arial"
								fill="black"
							/>
							<Text
								x={800}
								y={500}
								text={`Catch rate ${Math.round(
									lastLevelResults?.levelStats.catchRate * 100
								)}%`}
								fontSize={30}
								fontFamily="Arial"
								fill="black"
							/>
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
				<button onClick={() => appActorRef.send({ type: 'Quit' })}>Quit</button>
			</>
		);
	}
};

export default App;

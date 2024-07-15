import { Circle, Layer, Stage, Text } from 'react-konva';
import { AppActorContext } from './app.machine';
import { STAGE_DIMENSIONS } from './GameLevel/gameConfig';
import { GameLevel } from './GameLevel/GameLevel';
import { ActorRefFrom } from 'xstate';
import { gameLevelMachine } from './GameLevel/gameLevel.machine';

const App = () => {
	const appActorRef = AppActorContext.useActorRef();
	const appState = AppActorContext.useSelector((state) => state);
	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;

	if (appState.matches('Show Error')) {
		return <div>Error loading the game...</div>;
	}

	if (appState.matches('Loading')) {
		return <div>Loading...</div>;
	}

	if (appState.matches('Intro')) {
		return (
			<div>
				<h1>Welcome to the game!</h1>
				<button onClick={() => appActorRef.send({ type: 'Start' })}>
					Start
				</button>
			</div>
		);
	}

	// console.log('appState', appState);

	if (appState.matches('Game Play')) {
		return (
			<>
				<Stage
					width={STAGE_DIMENSIONS.width}
					height={STAGE_DIMENSIONS.height}
					style={{ background: 'blue' }}
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
					{appState.hasTag('init level') ? (
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
					) : appState.hasTag('evolution') ? (
						<Layer>
							<Text
								x={200}
								y={50}
								text="In between levels"
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

	return <div>My game here</div>;
};

export default App;

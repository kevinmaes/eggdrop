import { AppActorContext } from './app.machine';
import { GameLevel } from './GameLevel/GameLevel';
import { GameLevelActorContext } from './GameLevel/gameLevel.machine';

const App = () => {
	const appActorRef = AppActorContext.useActorRef();
	const appState = AppActorContext.useSelector((state) => state);

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

	if (appState.matches('Game Play')) {
		return (
			<div>
				<GameLevelActorContext.Provider>
					<GameLevel stageDimensions={{ width: 1920, height: 1080 }} />
				</GameLevelActorContext.Provider>
				<button onClick={() => appActorRef.send({ type: 'Quit' })}>Quit</button>
			</div>
		);
	}

	return <div>My game here</div>;
};

export default App;

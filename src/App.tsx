import { useSelector } from '@xstate/react';
import { AppActorContext } from './app.machine';
import { GameLevel } from './GameLevel/GameLevel';

const App = () => {
	const appActorRef = AppActorContext.useActorRef();
	const appState = useSelector(appActorRef, (state) => state);

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
				<GameLevel stageDimensions={{ width: 1920, height: 1080 }} />
				<button onClick={() => appActorRef.send({ type: 'Quit' })}>Quit</button>
			</div>
		);
	}

	return <div>My game here</div>;
};

export default App;

import { useActor } from '@xstate/react';
import { appMachine } from './app.machine';
import { GameLevel } from './GameLevel/GameLevel';

const App = () => {
	const [state, send] = useActor(appMachine);

	if (state.matches('Show Error')) {
		return <div>Error loading the game...</div>;
	}

	if (state.matches('Loading')) {
		return <div>Loading...</div>;
	}

	if (state.matches('Intro')) {
		return (
			<div>
				<h1>Welcome to the game!</h1>
				<button onClick={() => send({ type: 'Start' })}>Start</button>
			</div>
		);
	}

	if (state.matches('Game Play')) {
		return (
			<div>
				<GameLevel stageDimensions={{ width: 1920, height: 1080 }} />
				<button onClick={() => send({ type: 'Quit' })}>Quit</button>
			</div>
		);
	}

	return <div>My game here</div>;
};

export default App;

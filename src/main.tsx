import React from 'react';
// import { createBrowserInspector } from '@statelyai/inspect';

import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AppActorContext } from './app.machine';

import './index.css';
import { getGameConfig } from './GameLevel/gameConfig.ts';
import { Howler } from 'howler';
// Get the game config which will be passed down to the app
const gameConfig = getGameConfig();

// Set the audio mute according to the isMuted value
Howler.mute(gameConfig.isMuted);

// const { inspect } = createBrowserInspector();

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AppActorContext.Provider
			options={{
				input: {
					gameConfig,
				},
				// inspect,
			}}
		>
			<App />
		</AppActorContext.Provider>
	</React.StrictMode>
);

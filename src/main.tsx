import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AppActorContext } from './app.machine';

import './index.css';
import { POPULATION_SIZE } from './GameLevel/gameConfig.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AppActorContext.Provider
			options={{
				input: {
					populationSize: POPULATION_SIZE,
				},
			}}
		>
			<App />
		</AppActorContext.Provider>
	</React.StrictMode>
);

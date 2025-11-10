import React from 'react';

import ReactDOM from 'react-dom/client';

import { Howler } from 'howler';

import { AppActorContext } from './app.machine';
import './index.css';
import App from './App.tsx';
import { getGameConfig } from './gameConfig.ts';

// Get the game config which will be passed down to the app
const gameConfig = getGameConfig();

// Set the audio mute according to the isMuted value
Howler.mute(gameConfig.isMuted);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppActorContext.Provider
    options={{
      input: {
        gameConfig,
      },
    }}
  >
    <App />
  </AppActorContext.Provider>
);

import React from 'react';

import ReactDOM from 'react-dom/client';

import { Howler } from 'howler';

import { AppActorContext } from './app.machine';
import './index.css';
import App from './App.tsx';
import { DemoStudio } from './demo-studio/DemoStudio.tsx';
import { getGameConfig } from './gameConfig.ts';

// Get the game config which will be passed down to the app
const gameConfig = getGameConfig();

// Set the audio mute according to the isMuted value
Howler.mute(gameConfig.isMuted);

// Simple routing: Check if we're in demo studio mode
const isDemoStudio = window.location.pathname === '/demo-studio';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isDemoStudio ? (
      <DemoStudio />
    ) : (
      <AppActorContext.Provider
        options={{
          input: {
            gameConfig,
          },
        }}
      >
        <App />
      </AppActorContext.Provider>
    )}
  </React.StrictMode>
);

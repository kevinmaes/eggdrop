import React from 'react';

import ReactDOM from 'react-dom/client';

import { Howler } from 'howler';

import { AppActorContext } from './app.machine';
import './index.css';
import App from './App.tsx';
import { getGameConfig } from './gameConfig.ts';
import { InspectorProofOfConcept } from './storybuk/InspectorProofOfConcept.tsx';
import { Storybuk } from './storybuk/Storybuk.tsx';

// Get the game config which will be passed down to the app
const gameConfig = getGameConfig();

// Set the audio mute according to the isMuted value
Howler.mute(gameConfig.isMuted);

// Simple routing: Check which route we're on
const pathname = window.location.pathname;
const isStorybuk = pathname === '/storybuk';
const isInspectorPOC = pathname === '/inspector-poc';

ReactDOM.createRoot(document.getElementById('root')!).render(
  isInspectorPOC || isStorybuk ? (
    // Inspector POC and Storybuk run without StrictMode to avoid double mounting issues with inspector
    isStorybuk ? (
      <Storybuk />
    ) : (
      <InspectorProofOfConcept />
    )
  ) : (
    <React.StrictMode>
      <AppActorContext.Provider
        options={{
          input: {
            gameConfig,
          },
        }}
      >
        <App />
      </AppActorContext.Provider>
    </React.StrictMode>
  )
);

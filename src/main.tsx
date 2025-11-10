import React from 'react';

import ReactDOM from 'react-dom/client';

import { Howler } from 'howler';

import { AppActorContext } from './app.machine';
import './index.css';
import App from './App.tsx';
import { DemoStudio } from './demo-studio/DemoStudio.tsx';
import { InspectorProofOfConcept } from './demo-studio/InspectorProofOfConcept.tsx';
import { getGameConfig } from './gameConfig.ts';

// Get the game config which will be passed down to the app
const gameConfig = getGameConfig();

// Set the audio mute according to the isMuted value
Howler.mute(gameConfig.isMuted);

// Simple routing: Check which route we're on
const pathname = window.location.pathname;
const isDemoStudio = pathname === '/demo-studio';
const isInspectorPOC = pathname === '/inspector-poc';

ReactDOM.createRoot(document.getElementById('root')!).render(
  isInspectorPOC || isDemoStudio ? (
    // Inspector POC and Demo Studio run without StrictMode to avoid double mounting issues with inspector
    isDemoStudio ? (
      <DemoStudio />
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

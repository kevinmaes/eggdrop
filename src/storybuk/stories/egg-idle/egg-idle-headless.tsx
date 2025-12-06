import { useEffect, useState } from 'react';

import { createActor } from 'xstate';

import { getSharedInspector } from '../../utils/shared-inspector';

import { eggIdleHeadlessMachine } from './egg-idle-headless.machine';

import type { ActorConfig } from '../../types';

/**
 * Headless Egg Idle Component with Inspector
 *
 * This component uses the same state machine structure as the visual egg idle demo
 * but displays state information as text instead of Konva graphics.
 * This allows the Stately Inspector to work without serialization issues.
 *
 * Purpose: Enable inspector visualization alongside visual demo
 * for presentation purposes.
 *
 * IMPORTANT: This component uses the shared inspector instance to ensure
 * that switching stories updates the same inspector window.
 */

interface EggIdleHeadlessProps {
  config: ActorConfig;
  resetCount?: number;
  shouldStart?: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export function EggIdleHeadless({
  config,
  resetCount = 0,
  canvasWidth,
  canvasHeight,
}: EggIdleHeadlessProps) {
  const [actor, setActor] = useState<any>(null);
  const [state, setState] = useState<any>(null);

  // Create actor with shared inspector - start actor immediately
  useEffect(() => {
    // Get the shared inspector instance
    const { inspect } = getSharedInspector();

    // Create and immediately start the actor with inspection
    // Starting the actor connects it to inspector
    // Include resetCount in ID to ensure each instance is unique for inspector
    const actorId = `${config.id || 'egg-idle-headless'}-${resetCount}`;
    const newActor = createActor(eggIdleHeadlessMachine as any, {
      id: actorId, // XState actor ID for inspector
      input: {
        startPosition: config.startPosition,
        id: actorId,
        canvasWidth,
        canvasHeight,
      },
      inspect,
    });

    // Start actor to connect to inspector
    newActor.start();

    // Subscribe to state changes
    newActor.subscribe((snapshot: any) => {
      setState(snapshot);
    });

    setActor(newActor);

    return () => {
      newActor.stop();
    };
  }, [config, resetCount, canvasWidth, canvasHeight]);

  if (!actor) {
    return (
      <div style={{ padding: '40px', fontFamily: 'monospace' }}>
        Loading headless demo...
      </div>
    );
  }

  if (!state) {
    return (
      <div style={{ padding: '40px', fontFamily: 'monospace' }}>
        <h1 style={{ color: '#4ec9b0', marginBottom: '10px' }}>
          Egg Idle (Headless Inspector Mode)
        </h1>
        <p style={{ color: '#808080', marginBottom: '20px' }}>
          Stationary egg for reference
        </p>
      </div>
    );
  }

  const context = state.context;
  const currentState = String(state.value);

  return (
    <div
      style={{
        padding: '40px',
        fontFamily: 'monospace',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ color: '#4ec9b0', marginBottom: '10px' }}>
        Egg Idle (Headless Inspector Mode)
      </h1>
      <p style={{ color: '#808080', marginBottom: '30px' }}>
        Text-based visualization for inspector integration
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          maxWidth: '800px',
        }}
      >
        {/* State Information */}
        <div
          style={{
            backgroundColor: '#252526',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #3e3e42',
          }}
        >
          <h2
            style={{ color: '#4fc1ff', fontSize: '18px', marginBottom: '15px' }}
          >
            State Information
          </h2>
          <StateField label="Current State" value={currentState} highlight />
          <StateField label="Actor ID" value={context.id} />
        </div>

        {/* Position Information */}
        <div
          style={{
            backgroundColor: '#252526',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #3e3e42',
          }}
        >
          <h2
            style={{ color: '#4fc1ff', fontSize: '18px', marginBottom: '15px' }}
          >
            Position Data
          </h2>
          <StateField
            label="Position X"
            value={Math.round(context.position.x)}
          />
          <StateField
            label="Position Y"
            value={Math.round(context.position.y)}
          />
          <StateField label="Canvas Width" value={context.canvasWidth} />
          <StateField label="Canvas Height" value={context.canvasHeight} />
        </div>
      </div>

      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#0e639c',
          borderRadius: '8px',
          maxWidth: '800px',
        }}
      >
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
          About This Demo:
        </h3>
        <p style={{ margin: 0 }}>
          This is the simplest egg state machine - just a single Idle state with
          no transitions or animations. It demonstrates the basic actor pattern
          and Konva integration for displaying sprites.
        </p>
      </div>
    </div>
  );
}

function StateField({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ color: '#858585', fontSize: '12px', marginBottom: '4px' }}>
        {label}
      </div>
      <div
        style={{
          color: highlight ? '#4ec9b0' : '#d4d4d4',
          fontSize: '16px',
          fontWeight: highlight ? 'bold' : 'normal',
        }}
      >
        {value}
      </div>
    </div>
  );
}

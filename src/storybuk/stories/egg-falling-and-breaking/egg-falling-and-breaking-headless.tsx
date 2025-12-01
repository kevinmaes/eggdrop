import { useEffect, useRef, useState } from 'react';

import { createActor } from 'xstate';

import { getSharedInspector } from '../../utils/shared-inspector';

import { eggFallingAndBreakingHeadlessMachine } from './egg-falling-and-breaking-headless.machine';

import type { ActorConfig } from '../../types';

/**
 * Headless Egg Falling and Breaking Component with Inspector
 *
 * This component uses the same state machine as the visual egg falling and breaking demo
 * but displays state information as text instead of Konva graphics.
 * This allows the Stately Inspector to work without serialization issues.
 *
 * Purpose: Enable recording inspector visualization alongside visual demo
 * for presentation purposes.
 *
 * IMPORTANT: This component uses the shared inspector instance to ensure
 * that switching stories updates the same inspector window.
 */

interface EggFallingAndBreakingHeadlessProps {
  config: ActorConfig;
  resetCount?: number;
  shouldStart?: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export function EggFallingAndBreakingHeadless({
  config,
  resetCount = 0,
  shouldStart = false,
  canvasWidth,
  canvasHeight,
}: EggFallingAndBreakingHeadlessProps) {
  const [actor, setActor] = useState<any>(null);
  const [state, setState] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Create actor with shared inspector - start actor but don't trigger animation yet
  useEffect(() => {
    // Get the shared inspector instance
    const { inspect } = getSharedInspector();

    // Create and immediately start the actor with inspection
    // Starting the actor connects it to inspector but machine stays in initial state
    // Include resetCount in ID to ensure each instance is unique for inspector
    const actorId = `${config.id || 'egg-falling-and-breaking-headless'}-${resetCount}`;
    const newActor = createActor(eggFallingAndBreakingHeadlessMachine as any, {
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

  // Send Start event when shouldStart becomes true
  useEffect(() => {
    if (shouldStart && actor && !hasStarted) {
      actor.send({ type: 'Start' });
      setHasStarted(true);
    }
  }, [shouldStart, actor, hasStarted]);

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
          Egg Falling and Breaking (Headless Inspector Mode)
        </h1>
        <p style={{ color: '#808080', marginBottom: '20px' }}>
          Ready to start. Click Play to begin synchronized playback.
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
        Egg Falling and Breaking (Headless Inspector Mode)
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
          <StateField
            label="Position Y"
            value={Math.round(context.position.y)}
            highlight={currentState === 'Falling'}
          />
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
            label="Current X"
            value={Math.round(context.position.x)}
          />
          <StateField
            label="Current Y"
            value={Math.round(context.position.y)}
          />
          <StateField
            label="Target Y"
            value={Math.round(context.targetPosition.y)}
          />
          <StateField label="Ground Y" value={context.groundY} />
          <StateField label="Canvas Height" value={context.canvasHeight} />
        </div>

        {/* Animation Information */}
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
            Animation Settings
          </h2>
          <StateField label="Falling Duration" value="3 seconds" />
          <StateField label="Rotation" value="720° or -720° (random)" />
          <StateField label="Animation Type" value="Tween-based" />
          <StateField label="Uses RAF" value="No" />
        </div>

        {/* Progress Information */}
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
            Progress & Status
          </h2>
          <StateField label="Actor ID" value={context.id} />
          <StateField
            label="Has Landed"
            value={
              currentState === 'Landed' || currentState === 'Splatting'
                ? 'Yes'
                : 'No'
            }
          />
          <StateField
            label="Is Splatted"
            value={currentState === 'Splatting' ? 'Yes' : 'No'}
          />
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
          Inspector Instructions:
        </h3>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li>
            The Stately Inspector should open in a separate window automatically
          </li>
          <li>
            Watch the state transitions in real-time as the egg falls with tween
            animation, rotates, and splats
          </li>
          <li>States: Waiting → Falling → Landed → Splatting</li>
          <li>The falling animation uses Konva.Tween (no RAF loop needed)</li>
          <li>
            Observe the smooth tween-based falling and transition to splatting
            state
          </li>
          <li>Rotation is handled by the tween actor (720° or -720° random)</li>
          <li>Splat remains visible indefinitely in Splatting state</li>
        </ol>
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

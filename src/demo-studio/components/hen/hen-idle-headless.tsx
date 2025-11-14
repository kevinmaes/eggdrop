import { useEffect, useState } from 'react';

import { createActor } from 'xstate';

import henIdleHeadlessMachine from '../../machines/hen/hen-idle-headless.machine';
import { getSharedInspector } from '../../utils/shared-inspector';

import type { ActorConfig } from '../../types';

/**
 * Headless Hen Idle Component with Inspector
 *
 * This component uses the idle state machine without Konva graphics.
 * Displays state information as text for inspector integration.
 *
 * Purpose: Enable recording inspector visualization for the simplest demo.
 *
 * IMPORTANT: This component uses the shared inspector instance to ensure
 * that switching demos updates the same inspector window.
 */

interface HenIdleHeadlessProps {
  config: ActorConfig;
  resetCount?: number;
  shouldStart?: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

function HenIdleHeadless({
  config,
  resetCount = 0,
  shouldStart = false,
  canvasWidth,
  canvasHeight,
}: HenIdleHeadlessProps) {
  const [actor, setActor] = useState<any>(null);
  const [state, setState] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Create actor with shared inspector - start actor but don't trigger animation yet
  useEffect(() => {
    // Get the shared inspector instance
    const { inspect } = getSharedInspector();

    // Create and immediately start the actor with inspection
    // Starting the actor connects it to inspector, machine starts in Ready state
    // Include resetCount in ID to ensure each instance is unique for inspector
    const actorId = `${config.id || 'hen-idle-headless'}-${resetCount}`;
    const newActor = createActor(henIdleHeadlessMachine as any, {
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
          Hen Idle (Headless Inspector Mode)
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
        Hen Idle (Headless Inspector Mode)
      </h1>
      <p style={{ color: '#808080', marginBottom: '30px' }}>
        Simplest possible demo - stationary hen in idle state
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
          <StateField label="Hen ID" value={context.id} />
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
          Inspector Instructions:
        </h3>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li>
            The Stately Inspector should open in a separate window automatically
          </li>
          <li>
            This is the simplest possible demo - the hen stays in Idle state
          </li>
          <li>No transitions or movement, perfect for understanding basics</li>
          <li>Context shows position and canvas dimensions</li>
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

export default HenIdleHeadless;

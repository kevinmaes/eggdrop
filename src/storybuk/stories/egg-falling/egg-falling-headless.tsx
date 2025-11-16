import { useEffect, useRef, useState } from 'react';

import { createActor } from 'xstate';

import eggFallingHeadlessMachine from './egg-falling-headless.machine';
import { getSharedInspector } from '../../utils/shared-inspector';

import type { ActorConfig } from '../../types';

/**
 * Headless Egg Falling Component with Inspector
 *
 * This component uses the same state machine as the visual egg falling demo
 * but displays state information as text instead of Konva graphics.
 * This allows the Stately Inspector to work without serialization issues.
 *
 * Purpose: Enable recording inspector visualization alongside visual demo
 * for presentation purposes.
 *
 * IMPORTANT: This component uses the shared inspector instance to ensure
 * that switching stories updates the same inspector window.
 */

interface EggFallingHeadlessProps {
  config: ActorConfig;
  resetCount?: number;
  shouldStart?: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

function EggFallingHeadless({
  config,
  resetCount = 0,
  shouldStart = false,
  canvasWidth,
  canvasHeight,
}: EggFallingHeadlessProps) {
  const [actor, setActor] = useState<any>(null);
  const [state, setState] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  // Create actor with shared inspector - start actor but don't trigger animation yet
  useEffect(() => {
    // Get the shared inspector instance
    const { inspect } = getSharedInspector();

    // Create and immediately start the actor with inspection
    // Starting the actor connects it to inspector but machine stays in initial state
    // Include resetCount in ID to ensure each instance is unique for inspector
    const actorId = `${config.id || 'egg-falling-headless'}-${resetCount}`;
    const newActor = createActor(eggFallingHeadlessMachine as any, {
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
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
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

  // Animation loop - send Update events on each frame
  useEffect(() => {
    if (!actor || !hasStarted) return;

    const animate = () => {
      actor.send({ type: 'Update' });
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [actor, hasStarted]);

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
          Egg Falling (Headless Inspector Mode)
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
        Egg Falling (Headless Inspector Mode)
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
          <StateField
            label="Velocity"
            value={context.velocity.toFixed(2)}
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
          <StateField label="Canvas Height" value={context.canvasHeight} />
        </div>

        {/* Physics Information */}
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
            Physics Data
          </h2>
          <StateField
            label="Current Velocity"
            value={`${context.velocity.toFixed(2)} px/frame`}
          />
          <StateField label="Gravity" value="0.15 px/frame²" />
          <StateField label="Max Velocity" value="8 px/frame" />
          <StateField
            label="Distance Fallen"
            value={`${Math.round(context.position.y - 100)}px`}
          />
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
            Progress
          </h2>
          <StateField label="Actor ID" value={context.id} />
          <StateField
            label="At Terminal Velocity"
            value={context.velocity >= 8 ? 'Yes' : 'No'}
          />
          <StateField
            label="Progress"
            value={`${Math.round((context.position.y / context.canvasHeight) * 100)}%`}
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
          <li>Watch the state transitions in real-time as the egg falls</li>
          <li>States: Waiting → Falling (continuous updates)</li>
          <li>
            Context values update every frame showing velocity and position
          </li>
          <li>
            Observe gravity acceleration until terminal velocity is reached
          </li>
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

export default EggFallingHeadless;

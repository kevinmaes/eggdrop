import { useEffect, useRef } from 'react';

import { useSelector } from '@xstate/react';
import { createActor } from 'xstate';

import { getSharedInspector } from '../../utils/shared-inspector';
import eggHatchHeadlessMachine from '../../machines/egg/egg-hatch-headless.machine';

import type { ActorConfig } from '../../types';

/**
 * Headless Egg Hatch Component
 *
 * Displays state information for the egg hatching demo in a text-based format.
 * This component is designed for Stately Inspector integration and doesn't
 * render any Konva graphics.
 *
 * Shows:
 * - Current state (Waiting, Falling, Landed, Hatching, ChickRunning, Complete)
 * - Position, velocity, and rotation (during falling)
 * - Chick run direction and position (during running)
 * - Inspector instructions
 */

function EggHatchHeadless({
  config,
  resetCount,
  shouldStart,
}: {
  config: ActorConfig;
  resetCount: number;
  shouldStart: boolean;
}) {
  const actorRef = useRef(
    createActor(eggHatchHeadlessMachine, {
      input: {
        id: config.id || 'egg-hatch-headless',
        startPosition: config.startPosition,
        canvasWidth: config.canvasWidth,
        canvasHeight: config.canvasHeight,
        rotationDirection: 1,
      },
      inspect: getSharedInspector().inspect,
    })
  );

  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  // Start the actor
  useEffect(() => {
    const actor = actorRef.current;
    actor.start();

    return () => {
      actor.stop();
    };
  }, [resetCount]);

  // Send Start event when shouldStart becomes true
  useEffect(() => {
    if (shouldStart) {
      actorRef.current.send({ type: 'Start' });
    }
  }, [shouldStart]);

  const snapshot = useSelector(actorRef.current, (state) => state);
  const context = snapshot.context;
  const currentState = snapshot.value as string;

  const isFalling = currentState === 'Falling';
  const isChickRunning = currentState === 'ChickRunning';

  // Animation loop for falling and chick running
  useEffect(() => {
    if (!isFalling && !isChickRunning) {
      return;
    }

    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateRef.current;

      if (elapsed >= frameTime) {
        actorRef.current.send({ type: 'Update' });
        lastUpdateRef.current = timestamp;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isFalling, isChickRunning]);

  // Helper component for displaying state fields
  function StateField({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 0',
          borderBottom: '1px solid #3c3c3c',
        }}
      >
        <span style={{ color: '#cccccc', fontWeight: 500 }}>{label}:</span>
        <span style={{ color: '#4ec9b0', fontFamily: 'monospace' }}>
          {value}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        padding: '30px',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        fontSize: '14px',
        overflow: 'auto',
      }}
    >
      <h2
        style={{
          margin: '0 0 20px 0',
          fontSize: '24px',
          fontWeight: 600,
          color: '#ffffff',
        }}
      >
        Egg Hatch Demo - Headless Actor
      </h2>

      {/* Current State */}
      <div
        style={{
          backgroundColor: '#252526',
          padding: '20px',
          borderRadius: '4px',
          marginBottom: '20px',
        }}
      >
        <h3
          style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#569cd6' }}
        >
          Current State
        </h3>
        <div
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#4ec9b0',
            textAlign: 'center',
            padding: '15px',
            backgroundColor: '#1e1e1e',
            borderRadius: '4px',
          }}
        >
          {currentState}
        </div>
      </div>

      {/* Context Information */}
      <div
        style={{
          backgroundColor: '#252526',
          padding: '20px',
          borderRadius: '4px',
          marginBottom: '20px',
        }}
      >
        <h3
          style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#569cd6' }}
        >
          Context Values
        </h3>
        <div>
          <StateField
            label="Current X"
            value={Math.round(context.position.x)}
          />
          <StateField
            label="Current Y"
            value={Math.round(context.position.y)}
          />
          <StateField label="Velocity" value={context.velocity.toFixed(2)} />
          <StateField
            label="Rotation"
            value={`${Math.round(context.rotation)}°`}
          />
          <StateField
            label="Rotation Direction"
            value={
              context.rotationDirection === 1
                ? 'Clockwise'
                : 'Counter-clockwise'
            }
          />
          <StateField
            label="Chick Run Direction"
            value={context.chickRunDirection === 1 ? 'Right →' : 'Left ←'}
          />
          <StateField label="Ground Y" value={context.groundY} />
        </div>
      </div>

      {/* State Flow */}
      <div
        style={{
          backgroundColor: '#252526',
          padding: '20px',
          borderRadius: '4px',
          marginBottom: '20px',
        }}
      >
        <h3
          style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#569cd6' }}
        >
          State Flow
        </h3>
        <div style={{ lineHeight: '1.8', color: '#cccccc' }}>
          <div>1. Waiting (initial state)</div>
          <div>2. Falling (gravity + rotation)</div>
          <div>3. Landed (transition)</div>
          <div>4. Hatching (1 second pause)</div>
          <div>5. ChickRunning (runs off screen)</div>
          <div>6. Complete (final state)</div>
        </div>
      </div>

      {/* Inspector Instructions */}
      <div
        style={{
          backgroundColor: '#252526',
          padding: '20px',
          borderRadius: '4px',
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
            Watch the complete state flow: Waiting → Falling → Landed → Hatching
            → ChickRunning → Complete
          </li>
          <li>
            Observe gravity physics during Falling state (velocity increases)
          </li>
          <li>Watch the 1-second delay timer during Hatching state</li>
          <li>
            Track chick position as it runs off screen (ChickRunning state)
          </li>
          <li>Note the random chickRunDirection chosen at initialization</li>
        </ol>
      </div>
    </div>
  );
}

export default EggHatchHeadless;

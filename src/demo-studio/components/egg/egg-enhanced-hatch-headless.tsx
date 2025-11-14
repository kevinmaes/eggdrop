import { useEffect, useRef } from 'react';

import { useSelector } from '@xstate/react';
import { createActor } from 'xstate';

import eggEnhancedHatchHeadlessMachine from '../../machines/egg/egg-enhanced-hatch-headless.machine';
import { getSharedInspector } from '../../utils/shared-inspector';

import type { ActorConfig } from '../../types';

/**
 * Headless Enhanced Egg Hatch Component
 *
 * Displays state information for the enhanced egg hatching demo with detailed animations.
 * This component is designed for Stately Inspector integration.
 *
 * Shows:
 * - Current state (9 states total)
 * - Position, velocity, rotation
 * - Jump and animation progress
 * - Chick walk direction
 * - Inspector instructions
 */

function EggEnhancedHatchHeadless({
  config,
  resetCount,
  shouldStart,
  canvasWidth,
  canvasHeight,
}: {
  config: ActorConfig;
  resetCount: number;
  shouldStart: boolean;
  canvasWidth: number;
  canvasHeight: number;
}) {
  const actorRef = useRef(
    createActor(eggEnhancedHatchHeadlessMachine, {
      input: {
        id: config.id || 'egg-enhanced-hatch-headless',
        startPosition: config.startPosition,
        canvasWidth,
        canvasHeight,
        rotationDirection: 1,
      },
      inspect: getSharedInspector().inspect,
    })
  );

  const animationFrameRef = useRef<number>(0);
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

  const needsAnimation =
    currentState === 'Falling' ||
    currentState === 'Cracking' ||
    currentState === 'JumpingUp' ||
    currentState === 'BouncingDown' ||
    currentState === 'Walking';

  // Animation loop
  useEffect(() => {
    if (!needsAnimation) {
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

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [needsAnimation]);

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
        Enhanced Hatching Demo - Headless Actor
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
            label="Chick Walk Direction"
            value={context.chickWalkDirection === 1 ? 'Right →' : 'Left ←'}
          />
          <StateField label="Ground Y" value={context.groundY} />
          <StateField
            label="Jump Start Y"
            value={Math.round(context.jumpStartY)}
          />
        </div>
      </div>

      {/* Animation Details */}
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
          Animation Details
        </h3>
        <div style={{ lineHeight: '1.8', color: '#cccccc' }}>
          <div>• Cracking Duration: 500ms (wobble animation)</div>
          <div>• Hatching Pause: 300ms</div>
          <div>• Jump Up: 400ms (70px height, easeOut)</div>
          <div>• Bounce Down: 400ms (bounceEaseOut)</div>
          <div>• Walk Speed: 2 pixels/frame</div>
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
          <div>4. Cracking (500ms wobble animation)</div>
          <div>5. Hatching (300ms pause)</div>
          <div>6. JumpingUp (400ms jump with easeOut)</div>
          <div>7. BouncingDown (400ms bounce with bounceEaseOut)</div>
          <div>8. Walking (walks off screen)</div>
          <div>9. Complete (final state)</div>
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
          <li>Watch the complete 9-state flow with realistic animations</li>
          <li>Observe the cracking wobble animation (rotation oscillates)</li>
          <li>Track the jump physics (easeOut up, bounceEaseOut down)</li>
          <li>Watch position updates during each animation phase</li>
          <li>Note the random chickWalkDirection chosen at initialization</li>
        </ol>
      </div>
    </div>
  );
}

export default EggEnhancedHatchHeadless;

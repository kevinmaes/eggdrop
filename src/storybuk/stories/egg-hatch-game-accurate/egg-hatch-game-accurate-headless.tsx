import { useEffect, useRef } from 'react';

import { useSelector } from '@xstate/react';
import { createActor } from 'xstate';

import { getSharedInspector } from '../../utils/shared-inspector';

import eggHatchGameAccurateHeadlessMachine from './egg-hatch-game-accurate-headless.machine';

import type { ActorConfig } from '../../types';

/**
 * Headless Game-Accurate Egg Hatch Component
 *
 * Displays state information for the game-accurate egg hatching demo.
 * Matches the exact state sequence from the real game.
 *
 * States:
 * - Waiting
 * - Falling
 * - Landed
 * - Hatching (300ms pause)
 * - Hatching Jump (nested: Jumping Up → Bouncing Down)
 * - Hatched (500ms pause)
 * - Exiting (1s slide)
 * - Done
 */

interface EggHatchGameAccurateHeadlessProps {
  config: ActorConfig;
  resetCount: number;
  shouldStart: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

function EggHatchGameAccurateHeadless({
  config,
  resetCount,
  shouldStart,
  canvasWidth,
  canvasHeight,
}: EggHatchGameAccurateHeadlessProps) {
  const actorRef = useRef(
    createActor(eggHatchGameAccurateHeadlessMachine, {
      input: {
        id: config.id || 'egg-hatch-game-accurate-headless',
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

  useEffect(() => {
    const actor = actorRef.current;
    actor.start();

    return () => {
      actor.stop();
    };
  }, [resetCount]);

  useEffect(() => {
    if (shouldStart) {
      actorRef.current.send({ type: 'Start' });
    }
  }, [shouldStart]);

  const snapshot = useSelector(actorRef.current, (state) => state);
  const context = snapshot.context;
  const currentState = snapshot.value;

  // Get nested state if in Hatching Jump
  let displayState: string =
    typeof currentState === 'string' ? currentState : 'Unknown';
  if (typeof currentState === 'object' && 'Hatching Jump' in currentState) {
    displayState = `Hatching Jump / ${currentState['Hatching Jump']}`;
  }

  const isJumpingUp =
    typeof currentState === 'object' &&
    'Hatching Jump' in currentState &&
    currentState['Hatching Jump'] === 'Jumping Up';
  const isBouncingDown =
    typeof currentState === 'object' &&
    'Hatching Jump' in currentState &&
    currentState['Hatching Jump'] === 'Bouncing Down';

  const needsAnimation =
    currentState === 'Falling' ||
    isJumpingUp ||
    isBouncingDown ||
    currentState === 'Exiting';

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
        Game-Accurate Hatching - Headless Actor
      </h2>

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
          {displayState}
        </div>
      </div>

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
            label="Chick Exit Direction"
            value={context.chickExitDirection === 1 ? 'Right →' : 'Left ←'}
          />
          <StateField label="Ground Y" value={context.groundY} />
          <StateField
            label="Jump Start Y"
            value={Math.round(context.jumpStartY)}
          />
        </div>
      </div>

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
          Game-Accurate Timings
        </h3>
        <div style={{ lineHeight: '1.8', color: '#cccccc' }}>
          <div>• Hatching Pause: 300ms</div>
          <div>• Jump Up: 400ms (70px, easeOut)</div>
          <div>• Bounce Down: 400ms (bounceEaseOut)</div>
          <div>• Hatched Pause: 500ms</div>
          <div>• Exit Duration: 1000ms (linear slide)</div>
        </div>
      </div>

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
          State Flow (matches game)
        </h3>
        <div style={{ lineHeight: '1.8', color: '#cccccc' }}>
          <div>1. Waiting (initial)</div>
          <div>2. Falling (gravity + rotation)</div>
          <div>3. Landed (transition)</div>
          <div>4. Hatching (300ms pause)</div>
          <div>5. Hatching Jump:</div>
          <div> → Jumping Up (400ms)</div>
          <div> → Bouncing Down (400ms)</div>
          <div>6. Hatched (500ms pause)</div>
          <div>7. Exiting (1s linear slide)</div>
          <div>8. Done (final)</div>
        </div>
      </div>

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
          <li>The Stately Inspector opens automatically</li>
          <li>
            This story matches the actual game's egg.machine.ts state sequence
            exactly
          </li>
          <li>Observe the nested "Hatching Jump" state with substates</li>
          <li>Watch the timed delays (300ms, 400ms, 500ms, 1000ms)</li>
          <li>Note: No "Cracking" state - matches the actual game</li>
        </ol>
      </div>
    </div>
  );
}

export default EggHatchGameAccurateHeadless;

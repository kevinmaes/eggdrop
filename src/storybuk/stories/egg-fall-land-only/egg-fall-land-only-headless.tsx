import { useEffect, useRef } from 'react';

import { useSelector } from '@xstate/react';
import { createActor } from 'xstate';

import { getSharedInspector } from '../../utils/shared-inspector';

import eggFallLandOnlyHeadlessMachine from './egg-fall-land-only-headless.machine';

import type { ActorConfig } from '../../types';

/**
 * Headless Falling and Landing Only Component
 *
 * Displays state information for the falling and landing demo.
 * Focuses on physics and landing detection in isolation.
 */

interface EggFallLandOnlyHeadlessProps {
  config: ActorConfig;
  resetCount: number;
  shouldStart: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

function EggFallLandOnlyHeadless({
  config,
  resetCount,
  shouldStart,
  canvasWidth,
  canvasHeight,
}: EggFallLandOnlyHeadlessProps) {
  const actorRef = useRef(
    createActor(eggFallLandOnlyHeadlessMachine, {
      input: {
        id: config.id || 'egg-fall-land-only-headless',
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

  const needsAnimation = currentState === 'Falling';

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
        Falling and Landing Only - Headless Actor
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
          {currentState}
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
          <StateField label="Ground Y" value={context.groundY} />
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
          Physics Settings
        </h3>
        <div style={{ lineHeight: '1.8', color: '#cccccc' }}>
          <div>• Gravity: 0.15</div>
          <div>• Max Velocity: 8</div>
          <div>• Rotation Speed: 5°/frame</div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#252526',
          padding: '20px',
          borderRadius: '4px',
        }}
      >
        <h3
          style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#569cd6' }}
        >
          State Flow
        </h3>
        <div style={{ lineHeight: '1.8', color: '#cccccc' }}>
          <div>1. Waiting (initial position)</div>
          <div>2. Falling (gravity + rotation)</div>
          <div>3. Landed (positioned on ground)</div>
          <div>4. Done (final)</div>
        </div>
      </div>
    </div>
  );
}

export default EggFallLandOnlyHeadless;

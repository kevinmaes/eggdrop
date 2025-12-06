import { useEffect, useRef } from 'react';

import { useSelector } from '@xstate/react';
import { createActor } from 'xstate';

import { getSharedInspector } from '../../utils/shared-inspector';

import { eggLandHatchHeadlessMachine } from './egg-land-hatch-headless.machine';

import type { ActorConfig } from '../../types';

/**
 * Headless Egg Land and Hatch Component
 *
 * Displays state information for the land and hatch demo.
 * Shows egg falling, landing, and transitioning to hatched chick in shell.
 */

interface EggLandHatchHeadlessProps {
  config: ActorConfig;
  resetCount: number;
  shouldStart: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export function EggLandHatchHeadless({
  config,
  resetCount,
  shouldStart,
  canvasWidth,
  canvasHeight,
}: EggLandHatchHeadlessProps) {
  const actorRef = useRef(
    createActor(eggLandHatchHeadlessMachine, {
      input: {
        id: config.id || 'egg-land-hatch-headless',
        startPosition: config.startPosition,
        canvasWidth,
        canvasHeight,
      },
      inspect: getSharedInspector().inspect,
    })
  );

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
        Land and Hatch - Headless Actor
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
          <StateField
            label="Target Y"
            value={Math.round(context.targetPosition.y)}
          />
          <StateField label="Ground Y" value={context.groundY} />
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
          <div>2. Falling (tween-based with rotation)</div>
          <div>3. Landed (positioned on ground)</div>
          <div>4. Hatching (300ms pause, shows chick in shell)</div>
          <div>5. Done (final)</div>
          <div>• Animation: Tween-based (no RAF)</div>
        </div>
      </div>
    </div>
  );
}

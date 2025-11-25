import { useEffect, useState } from 'react';

import { createActor } from 'xstate';

import { getSharedInspector } from '../../utils/shared-inspector';

import { henChefCatchHeadlessMachine } from './hen-chef-catch-headless.machine';

import type { ActorConfig } from '../../types';

/**
 * Headless Hen-Chef-Catch Component
 *
 * Headless version for XState Inspector integration.
 * Displays state information as text while the inspector shows the state chart.
 */

interface HenChefCatchHeadlessProps {
  config: ActorConfig;
  resetCount?: number;
  shouldStart?: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export function HenChefCatchHeadless({
  config,
  resetCount = 0,
  shouldStart = false,
  canvasWidth,
  canvasHeight,
}: HenChefCatchHeadlessProps) {
  const [actor, setActor] = useState<any>(null);
  const [state, setState] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Create actor with shared inspector
  useEffect(() => {
    const { inspect } = getSharedInspector();

    const actorId = `${config.id || 'hen-chef-catch-headless'}-${resetCount}`;
    const newActor = createActor(henChefCatchHeadlessMachine as any, {
      id: actorId,
      input: {
        startPosition: config.startPosition,
        id: actorId,
        canvasWidth,
        canvasHeight,
      },
      inspect,
    });

    newActor.start();

    newActor.subscribe((snapshot: any) => {
      setState(snapshot);
    });

    setActor(newActor);

    return () => {
      newActor.stop();
    };
  }, [config, resetCount, canvasWidth, canvasHeight]);

  // Send Play event when shouldStart becomes true
  useEffect(() => {
    if (shouldStart && actor && !hasStarted) {
      actor.send({ type: 'Play' });
      setHasStarted(true);
    }
  }, [shouldStart, actor, hasStarted]);

  if (!actor || !state) {
    return (
      <div style={{ padding: '40px', fontFamily: 'monospace' }}>
        Loading headless demo...
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
        Hen-Chef-Catch (Headless Inspector Mode)
      </h1>
      <p style={{ color: '#808080', marginBottom: '30px' }}>
        Coordinated actors: Hen lays eggs → Eggs fall → Chef catches them
      </p>

      <div
        style={{
          backgroundColor: '#252526',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #3e3e42',
          maxWidth: '600px',
        }}
      >
        <h2
          style={{ color: '#4fc1ff', fontSize: '18px', marginBottom: '15px' }}
        >
          Orchestrator State
        </h2>
        <StateField label="Current State" value={currentState} highlight />
        <StateField label="Canvas Width" value={context.canvasWidth} />
        <StateField label="Canvas Height" value={context.canvasHeight} />
      </div>

      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#0e639c',
          borderRadius: '8px',
          maxWidth: '600px',
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
            Shows the orchestrator machine coordinating hen, chef, and eggs
          </li>
          <li>Click Play to see the full coordination flow</li>
          <li>Watch collision detection happen in real-time</li>
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

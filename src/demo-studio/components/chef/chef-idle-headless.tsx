import { useEffect, useState } from 'react';

import { createActor } from 'xstate';

import chefIdleHeadlessMachine from '../../machines/chef/chef-idle-headless.machine';
import { getSharedInspector } from '../../utils/shared-inspector';

import type { ActorConfig } from '../../types';

/**
 * Headless Chef Idle Component with Inspector
 *
 * Uses idle state machine without Konva graphics.
 * Displays state information as text for inspector integration.
 *
 * Purpose: Enable recording inspector visualization for simplest chef demo.
 */

interface ChefIdleHeadlessProps {
  config: ActorConfig;
  resetCount?: number;
  shouldStart?: boolean;
}

function ChefIdleHeadless({
  config,
  resetCount = 0,
  shouldStart = false,
}: ChefIdleHeadlessProps) {
  const [actor, setActor] = useState<any>(null);
  const [state, setState] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Create actor with shared inspector
  useEffect(() => {
    const { inspect } = getSharedInspector();

    const actorId = `${config.id || 'chef-idle-headless'}-${resetCount}`;
    const newActor = createActor(chefIdleHeadlessMachine as any, {
      id: actorId,
      input: {
        startPosition: config.startPosition,
        id: actorId,
        canvasWidth: config.canvasWidth,
        canvasHeight: config.canvasHeight,
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
  }, [config, resetCount]);

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
          Chef Idle (Headless Inspector Mode)
        </h1>
        <p style={{ color: '#808080', marginBottom: '20px' }}>
          Ready to start. Click Play to begin synchronized playback.
        </p>
      </div>
    );
  }

  const context = state.context || {};
  const currentStateName = state.value || 'Unknown';

  return (
    <div
      style={{
        padding: '40px',
        fontFamily: 'monospace',
        backgroundColor: '#1e1e1e',
        minHeight: '100%',
        color: '#cccccc',
      }}
    >
      <h1 style={{ color: '#4ec9b0', marginBottom: '10px', fontSize: '24px' }}>
        Chef Idle (Headless Inspector Mode)
      </h1>
      <p style={{ color: '#808080', marginBottom: '30px' }}>
        Stationary chef in idle state. Open Stately Inspector to view state
        machine.
      </p>

      {/* Current State */}
      <div
        style={{
          backgroundColor: '#252526',
          padding: '20px',
          borderRadius: '8px',
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
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#4ec9b0',
            marginBottom: '10px',
          }}
        >
          {currentStateName}
        </div>
      </div>

      {/* Context Values */}
      <div
        style={{
          backgroundColor: '#252526',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h3
          style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#569cd6' }}
        >
          Context Values
        </h3>
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#9cdcfe' }}>Position X:</span>{' '}
            <span style={{ color: '#b5cea8' }}>
              {Math.round(context.position?.x || 0)}
            </span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#9cdcfe' }}>Position Y:</span>{' '}
            <span style={{ color: '#b5cea8' }}>
              {Math.round(context.position?.y || 0)}
            </span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#9cdcfe' }}>Canvas Width:</span>{' '}
            <span style={{ color: '#b5cea8' }}>{context.canvasWidth}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#9cdcfe' }}>Canvas Height:</span>{' '}
            <span style={{ color: '#b5cea8' }}>{context.canvasHeight}</span>
          </div>
        </div>
      </div>

      {/* State Flow */}
      <div
        style={{
          backgroundColor: '#252526',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h3
          style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#569cd6' }}
        >
          State Flow
        </h3>
        <div style={{ lineHeight: '1.8', color: '#cccccc' }}>
          <div>1. Ready (initial)</div>
          <div>2. Idle (final - stays forever)</div>
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          backgroundColor: '#252526',
          padding: '20px',
          borderRadius: '8px',
        }}
      >
        <h3
          style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#569cd6' }}
        >
          Inspector Instructions
        </h3>
        <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>
            The Stately Inspector should open in a separate window automatically
          </li>
          <li>Watch the simple state flow: Ready → Idle</li>
          <li>Observe that chef stays in Idle state with no transitions</li>
        </ol>
      </div>
    </div>
  );
}

export default ChefIdleHeadless;

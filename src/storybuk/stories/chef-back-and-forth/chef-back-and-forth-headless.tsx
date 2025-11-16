import { useEffect, useState } from 'react';

import { createActor } from 'xstate';

import chefBackAndForthHeadlessMachine from './chef-back-and-forth-headless.machine';
import { getSharedInspector } from '../../utils/shared-inspector';

import type { ActorConfig } from '../../types';

/**
 * Headless Chef Back-and-Forth Component with Inspector
 *
 * Displays state information as text instead of Konva graphics.
 * Allows Stately Inspector to work without serialization issues.
 *
 * Purpose: Enable recording inspector visualization alongside visual demo.
 */

interface ChefBackAndForthHeadlessProps {
  config: ActorConfig;
  resetCount?: number;
  shouldStart?: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

function ChefBackAndForthHeadless({
  config,
  resetCount = 0,
  shouldStart = false,
  canvasWidth,
  canvasHeight,
}: ChefBackAndForthHeadlessProps) {
  const [actor, setActor] = useState<any>(null);
  const [state, setState] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Create actor with shared inspector
  useEffect(() => {
    const { inspect } = getSharedInspector();

    const actorId = `${config.id || 'chef-back-and-forth-headless'}-${resetCount}`;
    const newActor = createActor(chefBackAndForthHeadlessMachine as any, {
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
          Chef Back-and-Forth (Headless Inspector Mode)
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
        Chef Back-and-Forth (Headless Inspector Mode)
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
          <StateField label="Destination" value={context.destination} />
          <StateField
            label="Moving Direction"
            value={context.movingDirection}
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
            label="Target X"
            value={Math.round(context.targetPosition.x)}
          />
          <StateField
            label="Target Y"
            value={Math.round(context.targetPosition.y)}
          />
        </div>

        {/* Movement Bounds */}
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
            Movement Bounds
          </h2>
          <StateField label="Left Edge" value={Math.round(context.leftEdge)} />
          <StateField
            label="Right Edge"
            value={Math.round(context.rightEdge)}
          />
          <StateField label="Canvas Width" value={context.canvasWidth} />
          <StateField label="Canvas Height" value={context.canvasHeight} />
        </div>

        {/* Tween Information */}
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
            Animation Data
          </h2>
          <StateField
            label="Tween Speed"
            value={context.currentTweenSpeed.toFixed(2)}
          />
          <StateField
            label="Tween Direction"
            value={
              context.currentTweenDirection === 1
                ? 'Right'
                : context.currentTweenDirection === -1
                  ? 'Left'
                  : 'None'
            }
          />
          <StateField
            label="Tween Duration"
            value={`${Math.round(context.currentTweenDurationMS)}ms`}
          />
          <StateField
            label="Has Tween"
            value={context.currentTween ? 'Yes' : 'No'}
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
          <li>Watch the state transitions in real-time as the chef moves</li>
          <li>
            States: Offscreen → Moving → Done Moving → Reached Destination
            (loops)
          </li>
          <li>Context values update as the chef moves between edges</li>
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

export default ChefBackAndForthHeadless;

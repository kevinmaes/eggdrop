import { useEffect, useRef, useState } from 'react';

import { createBrowserInspector } from '@statelyai/inspect';
import { createActor } from 'xstate';

import henWithPausesHeadlessMachine from '../../machines/hen/hen-with-pauses-headless.machine';

import type { ActorConfig } from '../../types';

/**
 * Headless Hen With Pauses Component with Inspector
 *
 * This component uses the with-pauses state machine without Konva graphics.
 * Displays state information as text for inspector integration.
 *
 * Purpose: Enable recording inspector visualization for pause behavior demo.
 *
 * IMPORTANT: This component creates its OWN inspector instance and actor,
 * ignoring the actor passed from ActorFactory to avoid the shared inspector.
 */

interface HenWithPausesHeadlessProps {
  config: ActorConfig;
  shouldStart?: boolean;
}

function HenWithPausesHeadless({
  config,
  shouldStart = false,
}: HenWithPausesHeadlessProps) {
  const [actor, setActor] = useState<any>(null);
  const [state, setState] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const inspectorRef = useRef<ReturnType<typeof createBrowserInspector> | null>(
    null
  );

  // Create actor and inspector once
  useEffect(() => {
    // Create the inspector instance once
    if (!inspectorRef.current) {
      inspectorRef.current = createBrowserInspector();
    }

    const { inspect } = inspectorRef.current;

    // Create our own actor with inspection (but don't start it yet)
    const newActor = createActor(henWithPausesHeadlessMachine as any, {
      input: {
        startPosition: config.startPosition,
        id: config.id || `hen-with-pauses-headless-${Date.now()}`,
        canvasWidth: config.canvasWidth,
        canvasHeight: config.canvasHeight,
      },
      inspect,
    });

    // DO NOT subscribe yet - subscribing may auto-start the actor
    setActor(newActor);

    return () => {
      newActor.stop();
    };
  }, [config]);

  // Start actor when shouldStart becomes true
  useEffect(() => {
    if (shouldStart && actor && !hasStarted) {
      // Start actor first
      actor.start();
      // Then subscribe to state changes
      actor.subscribe((snapshot: any) => {
        setState(snapshot);
      });
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
          Hen With Pauses (Headless Inspector Mode)
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
        Hen With Pauses (Headless Inspector Mode)
      </h1>
      <p style={{ color: '#808080', marginBottom: '30px' }}>
        Back and forth movement with 1-2 second pauses at each destination
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

        {/* Pause & Animation Information */}
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
            Pause & Animation Data
          </h2>
          <StateField
            label="Pause Duration"
            value={`${Math.round(context.pauseDuration)}ms`}
          />
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
          <li>Watch the state transitions as the hen moves and pauses</li>
          <li>
            States: Offscreen → Moving → Done Moving → Reached Destination →
            Pausing (loops)
          </li>
          <li>
            Note the Pausing state with random 1-2 second duration at each
            destination
          </li>
          <li>Context values update as the hen moves between edges</li>
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

export default HenWithPausesHeadless;

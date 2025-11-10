import { useEffect, useRef, useState } from 'react';
import { createActor } from 'xstate';
import { createBrowserInspector } from '@statelyai/inspect';

import henBackAndForthHeadlessMachine from '../../machines/hen/hen-back-and-forth-headless.machine';
import type { ActorConfig } from '../../types';

/**
 * Headless Hen Back-and-Forth Component with Inspector
 *
 * This component uses the same state machine as the visual hen demo
 * but displays state information as text instead of Konva graphics.
 * This allows the Stately Inspector to work without serialization issues.
 *
 * Purpose: Enable recording inspector visualization alongside visual demo
 * for presentation purposes.
 *
 * IMPORTANT: This component creates its OWN inspector instance and actor,
 * ignoring the actor passed from ActorFactory to avoid the shared inspector.
 */

interface HenBackAndForthHeadlessProps {
  config: ActorConfig;
}

function HenBackAndForthHeadless({ config }: HenBackAndForthHeadlessProps) {
  const [actor, setActor] = useState<any>(null);
  const [state, setState] = useState<any>(null);
  const inspectorRef = useRef<ReturnType<typeof createBrowserInspector> | null>(
    null
  );

  useEffect(() => {
    // Create the inspector instance once
    if (!inspectorRef.current) {
      inspectorRef.current = createBrowserInspector();
    }

    const { inspect } = inspectorRef.current;

    // Create our own actor with inspection
    const newActor = createActor(henBackAndForthHeadlessMachine, {
      input: {
        startPosition: config.startPosition,
        id: config.id || `hen-headless-${Date.now()}`,
        canvasWidth: config.canvasWidth,
        canvasHeight: config.canvasHeight,
      },
      inspect,
    });

    newActor.subscribe((snapshot) => {
      setState(snapshot);
    });

    newActor.start();
    setActor(newActor);

    return () => {
      newActor.stop();
    };
  }, [config]);

  if (!state) {
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
        Hen Back-and-Forth (Headless Inspector Mode)
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
          <li>Watch the state transitions in real-time as the hen moves</li>
          <li>
            States: Offscreen → Moving → Done Moving → Reached Destination
            (loops)
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

export default HenBackAndForthHeadless;

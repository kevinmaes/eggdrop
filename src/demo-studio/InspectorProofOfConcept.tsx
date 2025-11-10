import { useEffect, useRef, useState } from 'react';
import { createActor, setup } from 'xstate';
import { createBrowserInspector } from '@statelyai/inspect';

/**
 * Proof of Concept: Simple Traffic Light State Machine with Inspector
 *
 * This is a minimal example to verify the Stately Inspector works correctly
 * without any Konva, React refs, or other complex dependencies.
 */

// Simple traffic light state machine
const trafficLightMachine = setup({
  types: {
    context: {} as {
      cycleCount: number;
    },
    events: {} as { type: 'TIMER' } | { type: 'RESET' },
  },
  actions: {
    incrementCycle: ({ context }) => {
      context.cycleCount++;
    },
    resetCycle: ({ context }) => {
      context.cycleCount = 0;
    },
  },
}).createMachine({
  id: 'trafficLight',
  initial: 'red',
  context: {
    cycleCount: 0,
  },
  states: {
    red: {
      after: {
        2000: 'green',
      },
    },
    green: {
      after: {
        2000: 'yellow',
      },
    },
    yellow: {
      entry: 'incrementCycle',
      after: {
        1000: 'red',
      },
    },
  },
  on: {
    RESET: {
      target: '.red',
      actions: 'resetCycle',
    },
  },
});

export function InspectorProofOfConcept() {
  const [actor, setActor] = useState<any>(null);
  const [currentState, setCurrentState] = useState('red');
  const [cycleCount, setCycleCount] = useState(0);
  const [inspectorStarted, setInspectorStarted] = useState(false);
  const inspectorRef = useRef<ReturnType<typeof createBrowserInspector> | null>(
    null
  );

  useEffect(() => {
    // Create the inspector instance once
    if (!inspectorRef.current) {
      inspectorRef.current = createBrowserInspector();
      setInspectorStarted(true);
    }

    const { inspect } = inspectorRef.current;

    // Create and start the actor with inspection
    const newActor = createActor(trafficLightMachine, {
      inspect,
    });

    newActor.subscribe((snapshot) => {
      setCurrentState(snapshot.value as string);
      setCycleCount(snapshot.context.cycleCount);
    });

    newActor.start();
    setActor(newActor);

    return () => {
      newActor.stop();
    };
  }, []);

  const handleReset = () => {
    if (actor) {
      actor.send({ type: 'RESET' });
    }
  };

  const getLightColor = (light: string) => {
    if (light === currentState) {
      switch (light) {
        case 'red':
          return '#ff0000';
        case 'yellow':
          return '#ffff00';
        case 'green':
          return '#00ff00';
      }
    }
    return '#333333';
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Inspector Proof of Concept</h1>
      <p>Simple traffic light state machine to verify inspector integration.</p>

      <div style={{ marginTop: '20px' }}>
        <p>
          <strong>Inspector Status:</strong>{' '}
          {inspectorStarted ? '✅ Started' : '❌ Not Started'}
        </p>
        <p>
          <strong>Current State:</strong> {currentState}
        </p>
        <p>
          <strong>Cycle Count:</strong> {cycleCount}
        </p>
      </div>

      <div
        style={{
          marginTop: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '100px',
          padding: '20px',
          backgroundColor: '#222',
          borderRadius: '10px',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: getLightColor('red'),
            border: '2px solid #666',
          }}
        />
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: getLightColor('yellow'),
            border: '2px solid #666',
          }}
        />
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: getLightColor('green'),
            border: '2px solid #666',
          }}
        />
      </div>

      <button
        onClick={handleReset}
        style={{
          marginTop: '40px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        Reset to Red
      </button>

      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#f0f0f0',
          borderRadius: '5px',
        }}
      >
        <h3>Instructions:</h3>
        <ol>
          <li>The inspector window should open automatically</li>
          <li>
            Watch the traffic light cycle: Red (2s) → Green (2s) → Yellow (1s) →
            Red
          </li>
          <li>The inspector should show state transitions in real-time</li>
          <li>Click "Reset to Red" to test event handling</li>
        </ol>
      </div>
    </div>
  );
}

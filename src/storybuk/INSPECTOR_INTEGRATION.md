# Stately Inspector Integration

## Overview

This document explains the Stately Inspector integration for visualizing XState state machines in real-time.

## Working Implementation

### Traffic Light POC (`/inspector-poc`)

A minimal proof-of-concept demonstrating successful inspector integration:

- Simple traffic light state machine (Red → Green → Yellow)
- No Konva dependencies, no React refs
- Clean, working real-time visualization
- Route: http://localhost:5176/inspector-poc

**Key Implementation Details:**

- Inspector created with `createBrowserInspector()` at component level
- Stored in `useRef` to prevent recreation on re-renders
- Component runs without React StrictMode to avoid double-mounting
- Actor created with `inspect` option from inspector instance

## Known Limitations

### Konva Integration Challenges

Attempting to use the inspector with Konva-based demos (like the Hen demos) encounters serialization issues:

- Konva objects contain deeply nested functions and getters/setters
- React refs to Konva nodes are non-serializable
- Custom serializers can sanitize these objects, but complete elimination of errors is complex

## Presentation Strategy

For conference presentations where you need both visual demos AND state machine visualization:

### Two-Track Recording Approach

1. **Visual Track**: Record the full demo with Konva graphics and animations
2. **State Machine Track**: Record a parallel "headless" version using only the state machine logic
3. **Post-Production**: Sync the two recordings to show graphics alongside state transitions

### Implementation Path

Create inspector-enabled versions of demos without Konva:

- Use the same state machine logic
- Replace Konva components with simple React state updates
- Visual representation can be minimal (just state names, counters, etc.)
- Inspector shows the full state machine diagram with real-time transitions

### Benefits

- Avoid serialization complexity entirely
- Get clean, reliable inspector visualization
- Maintain separation of concerns
- Can evolve both tracks independently

## Next Steps

1. Create a "headless" version of hen-back-and-forth machine
2. Build minimal React component (no Konva) to drive the state machine
3. Verify inspector tracks all transitions correctly
4. Document recording and sync workflow

## Technical Notes

### Inspector Setup Pattern

```typescript
// Create inspector instance
const { inspect } = createBrowserInspector();

// Pass to actor
const actor = createActor(machine, {
  inspect,
});

actor.start();
```

### Custom Serialization (if needed)

For complex contexts, provide a serialize function:

```typescript
const { inspect } = createBrowserInspector({
  serialize: (event) => sanitizeNonSerializableValues(event),
});
```

### StrictMode Considerations

React StrictMode causes double-mounting in development, which creates multiple actors. For inspector demos, consider disabling StrictMode or handling cleanup carefully.

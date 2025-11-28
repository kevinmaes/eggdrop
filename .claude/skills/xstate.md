# XState Best Practices

XState patterns and conventions for the Eggdrop project.

## Actor Invocation with Disposable Instances

**Create instance objects on-demand in the input function rather than storing them in context.**

Tweens and animation instances are ephemeral - they only exist for the duration of the invoked actor. Create them on-demand and let them be garbage collected when the actor completes.

### Pattern

```typescript
// 1. Context: Store only metadata (no tween instance)
context: {
  currentTweenDurationMS: number;
  currentTweenSpeed: number;
  targetPosition: Position;
}

// 2. Action: Calculate metadata and prepare node
createTweenToTargetPosition: assign(({ context }) => {
  const duration = calculateDuration(context);

  if (!isImageRef(context.nodeRef)) {
    throw new Error('Node ref is not set');
  }
  context.nodeRef.current.setPosition(context.position);

  return { currentTweenDurationMS: duration * 1000 };
}),

// 3. Invoke: Create disposable tween on-demand
Moving: {
  entry: 'createTweenToTargetPosition',
  invoke: {
    src: 'tweenActor',
    input: ({ context }) => {
      if (!isImageRef(context.nodeRef)) {
        throw new Error('Node ref is not set');
      }

      // Disposable tween - only exists for the duration of this actor
      const tween = new Konva.Tween({
        node: context.nodeRef.current,
        duration: context.currentTweenDurationMS / 1000,
        x: context.targetPosition.x,
        y: context.targetPosition.y,
        easing: Konva.Easings.EaseInOut,
      });

      return { node: context.nodeRef.current, tween };
    },
    onDone: { target: 'Done Moving' },
  },
}
```

### Why?

- Tweens are automatically garbage collected when actor completes
- No Konva objects in context (better serialization, Stately Inspector compatibility)
- No manual cleanup needed
- Prevents memory leaks

### Animation Metadata

Store these in context for sprite sync and calculations:

```typescript
context: {
  currentTweenDurationMS: number;     // Duration in MS
  currentTweenSpeed: number;          // Speed per frame for sprite sync
  currentTweenStartTime: number;      // Start timestamp
  currentTweenDirection: Direction;   // -1 or 1
  movingDirection: 'left' | 'right' | 'none';
  targetPosition: Position;
}
```

**Conventions:**
- Duration: Calculate in seconds, store in milliseconds
- Speed: Per-frame for sprite synchronization
- Position: Set node position in entry action before creating tween

### References

- [eggCaughtPoints.machine.ts](src/EggCaughtPoints/eggCaughtPoints.machine.ts)
- [hen-back-and-forth.machine.ts](src/storybuk/stories/hen-back-and-forth/hen-back-and-forth.machine.ts)
- [tweenActor.ts](src/tweenActor.ts)

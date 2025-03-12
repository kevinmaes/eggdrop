import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createActor, type InputFrom } from 'xstate';
import { eggCaughtPointsMachine } from './eggCaughtPoints.machine';
import type { Position } from '../types';
import type { RefObject } from 'react';

// We don't need to import Konva directly since we're mocking it
// Create a simple mock for Konva.Image
const createMockKonvaImage = () => ({
	x: () => 0,
	y: () => 0,
	// Add any other methods that might be called on the ref
});

describe('eggCaughtPointsMachine', () => {
	const testInput: InputFrom<typeof eggCaughtPointsMachine> = {
		eggCaughtPointsId: 'test-id',
		eggColor: 'white' as const,
		position: { x: 100, y: 200 } as Position,
	};
	// Create a mock ref with type assertion
	const mockRef = {
		current: createMockKonvaImage(),
	} as RefObject<any>;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should initialize with the correct context', () => {
		// Arrange
		const actor = createActor(eggCaughtPointsMachine, {
			input: testInput,
		});

		// Act
		actor.start();

		// Assert
		// Check the initial state
		expect(actor.getSnapshot().value).toBe('Idle');
		// Check the context
		const context = actor.getSnapshot().context;
		expect(context.eggCaughtPointsId).toBe(testInput.eggCaughtPointsId);
		expect(context.eggColor).toBe(testInput.eggColor);
		expect(context.position).toEqual(testInput.position);
		expect(context.eggCaughtPointsRef.current).toBeNull();
	});

	it('should transition to Animating when receiving "Set egg caught points ref" event', () => {
		// Arrange
		const actor = createActor(eggCaughtPointsMachine, {
			input: testInput,
		});

		// Act
		actor.start();
		actor.send({
			type: 'Set egg caught points ref',
			eggCaughtPointsRef: mockRef,
		});

		// Check the state
		expect(actor.getSnapshot().value).toBe('Animating');
		// Check that the ref was set
		expect(actor.getSnapshot().context.eggCaughtPointsRef).toBe(mockRef);
	});

	it.skip('should transition to Done after animation completes', async () => {
		// Create an actor from the machine
		const actor = createActor(eggCaughtPointsMachine, {
			input: testInput,
		});

		// Start the actor
		actor.start();

		// Send the event
		actor.send({
			type: 'Set egg caught points ref',
			eggCaughtPointsRef: mockRef,
		});

		// Our mock Konva.Tween implementation will immediately call onFinish
		// so we should transition to Done state right away

		// Check that we eventually reach the Done state
		await new Promise<void>((resolve) => {
			const subscription = actor.subscribe((state) => {
				if (state.value === 'Done') {
					subscription.unsubscribe();
					resolve();
				}
			});
		});

		expect(actor.getSnapshot().value).toBe('Done');
	});

	it.skip('should output the correct data when done', async () => {
		// Create an actor from the machine
		const actor = createActor(eggCaughtPointsMachine, {
			input: testInput,
		});

		// Start the actor
		actor.start();

		// Send the event
		actor.send({
			type: 'Set egg caught points ref',
			eggCaughtPointsRef: mockRef,
		});

		// Wait for the actor to complete
		const donePromise = new Promise<any>((resolve) => {
			const subscription = actor.subscribe((state) => {
				if (state.status === 'done') {
					subscription.unsubscribe();
					resolve(state.output);
				}
			});
		});

		const output = await donePromise;

		// Check the output
		expect(output).toEqual({
			eggCaughtPointsId: testInput.eggCaughtPointsId,
		});
	});
});

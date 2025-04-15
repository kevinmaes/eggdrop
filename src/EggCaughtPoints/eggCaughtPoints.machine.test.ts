import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createActor, waitFor, type InputFrom } from 'xstate';
import { eggCaughtPointsMachine } from './eggCaughtPoints.machine';
import type { Position } from '../types';
import type { RefObject } from 'react';

// Create a mock for Konva.Image
const createMockKonvaImage = () => ({
	x: () => 0,
	y: () => 0,
	// Add any other methods that might be called on the ref
});

describe('eggCaughtPointsMachine', () => {
	const testInput: InputFrom<typeof eggCaughtPointsMachine> = {
		eggCaughtPointsId: 'test-id',
		eggColor: 'white',
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

	it('should transition to Animating when receiving "Set eggCaughtPointsRef" event', () => {
		// Arrange
		const actor = createActor(eggCaughtPointsMachine, {
			input: testInput,
		});

		// Act
		actor.start();
		actor.send({
			type: 'Set eggCaughtPointsRef',
			eggCaughtPointsRef: mockRef,
		});

		// Check the state
		expect(actor.getSnapshot().value).toBe('Animating');
		// Check that the ref was set
		expect(actor.getSnapshot().context.eggCaughtPointsRef).toBe(mockRef);
	});

	it('should transition to Done after animation completes', async () => {
		// Arrange
		const actor = createActor(eggCaughtPointsMachine, {
			input: testInput,
		});

		// Act
		actor.start();
		actor.send({
			type: 'Set eggCaughtPointsRef',
			eggCaughtPointsRef: mockRef,
		});

		// Assert
		// Our mock Konva.Tween implementation will immediately call onFinish
		// so we should transition to Done state right away
		await waitFor(actor, (state) => state.matches('Done'));
		expect(actor.getSnapshot().value).toBe('Done');
	});

	it('should output the correct data when done', async () => {
		// Arrange
		const actor = createActor(eggCaughtPointsMachine, {
			input: testInput,
		});

		// Act
		actor.start();
		actor.send({
			type: 'Set eggCaughtPointsRef',
			eggCaughtPointsRef: mockRef,
		});
		await waitFor(actor, (state) => state.matches('Done'));

		// Assert
		expect(actor.getSnapshot().output).toEqual({
			eggCaughtPointsId: testInput.eggCaughtPointsId,
		});
	});
});

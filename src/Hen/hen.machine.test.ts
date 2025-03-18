import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createActor, waitFor } from 'xstate';
import { henMachine } from './hen.machine';
import { getGameConfig } from '../GameLevel/gameConfig';
import type { Position } from '../types';
import type { PhenotypeValuesForIndividual } from '../geneticAlgorithm/phenotype';
import type { RefObject } from 'react';
import type { Image } from 'konva/lib/shapes/Image';

// Create a simple mock for Konva.Image
const createMockKonvaImage = () => ({
	x: () => 0,
	y: () => 0,
	// Add any other methods that might be called on the ref
	setPosition: vi.fn(),
});

// Create a complete mock phenotype with all required properties
const mockPhenotype: PhenotypeValuesForIndividual = {
	speed: 100,
	baseTweenDurationSeconds: 3,
	stationaryEggLayingRate: 0.5,
	movingEggLayingRate: 0.3,
	hatchRate: 0.4,
	minXMovement: 50,
	maxXMovement: 200,
	minStopMS: 1000,
	maxStopMS: 3000,
	maxEggs: 5,
	blackEggRate: 0.1,
	goldEggRate: 0.05,
	restAfterLayingEggMS: 500,
};

describe('henMachine', () => {
	// Define test input with proper mock for henAssets
	const testInput = {
		gameConfig: getGameConfig(),
		id: 'test-hen-id',
		index: 0,
		// Mock the SpriteData structure required by the machine
		henAssets: {
			frames: {
				'hen-white': {
					frame: { x: 0, y: 0, w: 100, h: 100 },
					rotated: false,
					trimmed: false,
					spriteSourceSize: { x: 0, y: 0, w: 100, h: 100 },
					sourceSize: { w: 100, h: 100 },
				},
				'hen-brown': {
					frame: { x: 100, y: 0, w: 100, h: 100 },
					rotated: false,
					trimmed: false,
					spriteSourceSize: { x: 0, y: 0, w: 100, h: 100 },
					sourceSize: { w: 100, h: 100 },
				},
			},
			meta: {
				image: 'hen-sprite.png',
				size: { w: 200, h: 100 },
			},
		},
		position: { x: 100, y: 50 } as Position,
		phenotype: mockPhenotype,
	};

	// Create a mock ref with type assertion
	const mockRef = {
		current: createMockKonvaImage(),
	} as unknown as RefObject<Image>;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should initialize with the correct context', async () => {
		// Arrange
		// Create an actor from the machine
		const actor = createActor(henMachine, {
			input: testInput,
		});

		// Act
		// Start the actor
		actor.start();
		actor.send({
			type: 'Set henRef',
			henRef: mockRef,
		});
		const state = actor.getSnapshot();

		// Assert
		// Check the initial state
		expect(state.matches('Offscreen')).toBe(true);

		await waitFor(actor, (state) =>
			state.matches({ Moving: 'Not laying egg' })
		);

		// Check the context
		expect(state.context.id).toBe(testInput.id);
		expect(state.context.index).toBe(testInput.index);
		expect(state.context.phenotype).toEqual(testInput.phenotype);
		expect(state.context.eggsLaid).toBe(0);
		expect(state.context.gamePaused).toBe(false);
	});

	it.skip('should set henRef when receiving "Set henRef" event', () => {
		// Arrange
		// Create an actor from the machine
		const actor = createActor(henMachine, {
			input: testInput,
		});

		// Act
		// Start the actor
		actor.start();
		// Send the event
		actor.send({
			type: 'Set henRef',
			henRef: mockRef,
		});
		const { context } = actor.getSnapshot();

		// Assert
		// Check that the ref was set
		expect(context.henRef).toBe(mockRef);
	});

	it.skip('should pause the game when receiving "Pause game" event', () => {
		// Arrange
		// Create an actor from the machine
		const actor = createActor(henMachine, {
			input: testInput,
		});

		// Act
		// Start the actor
		actor.start();

		// Send the event
		actor.send({
			type: 'Pause game',
		});

		// Assert
		// Check that the game is paused
		expect(actor.getSnapshot().context.gamePaused).toBe(true);
	});

	it.skip('should resume the game when receiving "Resume game" event', () => {
		// Arrange
		// Create an actor from the machine
		const actor = createActor(henMachine, {
			input: testInput,
		});

		// Act
		// Start the actor
		actor.start();
		// First pause the game
		actor.send({
			type: 'Pause game',
		});
		// Then resume it
		actor.send({
			type: 'Resume game',
		});

		// Assert
		// Check that the game is not paused
		expect(actor.getSnapshot().context.gamePaused).toBe(false);
	});
});

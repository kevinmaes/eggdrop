import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createActor } from 'xstate';
import { henMachine } from './hen.machine';
import { getGameConfig } from '../GameLevel/gameConfig';
import type { Position } from '../types';
import type { PhenotypeValuesForIndividual } from '../geneticAlgorithm/phenotype';
import type { RefObject } from 'react';

// Create a simple mock for Konva.Image
const createMockKonvaImage = () => ({
	x: () => 0,
	y: () => 0,
	// Add any other methods that might be called on the ref
});

// Mock the gameConfig
vi.mock('../GameLevel/gameConfig', () => ({
	getGameConfig: vi.fn().mockReturnValue({
		hen: {
			width: 100,
			y: 50,
			eggLayingXMin: 100,
			eggLayingXMax: 500,
		},
		stageDimensions: {
			width: 800,
			height: 600,
			margin: 20,
		},
	}),
}));

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

describe.skip('henMachine', () => {
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
	} as RefObject<any>;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should initialize with the correct context', () => {
		// Create an actor from the machine
		const actor = createActor(henMachine, {
			input: testInput,
		});

		// Start the actor
		actor.start();

		// Check the initial state
		expect(actor.getSnapshot().value).toEqual({
			Movement: 'Idle',
		});

		// Check the context
		const context = actor.getSnapshot().context;
		expect(context.id).toBe(testInput.id);
		expect(context.index).toBe(testInput.index);
		expect(context.phenotype).toEqual(testInput.phenotype);
		expect(context.eggsLaid).toBe(0);
		expect(context.gamePaused).toBe(false);
	});

	it('should set henRef when receiving "Set henRef" event', () => {
		// Create an actor from the machine
		const actor = createActor(henMachine, {
			input: testInput,
		});

		// Start the actor
		actor.start();

		// Send the event
		actor.send({
			type: 'Set henRef',
			henRef: mockRef,
		});

		// Check that the ref was set
		expect(actor.getSnapshot().context.henRef).toBe(mockRef);
	});

	it('should pause the game when receiving "Pause game" event', () => {
		// Create an actor from the machine
		const actor = createActor(henMachine, {
			input: testInput,
		});

		// Start the actor
		actor.start();

		// Send the event
		actor.send({
			type: 'Pause game',
		});

		// Check that the game is paused
		expect(actor.getSnapshot().context.gamePaused).toBe(true);
	});

	it('should resume the game when receiving "Resume game" event', () => {
		// Create an actor from the machine
		const actor = createActor(henMachine, {
			input: testInput,
		});

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

		// Check that the game is not paused
		expect(actor.getSnapshot().context.gamePaused).toBe(false);
	});
});

import { createActorContext } from '@xstate/react';
import { fromPromise, log, setup } from 'xstate';
import { GenerationSnapshot } from './GameLevel/gameLevel.machine';
import { gameLevelMachine } from './GameLevel/gameLevel.machine';
import { nanoid } from 'nanoid';
import { getStartXPosition } from './Hen/hen.machine';
import { STAGE_DIMENSIONS } from './GameLevel/gameConfig';
import { IndividualHen } from './GameLevel/types';

const initialGenerationPopulation = new Array(10).fill(null).map(() => ({
	id: nanoid(),
	// Configuration
	initialPosition: {
		x: getStartXPosition(STAGE_DIMENSIONS.width),
		y: 10,
	},
	speed: Math.random(),
	baseAnimationDuration: 3,
	maxEggs: -1,
	stationaryEggLayingRate: 0.9,
	movingEggLayingRate: 0.1,
	// Results
	fitness: 0,
	eggsLaid: 0,
	eggsCaught: 0,
	eggsHatched: 0,
	eggsBroken: 0,
}));

const appMachine = setup({
	types: {} as {
		context: {
			generationIndex: number;
			generationSnapshotHistory: GenerationSnapshot[];
			nextGenerationPopulation: IndividualHen[];
		};
		events:
			| { type: 'Next' }
			| { type: 'Start' }
			| { type: 'Quit' }
			| { type: 'Level complete' };
	},
	actors: {
		loadAssets: fromPromise(() => {
			return Promise.resolve();
		}),
		gameLevelMachine,
	},
}).createMachine({
	context: {
		generationIndex: 0,
		generationSnapshotHistory: [],
		nextGenerationPopulation: initialGenerationPopulation,
	},
	id: 'Egg Drop Game',
	initial: 'Loading',
	states: {
		Loading: {
			invoke: {
				input: {},
				onDone: {
					target: 'Intro',
				},
				onError: {
					target: 'Show Error',
				},
				src: 'loadAssets',
			},
		},
		Intro: {
			on: {
				Start: {
					target: 'Game Play',
				},
			},
		},
		'Show Error': {},
		'Game Play': {
			initial: 'Init Level',
			on: {
				Quit: {
					target: 'Intro',
				},
			},

			states: {
				'Init Level': {
					tags: ['init level'],
					after: {
						2000: 'Playing',
					},
				},
				Playing: {
					on: {
						'Level complete': {
							actions: [log('Level complete received by App')],
						},
					},
					invoke: {
						src: 'gameLevelMachine',
						systemId: 'gameLevelMachine',
						input: ({ context }) => ({
							levelDuration: 5000,
							nextGenerationPopulation: context.nextGenerationPopulation,
						}),
					},
					description: 'The main state for game play of each level',
				},
				Evaluation: {},
				Selection: {},
				Crossover: {},
				Mutation: {},
			},
		},
	},
});

export const AppActorContext = createActorContext(appMachine);

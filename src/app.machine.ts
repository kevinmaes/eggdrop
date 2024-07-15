import { createActorContext } from '@xstate/react';
import { fromPromise, log, setup } from 'xstate';
import { GenerationSnapshot } from './GameLevel/gameLevel.machine';
import { gameLevelMachine } from './GameLevel/gameLevel.machine';

const appMachine = setup({
	types: {} as {
		context: {
			generationIndex: number;
			generationSnapshotHistory: GenerationSnapshot[];
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
						input: {
							levelDuration: 5000,
						},
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

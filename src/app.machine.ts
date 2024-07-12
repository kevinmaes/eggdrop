import { createActorContext } from '@xstate/react';
import { fromPromise, setup } from 'xstate';
import { GenerationSnapshot } from './GameLevel/gameLevel.machine';

const appMachine = setup({
	types: {} as {
		context: {
			generationIndex: number;
			generationSnapshotHistory: GenerationSnapshot[];
		};
		events:
			| { type: 'Next' }
			| { type: 'Pause' }
			| { type: 'Start' }
			| { type: 'Resume' }
			| { type: 'Quit' };
	},
	actors: {
		loadAssets: fromPromise(() => {
			return Promise.resolve();
		}),
	},
}).createMachine({
	context: {
		generationIndex: 0,
		generationSnapshotHistory: [],
	},
	id: 'Leveled Game',
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
					always: {
						target: 'Playing',
					},
				},
				Playing: {
					on: {
						Pause: {
							target: 'Paused',
						},
					},
					after: {
						'30000': {
							target: 'Level Summary',
						},
					},
					description: 'The main state for game play of each level',
				},
				'Level Summary': {
					on: {
						Next: {
							target: 'Init Level',
						},
					},
				},
				Paused: {
					on: {
						Resume: {
							target: 'Playing',
						},
					},
				},
			},
		},
	},
});

export const AppActorContext = createActorContext(appMachine);

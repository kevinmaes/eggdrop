import { setup } from 'xstate';

interface EggConfig {
	id: string;
	henId: string;
	initialX: number;
	initialY: number;
}

interface HenConfig {
	id: string;
	initialX: number;
	initialY: number;
}

export const gameLevelMachine = setup({
	types: {} as {
		context: {
			generationIndex: number;
			hens: HenConfig[];
			eggs: EggConfig[];
		};
	},
}).createMachine({
	context: {
		generationIndex: 0,
		generationSnapshotHistory: [],
		hens: [],
		eggs: [],
	},
	initial: 'Idle',
	states: {
		Idle: {},
	},
});

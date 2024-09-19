import { assign, setup, type ActorRefFrom } from 'xstate';
import { sounds, type SoundName } from './sounds';
import { timer } from './GameLevel/timer.actor';

export const soundMachine = setup({
	types: {} as {
		events:
			| { type: 'Play sound'; name: SoundName; volume: number }
			| { type: 'Timer done'; name: SoundName };
		context: {
			soundTimers: Map<string, ActorRefFrom<typeof timer>>;
		};
	},
	guards: {
		hasSoundTimer: ({ context }, params: { name: SoundName }) =>
			context.soundTimers.has(params.name),
	},
	actions: {
		spawnSoundTimer: assign({
			soundTimers: ({ context, spawn }, params: { name: SoundName }) => {
				const timerActorRef = spawn(timer, {
					input: {
						name: params.name,
						durationMS: 1000,
					},
				});
				context.soundTimers.set(params.name, timerActorRef);
				return new Map(context.soundTimers);
			},
		}),
		deleteSoundTimer: assign({
			soundTimers: ({ context }, params: { name: SoundName }) => {
				context.soundTimers.delete(params.name);
				return new Map(context.soundTimers);
			},
		}),
		playSound: (
			_,
			params: {
				name: SoundName;
				volume: number;
			}
		) => {
			sounds[params.name].play();
		},
	},
}).createMachine({
	id: 'Sound',
	context: {
		soundTimers: new Map(),
	},
	initial: 'Idle',
	states: {
		Idle: {
			on: {
				'Play sound': [
					{
						guard: {
							type: 'hasSoundTimer',
							params: ({ event }) => ({ name: event.name }),
						},
						actions: {
							type: 'spawnSoundTimer',
							params: ({ event }) => ({
								name: event.name,
							}),
						},
					},
					{
						actions: {
							type: 'playSound',
							params: ({ event }) => ({
								name: event.name,
								volume: event.volume,
							}),
						},
					},
				],
				'Timer done': [
					{
						actions: {
							type: 'deleteSoundTimer',
							params: ({ event }) => ({
								name: event.name,
							}),
						},
					},
					{
						actions: [
							// {
							// 	type: 'timer',
							// 	params: ({ event }) => ({ remainingMS: event.remainingMS }),
							// },
							// 'spawnNewHen',
						],
					},
				],
			},
		},
	},
});

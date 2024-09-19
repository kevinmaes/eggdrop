import { Howl } from 'howler';

export type SoundName = keyof typeof sounds;

export const sounds = {
	layEgg: new Howl({
		src: ['sounds/laid.wav'],
		volume: 0.4,
	}),
	catch: new Howl({
		src: ['sounds/marimba-c5.wav'],
		volume: 0.5,
	}),
	hatch: new Howl({
		src: ['sounds/egg-crack.mp3'],
		volume: 0.4,
	}),
	splat: new Howl({
		src: ['sounds/splat.wav'],
		volume: 0.01,
	}),
	haha: new Howl({
		src: ['sounds/haha.wav'],
		volume: 0.3,
	}),
	yipee: new Howl({
		src: ['sounds/yipee.wav'],
		volume: 0.2,
	}),
	yes: new Howl({
		src: ['sounds/yes.wav'],
		volume: 0.3,
	}),
	ohNo: new Howl({
		src: ['sounds/oh-no.wav'],
		volume: 0.6,
	}),
	wsup: new Howl({
		src: ['sounds/wsup.wav'],
		volume: 0.5,
	}),
	backgroundLoop: new Howl({
		src: ['sounds/i-am-dreaming-or-final-fantasy-menu-kinda-thing-29173.mp3'],
		volume: 0.5,
		loop: true,
	}),
};

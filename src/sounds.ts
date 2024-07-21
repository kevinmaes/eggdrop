import { Howl } from 'howler';

export const sounds = {
	layEgg: new Howl({
		src: ['sounds/laid.wav'],
		volume: 0.5,
	}),
	catch: new Howl({
		src: ['sounds/marimba-c5.wav'],
		volume: 0.5,
	}),
	hatch: new Howl({
		src: ['sounds/egg-crack.mp3'],
		volume: 1,
	}),
	splat: new Howl({
		src: ['sounds/splat.wav'],
		volume: 0.1,
	}),
	yipee: new Howl({
		src: ['sounds/yipee.wav'],
		volume: 0.3,
	}),
	backgroundLoop: new Howl({
		src: ['sounds/i-am-dreaming-or-final-fantasy-menu-kinda-thing-29173.mp3'],
		volume: 0.4,
		loop: true,
	}),
};

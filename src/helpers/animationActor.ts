import { Animation } from 'konva/lib/Animation';
import { fromPromise } from 'xstate';

export const animationActor = fromPromise(() => {
	let anim: Animation | null;
	return new Promise<{ timeDiff: number }>((resolve) => {
		anim = new Animation((frame) => {
			if (frame?.timeDiff) {
				resolve({ timeDiff: frame?.timeDiff });
				anim?.stop();
				anim = null;
			}
		});
		anim.start();
	});
});

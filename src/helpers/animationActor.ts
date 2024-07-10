import { Animation } from 'konva/lib/Animation';
import { fromPromise } from 'xstate';

export const animationActor = fromPromise(() => {
	return new Promise<{ timeDiff: number }>((resolve) => {
		const anim = new Animation((frame) => {
			if (frame?.timeDiff) {
				resolve({ timeDiff: frame?.timeDiff });
				anim.stop();
			}
		});
		anim.start();
	});
});

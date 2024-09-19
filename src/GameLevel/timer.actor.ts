import { fromCallback } from 'xstate';

export const timer = fromCallback<
	{ type: 'Timer done'; systemId: string },
	{ name: string; durationMS: number }
>(({ input, sendBack }) => {
	setTimeout(() => {
		sendBack({ type: 'Time done', name: input.name });
	}, input.durationMS);
});

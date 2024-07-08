import { useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { chefMachine } from './chef.machine';

export function Chef() {
	const [current, send] = useMachine(chefMachine);
	const [chefImage] = useImage('path-to-your-chef-image.png');

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				send({ type: 'MOVE_LEFT' });
			} else if (e.key === 'ArrowRight') {
				send({ type: 'MOVE_RIGHT' });
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [send]);

	return (
		<KonvaImage
			image={chefImage}
			x={current.context.position.x}
			y={current.context.position.y}
			width={50}
			height={50}
		/>
	);
}

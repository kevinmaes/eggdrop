import { useEffect, useRef } from 'react';
import { useActor } from '@xstate/react';
import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { eggMachine } from './egg.machine';
import { Animation } from 'konva/lib/Animation';

interface EggProps {
	id: number;
	initialX: number;
	initialY: number;
	chefPosition: { x: number; y: number };
	onRemove: (id: number) => void;
	onUpdatePosition: (id: number, timeDiff: number) => void;
	onCollision: (id: number, type: 'floor' | 'chef') => void;
}

export function Egg({
	id,
	initialX,
	initialY,
	chefPosition,
	onRemove,
}: EggProps) {
	const [current, send] = useActor(eggMachine, {
		input: {
			position: { x: initialX, y: initialY },
			speed: 2,
		},
	});
	const [eggImage] = useImage('path-to-your-egg-image.png');
	const layerRef = useRef();

	useEffect(() => {
		const anim = new Animation((frame) => {
			send({ type: 'FALL', timeDiff: frame?.timeDiff, chefPosition });
		}, layerRef.current);

		anim.start();

		return () => {
			anim.stop();
		};
	}, [send, chefPosition]);

	useEffect(() => {
		if (current.matches('splatted') || current.matches('caught')) {
			onRemove(id);
		}
	}, [current, id, onRemove]);

	return (
		<KonvaImage
			image={eggImage}
			x={current.context.position.x}
			y={current.context.position.y}
			width={20}
			height={20}
		/>
	);
}

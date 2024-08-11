import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
// import imageFile from '../assets/hen1.png';
import { useSelector } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { henMachine } from './hen.machine';
import { useEffect, useRef } from 'react';
import Konva from 'konva';

export function Hen({
	henActorRef,
}: {
	henActorRef: ActorRefFrom<typeof henMachine>;
}) {
	const { henFrames, henFrameNames, position, isLaying } = useSelector(
		henActorRef,
		(state) => ({
			henFrames: state.context.henAssets.sprite.frames,
			henFrameNames: Object.keys(state.context.henAssets.sprite.frames),
			position: state.context.position,
			isLaying: state.matches('Laying Egg'),
		})
	);
	const [image] = useImage('images/rectangles.png');

	const henRef = useRef<Konva.Image>(null);
	useEffect(() => {
		if (henRef.current) {
			henActorRef.send({ type: 'Set henRef', henRef });
		}
	}, [henRef.current]);

	if (!position) {
		return null;
	}

	const frameIndex = isLaying ? 1 : 0;
	const currentFrame = henFrames[henFrameNames[frameIndex]].frame;

	return (
		<KonvaImage
			ref={henRef}
			image={image}
			x={position.x}
			y={position.y}
			width={80}
			height={80}
			crop={{
				x: currentFrame.x,
				y: currentFrame.y,
				width: currentFrame.w,
				height: currentFrame.h,
			}}
		/>
	);
	// return (
	// 	<KonvaImage
	// 		ref={henRef}
	// 		image={image}
	// 		x={position.x}
	// 		y={position.y}
	// 		width={50}
	// 		height={50}
	// 	/>
	// );
}

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
	const { henFrames, position, isLaying, direction, tweenSpeed } = useSelector(
		henActorRef,
		(state) => ({
			henFrames: state.context.henAssets.sprite.frames,
			henFrameNames: Object.keys(state.context.henAssets.sprite.frames),
			position: state.context.position,
			isMoving: state.matches('Moving'),
			isLaying: state.matches('Laying Egg'),
			direction: state.context.currentTweenDirection,
			tweenSpeed: state.context.currentTweenSpeed,
		})
	);
	// console.log('direction', direction);
	const [image] = useImage('images/hen.sprite.png');

	const henRef = useRef<Konva.Image>(null);
	useEffect(() => {
		if (henRef.current) {
			henActorRef.send({ type: 'Set henRef', henRef });
		}
	}, [henRef.current]);

	if (!position) {
		return null;
	}

	let frameName = '1-hen-front.png';
	switch (true) {
		case isLaying:
			// Randomly choose laying frame
			const layingFrameNames = [
				'3-hen-back.png',
				'4-hen-jump1.png',
				'5-hen-jump2.png',
			];
			frameName =
				layingFrameNames[Math.floor(Math.random() * layingFrameNames.length)];
			break;
		case direction === -1:
			frameName = 'hen-walk-left1.png';
			// frameName = 'hen-walk-left2.png';
			break;
		case direction === 1:
			frameName = 'hen-walk-right1.png';
			// frameName = 'hen-walk-right2.png';
			break;
		default:
			frameName = '1-hen-front.png';
	}

	let currentFrame = henFrames[frameName].frame;

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
}

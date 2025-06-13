import { useEffect, useState } from 'react';
import { Image as KonvaImage, Rect } from 'react-konva';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../constants';
// import useImage from 'use-image';

export function Chef() {
	// const [chefImage] = useImage('path-to-your-chef-image.png');

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				setXDirection(-1);
			} else if (e.key === 'ArrowRight') {
				setXDirection(1);
			}
		};
		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
				setXDirection(0);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, []);

	const leftXLimit = 0;
	const rightXLimit = STAGE_WIDTH - 75;
	const speedLimit = 20;
	const accel = 0.1 * speedLimit;
	const decel = 1;

	const [xPos, setXPos] = useState(STAGE_WIDTH / 2);
	const [yPos] = useState(STAGE_HEIGHT - 120);
	const [xDirection, setXDirection] = useState(0);
	const [speed, setSpeed] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			let newSpeed = speed;

			let newXPos = xPos;

			if (xDirection === 0) {
				if (speed > 0) {
					newSpeed = Math.max(speed - decel, 0);
					if (newSpeed > speedLimit) {
						newSpeed = speedLimit;
					}
				} else if (speed < 0) {
					newSpeed = Math.min(speed + decel, 0);
					if (Math.abs(newSpeed) > speedLimit) {
						newSpeed = -speedLimit;
					}
				}
			} else {
				if (xDirection) {
					newSpeed = speed + xDirection * accel;
				}
			}

			newXPos = xPos + newSpeed;

			if (newXPos < leftXLimit) {
				newXPos = leftXLimit;
				newSpeed = 0;
			} else if (newXPos > rightXLimit) {
				newXPos = rightXLimit;
				newSpeed = 0;
			}

			setSpeed(newSpeed);
			setXPos(newXPos);
		}, 16);

		return () => clearInterval(interval);
	});

	// Render a square for now
	return <Rect x={xPos} y={yPos} width={75} height={100} fill="green" />;

	// return (
	// 	<KonvaImage
	// 		image={chefImage}
	// 		x={state.context.position.x}
	// 		y={state.context.position.y}
	// 		width={50}
	// 		height={50}
	// 	/>
	// );
}

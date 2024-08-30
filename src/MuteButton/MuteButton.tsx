import { Group, Rect, Image } from 'react-konva';
import { AppActorContext } from '../app.machine';
import useImage from 'use-image';

export function MuteButton() {
	const appActorRef = AppActorContext.useActorRef();
	const { gameConfig, controlsFrames, isMuted } = AppActorContext.useSelector(
		(state) => ({
			gameConfig: state.context.gameConfig,
			controlsFrames: state.context.gameAssets?.controls.frames ?? {},
			isMuted: state.context.isMuted,
		})
	);

	const [controlsImage] = useImage('images/controls.sprite.png');
	const controlsFrame = isMuted
		? controlsFrames['sound-off.png']?.frame
		: controlsFrames['sound-on.png'].frame;

	return (
		<Group x={10} y={gameConfig.henBeam.y + gameConfig.henBeam.height + 10}>
			{/* Border box */}
			<Rect
				stroke="white"
				x={0}
				y={0}
				width={50}
				height={50}
				strokeWidth={2}
				cornerRadius={8}
			/>
			{/* Internal background box */}
			<Rect
				x={5}
				y={5}
				width={40}
				height={40}
				cornerRadius={4}
				onClick={() => {
					appActorRef.send({ type: 'Toggle mute' });
				}}
				fill="white"
				opacity={isMuted ? 0.7 : 0.3}
			/>
			<Image
				listening={false}
				x={5}
				y={5}
				image={controlsImage}
				width={40}
				height={40}
				crop={{
					x: controlsFrame.x,
					y: controlsFrame.y,
					width: controlsFrame.w,
					height: controlsFrame.h,
				}}
			/>
		</Group>
	);
}

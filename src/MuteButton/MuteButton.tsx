import { Group, Rect } from 'react-konva';
import { AppActorContext } from '../app.machine';

export function MuteButton() {
	const appActorRef = AppActorContext.useActorRef();
	const { gameConfig, isMuted } = AppActorContext.useSelector((state) => ({
		gameConfig: state.context.gameConfig,
		isMuted: state.context.isMuted,
	}));

	return (
		<Group x={10} y={gameConfig.henBeam.y + gameConfig.henBeam.height + 10}>
			<Rect
				stroke="white"
				x={0}
				y={0}
				width={50}
				height={50}
				strokeWidth={2}
				cornerRadius={8}
			/>
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
		</Group>
	);
}

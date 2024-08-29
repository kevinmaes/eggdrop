import { Group, Layer } from 'react-konva';
import { Button } from '../Button/Button';
import { AppActorContext } from '../app.machine';
import { useSelector } from '@xstate/react';
import { GameScoreBox } from '../GameScoreBox/GameScoreBox';

export function BetweenLevels() {
	const appActorRef = AppActorContext.useActorRef();
	const { gameConfig, isBetweenLevels } = useSelector(appActorRef, (state) => ({
		gameConfig: state.context.gameConfig,
		isBetweenLevels: state.hasTag('between levels'),
	}));

	if (!isBetweenLevels) {
		return null;
	}

	const groupWidth = 300;
	const groupHeight = 250;
	const xPos = gameConfig.stageDimensions.midX - 0.5 * groupWidth;
	const yPos = gameConfig.stageDimensions.midY - 0.5 * groupHeight;

	return (
		<Layer>
			{/* Game score and other UI */}
			<Group x={xPos} y={yPos}>
				<GameScoreBox x={0} y={0} width={groupWidth} height={150} />
				{/* Play button */}
				<Button
					x={0}
					y={160}
					width={groupWidth}
					height={100}
					text="Play next level"
					onClick={() => appActorRef.send({ type: 'Play' })}
				/>
			</Group>
		</Layer>
	);
}

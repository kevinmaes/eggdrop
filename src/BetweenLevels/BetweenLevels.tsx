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

	const xPos = gameConfig.stageDimensions.midX - 150;
	const yPos = gameConfig.stageDimensions.midY - 130;
	const groupWidth = 300;

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

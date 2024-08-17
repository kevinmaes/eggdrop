import { Fragment } from 'react/jsx-runtime';

import './DevPanel.css';
import { GenerationStats, LevelResults } from '../GameLevel/types';
import { sounds } from '../sounds';

function formatGenerationStats(generationStats: GenerationStats) {
	// Return a clone of generationStats with so that each value is formatted to 2 decimal places.
	return Object.entries(generationStats).reduce((acc, [key, value]) => {
		switch (key) {
			case 'generationIndex':
			case 'totalEggsBroken':
			case 'totalEggsCaught':
			case 'totalEggsHatched':
			case 'totalEggsLaid':
				acc[key as keyof GenerationStats] = value.toString();
				break;

			case 'averageMinX':
			case 'averageMaxX':
			case 'averageMinStopMS':
			case 'averageMaxStopMS':
				acc[key as keyof GenerationStats] = value.toFixed(0).toString();
				break;
			case 'averageEggsBroken':
			case 'averageEggsHatched':
			case 'averageEggsLaid':
			case 'averageHenSpeed':
			case 'averageStationaryEggLayingRate':
			case 'averageHatchRate':
				acc[key as keyof GenerationStats] = value.toFixed(1).toString();
				break;
			case 'catchRate':
				acc[key as keyof GenerationStats] = `${(value * 100).toFixed(0)}%`;
				break;
			default:
				acc[key as keyof GenerationStats] = value.toFixed(2).toString();
		}
		return acc;
	}, {} as Record<keyof GenerationStats, string>);
}

export function DevPanel({
	levelResultsHistory,
}: {
	levelResultsHistory: LevelResults[];
}) {
	console.log('DevPanel levelResultsHistory', levelResultsHistory);
	const statNames = [
		// Averages
		'averageEggsBroken',
		'averageEggsHatched',
		'averageEggsLaid',
		'averageHenSpeed',
		'averageStationaryEggLayingRate',
		'averageHatchRate',
		'averageMinX',
		'averageMaxX',
		'averageMinStopMS',
		'averageMaxStopMS',
		// Results
		'generationIndex',
		'totalEggsBroken',
		'totalEggsCaught',
		'totalEggsHatched',
		'totalEggsLaid',
		'catchRate',
	];

	return (
		<div>
			<div>
				<button
					onClick={() => {
						sounds.yipee.play();
					}}
				>
					Test sound
				</button>
			</div>
			<div
				className="grid-container"
				style={{
					gridTemplateColumns: `250px repeat(${levelResultsHistory.length}, 1fr)`,
				}}
			>
				{/* Insert the first row for headers */}
				<div className="grid-item">Generation:</div>{' '}
				{levelResultsHistory.map((levelResults) => (
					<div
						key={`header-${levelResults.generationIndex}`}
						className="grid-item header"
					>
						{`${levelResults.generationIndex + 1}`}
					</div>
				))}
				{/* Hardcoded prop names in the first column */}
				{statNames.map((statName, rowIndex) => (
					<Fragment key={rowIndex}>
						<div className="grid-item title">{statName}</div>
						{levelResultsHistory.map((levelResults, colIndex) => (
							<div
								key={`${rowIndex}-${colIndex}`}
								className="grid-item numeric"
							>
								{
									formatGenerationStats(levelResults.levelStats)[
										statName as keyof LevelResults['levelStats']
									]
								}
							</div>
						))}
					</Fragment>
				))}
			</div>
		</div>
	);
}

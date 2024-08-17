import { Fragment } from 'react/jsx-runtime';

import './DevPanel.css';
import { LevelResults } from '../GameLevel/types';

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
		<div className="grid-container">
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
						<div key={`${rowIndex}-${colIndex}`} className="grid-item">
							{
								levelResults.levelStats[
									statName as keyof LevelResults['levelStats']
								]
							}
						</div>
					))}
				</Fragment>
			))}
		</div>
	);
}

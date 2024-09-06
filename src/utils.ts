/**
 * Get a random number between a minimum and maximum value.
 * @param min - The minimum value
 * @param max - The maximum value
 * @param round - Whether to round the number to the nearest integer (optional)
 * @returns
 */
export function getRandomNumber(
	min: number,
	max: number,
	round: boolean = false
) {
	const randomValue = Math.random() * (max - min) + min;
	return round ? Math.round(randomValue) : randomValue;
}

/**
 * Transforms a value from one range to another.
 * @param n - The value to transform
 * @param start1 - The start of the current range
 * @param stop1 - The end of the current range
 * @param start2 - The start of the new range
 * @param stop2 - The end of the new range
 * @param withinBounds - Whether to clamp the value within the new range (optional)
 * @returns The transformed value
 */
export function mapValue(
	n: number,
	start1: number,
	stop1: number,
	start2: number,
	stop2: number,
	withinBounds: boolean = false
) {
	const newValue =
		((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
	if (!withinBounds) {
		return newValue;
	}
	if (start2 < stop2) {
		return Math.max(Math.min(newValue, stop2), start2);
	} else {
		return Math.max(Math.min(newValue, start2), stop2);
	}
}

/**
 * Clamps a value between a minimum and maximum value.
 */
export function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(value, max));
}

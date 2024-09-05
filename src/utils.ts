/**
 * Transforms a value from one range to another.
 * @param n
 * @param start1
 * @param stop1
 * @param start2
 * @param stop2
 * @param withinBounds
 * @returns
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

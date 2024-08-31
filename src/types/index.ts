export interface Position {
	x: number;
	y: number;
}

export interface Direction {
	value: -1 | 0 | 1;
	label: 'left' | 'right' | 'none';
}

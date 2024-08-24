export interface Frame {
	frame: {
		x: number;
		y: number;
		w: number;
		h: number;
	};
}

export interface SpriteData {
	frames: {
		[key: string]: Frame;
	};
	meta: {
		image: string;
		size: {
			w: number;
			h: number;
		};
	};
}

export interface GameAssets {
	hen: { sprite: SpriteData };
	egg: { sprite: SpriteData };
	chick: { sprite: SpriteData };
	chef: { sprite: SpriteData };
}

export interface SpriteData {
  frames: {
    [key: string]: {
      frame: {
        x: number;
        y: number;
        w: number;
        h: number;
      };
      rotated: boolean;
      trimmed: boolean;
      spriteSourceSize: {
        x: number;
        y: number;
        w: number;
        h: number;
      };
      sourceSize: { w: number; h: number };
    };
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
  ui: SpriteData;
  hen: SpriteData;
  egg: SpriteData;
  chick: SpriteData;
  chef: SpriteData;
}

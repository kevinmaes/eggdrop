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

export const ASSET_MANIFEST = {
  sprites: {
    ui: 'images/ui.sprite.json',
    hen: 'images/hen.sprite.json',
    egg: 'images/egg.sprite.json',
    chick: 'images/chick.sprite.json',
    chef: 'images/chef.sprite.json',
  },
  fonts: {
    arco: 'Arco',
    jetBrainsMono: 'JetBrains Mono',
  },
} as const;

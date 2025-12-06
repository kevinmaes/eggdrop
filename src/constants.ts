export const LOADING_MSG = 'Loading...';

export const APP_ACTOR_ID = 'App' as const;
export const GAME_LEVEL_ACTOR_ID = 'Game Level' as const;
export const CHEF_ACTOR_ID = 'Chef' as const;

/**
 * Egg rotation values (in degrees)
 * Used for falling egg animations in both game and stories
 */
export const EGG_ROTATION = {
  CLOCKWISE_TWO_SPINS: 720, // 2 full rotations clockwise
  COUNTER_CLOCKWISE_TWO_SPINS: -720, // 2 full rotations counter-clockwise
} as const;

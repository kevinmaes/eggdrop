/* global process */
// This file contains the configuration for the game

const POPULATION_SIZE = 40;

export interface GameConfig {
  isTestMode: boolean;
  isMuted: boolean;
  populationSize: number;
  levelDurationMS: number;
  stage: {
    width: number;
    height: number;
    midX: number;
    midY: number;
    margin: number;
    movementMargin: number;
  };
  ga: {
    mutationRate: number;
    mutationVariancePercentageRate: number;
  };
  colors: {
    white: string;
    primaryYellow: string;
    primaryOrange: string;
    secondaryOrange: string;
    primaryBlue: string;
    secondaryBlue: string;
    borderBlueGray: string;
  };
  chef: {
    x: number;
    y: number;
    width: number;
    height: number;
    speedLimit: number;
    acceleration: number;
    deceleration: number;
    minXPos: number;
    maxXPos: number;
    potRim: {
      width: number;
      height: number;
      offsetX: number;
      offsetY: number;
      radiusX: number;
      radiusY: number;
    };
  };
  hen: {
    width: number;
    height: number;
    offstageLeftX: number;
    offstageRightX: number;
    y: number;
    entranceDelayMS: number;
    animationEasingEggLayingBufferMS: number;
    buttXOffset: number;
    buttYOffset: number;
    eggLayingXMin: number;
    eggLayingXMax: number;
  };
  henBeam: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  egg: {
    fallingSpeed: number;
    fallingDuration: number;
    points: {
      white: number;
      gold: number;
    };
    fallingEgg: {
      width: number;
      height: number;
    };
    brokenEgg: {
      width: number;
      height: number;
    };
    chick: {
      width: number;
      height: number;
    };
  };
  eggCaughtPoints: {
    width: number;
    height: number;
    yStartOffset: number;
  };
  countdownTimer: {
    width: number;
    height: number;
  };
  hensCountdown: {
    width: number;
    height: number;
  };
}

export const STAGE_DIMENSIONS = {
  width: 1280,
  height: 720,

  // Generally respected margin for rendering content within the stage dimensions,
  // similar to CSS padding.
  margin: 10,

  // Similar to the margin, above, but further limiting the movement of the hens
  // and chef so that they don't overlap as much with UI close to the margin.
  movementMargin: 25,
};

const createGameConfig = (isTestMode: boolean = false): GameConfig => {
  // The position and dimensions of the chef
  const chefWidth = 344;
  const chefHeight = 344;
  const chefYPosition =
    STAGE_DIMENSIONS.height - chefHeight - STAGE_DIMENSIONS.margin;

  // The duration in seconds for the egg to fall from the hen to the ground
  // Somewhere between 0.25 and 0.75 is reasonable.
  const eggFallingSpeed = 0.5;

  const henSize = 120;

  const gameConfig: GameConfig = {
    isTestMode,
    isMuted: false,
    // The number of hens in the game
    populationSize: POPULATION_SIZE,
    // The duration each level lasts in milliseconds
    levelDurationMS: POPULATION_SIZE * 1000 + 60_000,
    stage: {
      ...STAGE_DIMENSIONS,
      midX: STAGE_DIMENSIONS.width / 2,
      midY: STAGE_DIMENSIONS.height / 2,
    },
    ga: {
      mutationRate: 0.05,
      mutationVariancePercentageRate: 0.08,
    },
    colors: {
      white: '#ffffff',
      primaryYellow: '#fceb50',
      primaryOrange: '#e7af37',
      secondaryOrange: '#c69334',
      primaryBlue: '#a5c4fa',
      secondaryBlue: '#455579',
      borderBlueGray: '#98aace',
    },
    chef: {
      x: STAGE_DIMENSIONS.width / 2,
      y: chefYPosition,
      width: chefWidth,
      height: chefHeight,
      speedLimit: 15,
      // Keep the acceleration low so that tapping the arrow keys doesn't
      // make the chef move too quickly and a micro movements are possible.
      acceleration: 1,
      // Deceleration should be higher than the acceleration so the character
      // can pivot directions or stop quickly.
      deceleration: 7,
      minXPos: 0.4 * chefWidth,
      // Right margin is reduced so that the pot can still catch eggs at the edge of the screen
      maxXPos: STAGE_DIMENSIONS.width - 0.4 * chefWidth,
      potRim: {
        width: 116,
        height: 18,
        // x and y offset from the chef's position
        offsetX: 45,
        offsetY: -265,
        radiusX: 146 / 2,
        radiusY: 35 / 2,
      },
    },
    hen: {
      width: henSize,
      height: henSize,
      offstageLeftX: -henSize,
      offstageRightX: STAGE_DIMENSIONS.width + henSize,
      y: -10,
      // The delay before each hen enters the stage
      entranceDelayMS: 1000,
      // Time in milliseconds away from the start and end of an animation
      // so that the xSpeed of the falling egg can be calculated based
      // on the constant hen animation speed w/o accounting for the easing speeds on both ends.
      animationEasingEggLayingBufferMS: 250,
      // X and Y offset for the butt of the hen where the egg should come out.
      buttXOffset: 0.5 * henSize,
      buttYOffset: 85,
      eggLayingXMin: 40,
      eggLayingXMax: STAGE_DIMENSIONS.width - 40,
    },
    henBeam: {
      width: STAGE_DIMENSIONS.width,
      height: 35,
      x: 0,
      y: 98,
    },
    egg: {
      fallingSpeed: eggFallingSpeed,
      // Create a var EGG_FALLING_DURATION that is a number from 1 to 5 where 1 is the same as eggFallingSpeed equal to 0.5
      // and 5 is the same as eggFallingSpeed equal to 0.1
      fallingDuration: 5 - 4 * eggFallingSpeed,
      points: {
        white: 1,
        gold: 10,
      },
      fallingEgg: {
        width: 30,
        height: 30,
      },
      brokenEgg: {
        width: 60,
        height: 60,
      },
      chick: {
        width: 60,
        height: 60,
      },
    },
    eggCaughtPoints: {
      width: 30,
      height: 30,
      yStartOffset: -20,
    },
    countdownTimer: {
      width: 100,
      height: 50,
    },
    hensCountdown: {
      width: 90,
      height: 50,
    },
  };

  if (isTestMode) {
    gameConfig.populationSize = 10;
    gameConfig.levelDurationMS = 60_000;
  }
  return gameConfig;
};

// Create a single instance
let gameConfigInstance: GameConfig | null = null;

// Export a function that returns the singleton instance
export function getGameConfig(): GameConfig {
  let isTestMode = false;

  // Prefer env var if present (for Playwright/Node tests)
  if (typeof process !== 'undefined' && process.env['TEST_MODE']) {
    isTestMode = process.env['TEST_MODE'] === 'true';
  } else if (typeof window !== 'undefined') {
    // Fallback to query string in browser
    const urlParams = new URLSearchParams(window.location.search as string);
    isTestMode = urlParams.get('testMode') === 'true';
  }

  if (gameConfigInstance) {
    return gameConfigInstance;
  }

  return createGameConfig(isTestMode);
}

// Export a function to reset the config (useful for testing)
export function resetGameConfig() {
  gameConfigInstance = null;
}

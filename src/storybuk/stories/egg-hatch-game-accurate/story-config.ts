import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  EGG_STORY_CANVAS_WIDTH_PERCENT,
  getCenterX,
  getFallingStartY,
  ACTOR_SIZE,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { eggHatchGameAccurateMachine } from './egg-hatch-game-accurate.machine';
import { EggHatchGameAccurate } from './egg-hatch-game-accurate';
import { eggHatchGameAccurateHeadlessMachine } from './egg-hatch-game-accurate-headless.machine';
import { EggHatchGameAccurateHeadless } from './egg-hatch-game-accurate-headless';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '18',
  type: 'animated',
  title: 'Egg - Complete Lifecycle',
  description:
    'Full sequence matching real game: falls, hatches (300ms), jumps and bounces, pauses (500ms), runs off - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'hatch-game-accurate',
      componentVersion: 'hatch-game-accurate',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-visual',
      machine: eggHatchGameAccurateMachine,
      Component: EggHatchGameAccurate,
    },
    {
      type: 'egg',
      machineVersion: 'hatch-game-accurate-headless',
      componentVersion: 'hatch-game-accurate-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-headless',
      machine: eggHatchGameAccurateHeadlessMachine,
      Component: EggHatchGameAccurateHeadless,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  statelyEmbedUrl: '',
  ...canvasDimensions,
};

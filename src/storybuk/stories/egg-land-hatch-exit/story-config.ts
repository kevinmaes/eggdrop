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
import { eggLandHatchExitMachine } from './egg-land-hatch-exit.machine';
import { EggLandHatchExit } from './egg-land-hatch-exit';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '14',
  type: 'animated',
  title: 'Egg - Land, Hatch, and Exit',
  description:
    'Complete sequence: egg falls and lands, hatches to show chick, chick runs off screen - No jump animation',
  actors: [
    {
      type: 'egg',
      machineVersion: 'land-hatch-exit',
      componentVersion: 'land-hatch-exit',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-land-hatch-exit',
      machine: eggLandHatchExitMachine,
      Component: EggLandHatchExit,
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

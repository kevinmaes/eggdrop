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
import { eggLandHatchStandingMachine } from './egg-land-hatch-standing.machine';
import { EggLandHatchStanding } from './egg-land-hatch-standing';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '14',
  type: 'animated',
  title: 'Egg - Land, Hatch, and Stand',
  description:
    'Egg falls and lands, hatches to show chick in shell, then shows standing chick alone - No exit',
  actors: [
    {
      type: 'egg',
      machineVersion: 'land-hatch-standing',
      componentVersion: 'land-hatch-standing',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-land-hatch-standing',
      machine: eggLandHatchStandingMachine,
      Component: EggLandHatchStanding,
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

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
import { eggLandHatchMachine } from './egg-land-hatch.machine';
import { EggLandHatch } from './egg-land-hatch';
import { eggLandHatchHeadlessMachine } from './egg-land-hatch-headless.machine';
import { EggLandHatchHeadless } from './egg-land-hatch-headless';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '13',
  type: 'animated',
  title: 'Egg - Land and Hatch',
  description:
    'Incremental demo: egg falls and lands, shows chick in shell - Basic hatch transition without jump - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'land-hatch',
      componentVersion: 'land-hatch',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-visual',
      machine: eggLandHatchMachine,
      Component: EggLandHatch,
    },
    {
      type: 'egg',
      machineVersion: 'land-hatch-headless',
      componentVersion: 'land-hatch-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-headless',
      machine: eggLandHatchHeadlessMachine,
      Component: EggLandHatchHeadless,
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

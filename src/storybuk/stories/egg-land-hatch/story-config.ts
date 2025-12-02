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
import { EggLandHatch } from './egg-land-hatch';
import { EggLandHatchHeadless } from './egg-land-hatch-headless';
import { eggLandHatchHeadlessMachine } from './egg-land-hatch-headless.machine';
import { eggLandHatchMachine } from './egg-land-hatch.machine';

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
  statelyEmbedUrl: [
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=Design&colorMode=light&colorMode=light&colorMode=light&machineId=a5ae1753-0434-4e09-986f-c6b0fccdaaf2',
  ],
  ...canvasDimensions,
};

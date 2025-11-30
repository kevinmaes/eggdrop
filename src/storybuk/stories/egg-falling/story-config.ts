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
import { EggFalling } from './egg-falling';
import { EggFallingHeadless } from './egg-falling-headless';
import { eggFallingHeadlessMachine } from './egg-falling-headless.machine';
import { eggFallingMachine } from './egg-falling.machine';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '09',
  type: 'animated',
  title: 'Egg - Falling',
  description:
    'Egg falls straight down with gravity from top to bottom of screen - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'falling',
      componentVersion: 'falling',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-visual',
      machine: eggFallingMachine,
      Component: EggFalling,
    },
    {
      type: 'egg',
      machineVersion: 'falling-headless',
      componentVersion: 'falling-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-headless',
      machine: eggFallingHeadlessMachine,
      Component: EggFallingHeadless,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  ...canvasDimensions,
  statelyEmbedUrl:
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&machineId=0106f180-7815-457d-9f28-cf4b11e9d858',
};

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
import { eggSplatMachine } from './egg-splat.machine';
import { EggSplat } from './egg-splat';
import { eggSplatHeadlessMachine } from './egg-splat-headless.machine';
import { EggSplatHeadless } from './egg-splat-headless';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '12',
  type: 'animated',
  title: 'Egg - Splat',
  description:
    'Egg falls and splats on the ground, showing broken egg sprite - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'splat',
      componentVersion: 'splat',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-visual',
      machine: eggSplatMachine,
      Component: EggSplat,
    },
    {
      type: 'egg',
      machineVersion: 'splat-headless',
      componentVersion: 'splat-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-headless',
      machine: eggSplatHeadlessMachine,
      Component: EggSplatHeadless,
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

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
import { eggFallingRotatingMachine } from './egg-falling-rotating.machine';
import { EggFallingRotating } from './egg-falling-rotating';
import { eggFallingRotatingHeadlessMachine } from './egg-falling-rotating-headless.machine';
import { EggFallingRotatingHeadless } from './egg-falling-rotating-headless';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '10',
  type: 'animated',
  title: 'Egg - Falling + Rotating',
  description:
    'Egg falls with gravity AND rotates continuously (like in the game) - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'falling-rotating',
      componentVersion: 'falling-rotating',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-visual',
      machine: eggFallingRotatingMachine,
      Component: EggFallingRotating,
    },
    {
      type: 'egg',
      machineVersion: 'falling-rotating-headless',
      componentVersion: 'falling-rotating-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-headless',
      machine: eggFallingRotatingHeadlessMachine,
      Component: EggFallingRotatingHeadless,
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

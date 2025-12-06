import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  EGG_STORY_CANVAS_WIDTH_PERCENT,
  getCenterX,
  getCenterY,
  ACTOR_SIZE,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { EggIdle } from './egg-idle';
import { EggIdleHeadless } from './egg-idle-headless';
import { eggIdleHeadlessMachine } from './egg-idle-headless.machine';
import { eggIdleMachine } from './egg-idle.machine';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '08',
  type: 'static',
  title: 'Egg - Idle',
  description: 'Shows a stationary egg for reference',
  actors: [
    {
      type: 'egg',
      machineVersion: 'idle',
      componentVersion: 'idle',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width),
        y: getCenterY(canvasDimensions.canvasHeight, ACTOR_SIZE.egg.height),
      },
      id: 'egg-visual',
      machine: eggIdleMachine,
      Component: EggIdle,
    },
    {
      type: 'egg',
      machineVersion: 'idle-headless',
      componentVersion: 'idle-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width),
        y: getCenterY(canvasDimensions.canvasHeight, ACTOR_SIZE.egg.height),
      },
      id: 'egg-headless',
      machine: eggIdleHeadlessMachine,
      Component: EggIdleHeadless,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  ...canvasDimensions,
  statelyEmbedUrl: [
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?machineId=25546e2b-e71c-474e-8fb3-b9f5eec3dcc5',
  ],
};

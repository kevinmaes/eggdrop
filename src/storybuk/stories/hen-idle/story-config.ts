import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  HEN_STORY_CANVAS_HEIGHT_PERCENT,
  getCenterX,
  getCenterY,
  ACTOR_SIZE,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { HenIdle } from './hen-idle';
import { HenIdleHeadless } from './hen-idle-headless';
import { henIdleHeadlessMachine } from './hen-idle-headless.machine';
import { henIdleMachine } from './hen-idle.machine';

const canvasDimensions = calculateStoryCanvasDimensions(
  'vertical',
  HEN_STORY_CANVAS_HEIGHT_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '01',
  type: 'static',
  title: 'Hen - Idle',
  description:
    'Stationary hen in idle state (simplest possible demo) - Visual story + headless inspector',
  actors: [
    {
      type: 'hen',
      machineVersion: 'idle',
      componentVersion: 'idle',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.hen.width),
        y: getCenterY(canvasDimensions.canvasHeight, ACTOR_SIZE.hen.height),
      },
      id: 'hen-visual',
      machine: henIdleMachine,
      Component: HenIdle,
    },
    {
      type: 'hen',
      machineVersion: 'idle-headless',
      componentVersion: 'idle-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.hen.width),
        y: getCenterY(canvasDimensions.canvasHeight, ACTOR_SIZE.hen.height),
      },
      id: 'hen-headless',
      machine: henIdleHeadlessMachine,
      Component: HenIdleHeadless,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-top',
  statelyEmbedUrl: [
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&colorMode=light&machineId=3ab4b298-8085-4397-81f7-5b6d8f70410e',
  ],
  ...canvasDimensions,
};

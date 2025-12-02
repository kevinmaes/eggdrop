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
import { HenBackAndForth } from './hen-back-and-forth';
import { HenBackAndForthHeadless } from './hen-back-and-forth-headless';
import { henBackAndForthHeadlessMachine } from './hen-back-and-forth-headless.machine';
import { henBackAndForthMachine } from './hen-back-and-forth.machine';

const canvasDimensions = calculateStoryCanvasDimensions(
  'vertical',
  HEN_STORY_CANVAS_HEIGHT_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '02',
  type: 'animated',
  title: 'Hen - Back + Forth',
  description:
    'Visual story + headless inspector (for synchronized video recording)',
  actors: [
    {
      type: 'hen',
      machineVersion: 'back-and-forth',
      componentVersion: 'back-and-forth',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.hen.width),
        y: getCenterY(canvasDimensions.canvasHeight, ACTOR_SIZE.hen.height),
      },
      id: 'hen-visual',
      machine: henBackAndForthMachine,
      Component: HenBackAndForth,
    },
    {
      type: 'hen',
      machineVersion: 'back-and-forth-headless',
      componentVersion: 'back-and-forth-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.hen.width),
        y: getCenterY(canvasDimensions.canvasHeight, ACTOR_SIZE.hen.height),
      },
      id: 'hen-headless',
      machine: henBackAndForthHeadlessMachine,
      Component: HenBackAndForthHeadless,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-top',
  statelyEmbedUrl: [
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&colorMode=light&machineId=a99f80f4-9d06-4d23-8b38-e039171ddb07',
  ],
  ...canvasDimensions,
};

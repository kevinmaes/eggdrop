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
import { henWithPausesMachine } from './hen-with-pauses.machine';
import { HenWithPauses } from './hen-with-pauses';
import { henWithPausesHeadlessMachine } from './hen-with-pauses-headless.machine';
import { HenWithPausesHeadless } from './hen-with-pauses-headless';

const canvasDimensions = calculateStoryCanvasDimensions(
  'vertical',
  HEN_STORY_CANVAS_HEIGHT_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '03',
  type: 'animated',
  title: 'Hen - With Pauses',
  description:
    'Back and forth movement with 1-2 second pauses - Visual story + headless inspector',
  actors: [
    {
      type: 'hen',
      machineVersion: 'with-pauses',
      componentVersion: 'with-pauses',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.hen.width),
        y: getCenterY(canvasDimensions.canvasHeight, ACTOR_SIZE.hen.height),
      },
      id: 'hen-visual',
      machine: henWithPausesMachine,
      Component: HenWithPauses,
    },
    {
      type: 'hen',
      machineVersion: 'with-pauses-headless',
      componentVersion: 'with-pauses-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.hen.width),
        y: getCenterY(canvasDimensions.canvasHeight, ACTOR_SIZE.hen.height),
      },
      id: 'hen-headless',
      machine: henWithPausesHeadlessMachine,
      Component: HenWithPausesHeadless,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-top',
  statelyEmbedUrl:
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&colorMode=light&colorMode=light&machineId=df6a52e6-80b3-4b12-a1a3-1797b1f6382b',
  ...canvasDimensions,
};

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
import { HenLayingFallingEgg } from './hen-laying-falling-egg';
import { henLayingFallingEggMachine } from './hen-laying-falling-egg.machine';

// Taller canvas for this story (100px taller than default hen stories)
const canvasDimensions = calculateStoryCanvasDimensions(
  'vertical',
  HEN_STORY_CANVAS_HEIGHT_PERCENT
);

// Add 100 pixels to the canvas height
const tallerCanvasHeight = canvasDimensions.canvasHeight + 100;

// Use same Y position as other hen stories (centered in standard canvas height)
// This positions the hen near the top, leaving room for the egg to fall
const henY = getCenterY(canvasDimensions.canvasHeight, ACTOR_SIZE.hen.height);

export const storyConfig: StoryConfig = {
  id: '06',
  type: 'animated',
  title: 'Hen - Laying falling egg',
  description:
    'Hen lays a gold egg that falls and spins off screen - full animation cycle',
  actors: [
    {
      type: 'hen',
      machineVersion: 'laying-falling-egg',
      componentVersion: 'laying-falling-egg',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.hen.width),
        y: henY,
      },
      id: 'hen-laying-falling-egg',
      machine: henLayingFallingEggMachine,
      Component: HenLayingFallingEgg,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-top',
  statelyEmbedUrl: [
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&colorMode=light&colorMode=light&machineId=61c230ef-1f64-4661-8cbc-2b9ce4888762',
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=Design&machineId=65ae535b-a2e4-45c1-a0b2-63dfb17fbcb5',
  ],
  canvasWidth: canvasDimensions.canvasWidth,
  canvasHeight: tallerCanvasHeight,
  splitOrientation: canvasDimensions.splitOrientation,
};

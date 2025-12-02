import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  HEN_STORY_CANVAS_HEIGHT_PERCENT,
  ACTOR_SIZE,
  getCenterX,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { HenSpawningEgg } from './hen-spawning-egg';
import { storyMachine } from './story.machine';

// Use standard hen story canvas but add extra height for egg falling
const canvasDimensions = calculateStoryCanvasDimensions(
  'vertical',
  HEN_STORY_CANVAS_HEIGHT_PERCENT
);

// Add 150 pixels to give room for eggs to fall
const canvasHeight = canvasDimensions.canvasHeight + 150;
const canvasWidth = canvasDimensions.canvasWidth;

// Position hen near the top
const henY = 20;

export const storyConfig: StoryConfig = {
  id: '07',
  type: 'animated',
  title: 'Hen - Moving + Laying',
  description:
    'Demonstrates the actor model: Hen sends "Lay an egg" to parent orchestrator via sendParent(), orchestrator spawns egg actors dynamically using spawn(). Shows true parent-child actor communication.',
  actors: [
    {
      type: 'hen',
      machineVersion: 'spawning-egg',
      componentVersion: 'spawning-egg',
      startPosition: {
        x: getCenterX(canvasWidth, ACTOR_SIZE.hen.width),
        y: henY,
      },
      id: 'hen-egg-orchestrator',
      machine: storyMachine,
      Component: HenSpawningEgg,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-top',
  statelyEmbedUrl: [
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?code=9d19c8fd-366c-449f-b13a-ba18a1ef0f8d&mode=design&machineId=ca19308f-b586-4651-8bc9-3d0bd0a4ac7c',
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&machineId=65ae535b-a2e4-45c1-a0b2-63dfb17fbcb5',
  ],
  canvasWidth,
  canvasHeight,
  splitOrientation: canvasDimensions.splitOrientation,
};

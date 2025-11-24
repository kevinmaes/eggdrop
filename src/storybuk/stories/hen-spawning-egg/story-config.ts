import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  HEN_STORY_CANVAS_HEIGHT_PERCENT,
  ACTOR_SIZE,
  getCenterX,
} from '../../story-config-constants';

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
  id: 'Hen Spawning Egg',
  type: 'animated',
  title: 'Hen - Spawning Egg (Multi-Actor)',
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
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-top',
  statelyEmbedUrl: '',
  canvasWidth,
  canvasHeight,
  splitOrientation: canvasDimensions.splitOrientation,
};

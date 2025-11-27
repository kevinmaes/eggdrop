import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  EGG_STORY_CANVAS_WIDTH_PERCENT,
  getCenterX,
  ACTOR_SIZE,
  getGroundY,
} from '../../story-config-constants';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: 'Egg Hatch Jump Only',
  storyId: '16',
  type: 'animated',
  title: 'Chick - Hatching + Jump Animation',
  description:
    'Demonstrates inserting jump: egg lands, hatches, JUMPS, then exits - Shows how jump animation fits between hatch and exit - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'hatch-jump-only',
      componentVersion: 'hatch-jump-only',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getGroundY(canvasDimensions.canvasHeight) - ACTOR_SIZE.egg.height,
      },
      id: 'egg-visual',
    },
    {
      type: 'egg',
      machineVersion: 'hatch-jump-only-headless',
      componentVersion: 'hatch-jump-only-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getGroundY(canvasDimensions.canvasHeight) - ACTOR_SIZE.egg.height,
      },
      id: 'egg-headless',
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

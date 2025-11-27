import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  EGG_STORY_CANVAS_WIDTH_PERCENT,
  getCenterX,
  getFallingStartY,
  ACTOR_SIZE,
} from '../../story-config-constants';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: 'Egg Fall Land Only',
  storyId: '11',
  type: 'animated',
  title: 'Egg - Falling and Landing',
  description:
    'Incremental demo: egg falls with rotation and lands - Shows physics and landing detection - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'fall-land-only',
      componentVersion: 'fall-land-only',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-visual',
    },
    {
      type: 'egg',
      machineVersion: 'fall-land-only-headless',
      componentVersion: 'fall-land-only-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
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

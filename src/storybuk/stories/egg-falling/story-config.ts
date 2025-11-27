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
  id: 'Egg Falling',
  storyId: '09',
  type: 'animated',
  title: 'Egg - Falling',
  description:
    'Egg falls straight down with gravity from top to bottom of screen - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'falling',
      componentVersion: 'falling',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width),
        y:
          getFallingStartY(canvasDimensions.canvasHeight) -
          ACTOR_SIZE.egg.height / 2,
      },
      id: 'egg-visual',
    },
    {
      type: 'egg',
      machineVersion: 'falling-headless',
      componentVersion: 'falling-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width),
        y:
          getFallingStartY(canvasDimensions.canvasHeight) -
          ACTOR_SIZE.egg.height / 2,
      },
      id: 'egg-headless',
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  ...canvasDimensions,
  statelyEmbedUrl:
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?machineId=67ee088f-7005-4919-a155-673965bfef40&mode=design',
};

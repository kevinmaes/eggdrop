import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  HEN_STORY_CANVAS_HEIGHT_PERCENT,
  getCenterX,
  getCenterY,
  ACTOR_SIZE,
} from '../../story-config-constants';

const canvasDimensions = calculateStoryCanvasDimensions(
  'vertical',
  HEN_STORY_CANVAS_HEIGHT_PERCENT
);

export const storyConfig: StoryConfig = {
  id: 'Hen Laying With Egg',
  type: 'animated',
  title: 'Hen - Laying with static egg',
  description:
    'Hen lays an egg - egg appears at correct position (static, no falling yet)',
  actors: [
    {
      type: 'hen',
      machineVersion: 'laying-with-egg',
      componentVersion: 'laying-with-egg',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.hen.width),
        y: getCenterY(canvasDimensions.canvasHeight, ACTOR_SIZE.hen.height),
      },
      id: 'hen-laying-with-egg',
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-top',
  statelyEmbedUrl:
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&machineId=9e25a04f-4e68-4060-a287-61a5d4355c10',
  ...canvasDimensions,
};

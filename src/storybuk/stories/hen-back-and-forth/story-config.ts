import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  type ActorConfig,
  HEN_STORY_CANVAS_HEIGHT_PERCENT,
} from '../../story-config-constants';

export const storyConfig: Omit<StoryConfig, 'actors'> & {
  actors: Omit<ActorConfig, 'startPosition'>[];
} = {
  id: 'Hen Back And Forth',
  type: 'animated',
  title: 'Hen - Back and Forth',
  description:
    'Visual story + headless inspector (for synchronized video recording)',
  actors: [
    {
      type: 'hen',
      machineVersion: 'back-and-forth',
      componentVersion: 'back-and-forth',
      id: 'hen-visual',
    },
    {
      type: 'hen',
      machineVersion: 'back-and-forth-headless',
      componentVersion: 'back-and-forth-headless',
      id: 'hen-headless',
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-top',
  statelyEmbedUrl:
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&colorMode=light&machineId=a99f80f4-9d06-4d23-8b38-e039171ddb07',
  ...calculateStoryCanvasDimensions(
    'vertical',
    HEN_STORY_CANVAS_HEIGHT_PERCENT
  ),
};

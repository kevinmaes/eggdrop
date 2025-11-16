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
  id: 'Hen Idle',
  type: 'static',
  title: 'Hen - Idle',
  description:
    'Stationary hen in idle state (simplest possible demo) - Visual story + headless inspector',
  actors: [
    {
      type: 'hen',
      machineVersion: 'idle',
      componentVersion: 'idle',
      id: 'hen-visual',
    },
    {
      type: 'hen',
      machineVersion: 'idle-headless',
      componentVersion: 'idle-headless',
      id: 'hen-headless',
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-top',
  statelyEmbedUrl:
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&machineId=9e25a04f-4e68-4060-a287-61a5d4355c10',
  ...calculateStoryCanvasDimensions(
    'vertical',
    HEN_STORY_CANVAS_HEIGHT_PERCENT
  ),
};

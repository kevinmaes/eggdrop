import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  CHEF_STORY_CANVAS_HEIGHT_PERCENT,
} from '../../story-config-constants';

export const storyConfig: StoryConfig = {
  id: 'Chef Facing Direction',
  type: 'animated',
  title: 'Chef - Face Forward',
  description:
    'Chef moves back and forth and faces the correct direction - Visual demo',
  actors: [
    {
      type: 'chef',
      machineVersion: 'facing-direction',
      componentVersion: 'facing-direction',
      startPosition: { x: 960, y: 36 },
      id: 'chef-visual',
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-bottom',
  statelyEmbedUrl: '',
  ...calculateStoryCanvasDimensions(
    'vertical',
    CHEF_STORY_CANVAS_HEIGHT_PERCENT
  ),
};

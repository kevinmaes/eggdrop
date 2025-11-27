import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  getCenterX,
} from '../../story-config-constants';

/**
 * Hen-Chef-Catch Story Configuration
 *
 * A coordinated multi-actor story demonstrating:
 * - Stationary hen laying eggs (alternating white/gold)
 * - Eggs falling with rotation
 * - Chef catching eggs with collision detection
 * - Full actor orchestration pattern
 */

// Use narrow horizontal split for side-stage layout
// Wider than egg stories (15%) to accommodate chef (344px) + eggs + margin
const canvasDimensions = calculateStoryCanvasDimensions('horizontal', 30);

// Hen position (top center)
const henX = getCenterX(canvasDimensions.canvasWidth, 120);
const henY = 100;

export const storyConfig: StoryConfig = {
  id: 'Chef - Catch Egg',
  storyId: '22',
  type: 'animated',
  title: 'Chef - Catch Egg',
  description:
    'Demonstrates collision detection: Stationary hen continuously lays eggs (alternating white/gold), eggs fall with rotation, chef catches them. Full actor orchestration without points animation.',
  actors: [
    {
      type: 'hen', // ActorFactory uses type for dynamic imports
      machineVersion: 'chef-catch',
      componentVersion: 'chef-catch',
      startPosition: { x: henX, y: henY },
      id: 'hen-chef-catch-orchestrator',
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  ...canvasDimensions,
  statelyEmbedUrl: '', // TODO: Add after publishing to Stately
};

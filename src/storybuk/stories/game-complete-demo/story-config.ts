import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  getCenterX,
} from '../../story-config-constants';

import { GameCompleteDemo } from './game-complete-demo';
import { storyMachine } from './story.machine';

/**
 * Game Complete Demo Story Configuration
 *
 * A comprehensive game-like story demonstrating:
 * - Autonomous chef moving back and forth
 * - Moving hen laying eggs rapidly while moving (white/gold/black rotation)
 * - Collision detection during movement
 * - Points spawning for caught eggs
 * - Full egg lifecycle for missed eggs (land, hatch/splat, run off)
 * - Probabilistic hatching (white 50%, gold 100%, black 0%)
 */

// Use narrow horizontal split for side-stage layout
const canvasDimensions = calculateStoryCanvasDimensions('horizontal', 30);

// Hen position (top center)
const henX = getCenterX(canvasDimensions.canvasWidth, 120);
const henY = 100;

export const storyConfig: StoryConfig = {
  id: '26',
  type: 'animated',
  title: 'Game - Complete Demo',
  description:
    'Full game experience: Autonomous chef + moving hen, rapid egg drops (white/gold/black), probabilistic hatching (50%/100%/0%), complete egg lifecycle. Demonstrates full game loop.',
  actors: [
    {
      type: 'hen',
      machineVersion: 'game-complete-demo',
      componentVersion: 'game-complete-demo',
      startPosition: { x: henX, y: henY },
      id: 'game-complete-demo-orchestrator',
      machine: storyMachine,
      Component: GameCompleteDemo,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  ...canvasDimensions,
  statelyEmbedUrl: [],
};

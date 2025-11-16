import type { LayoutMode } from './story-constants';
import type { SplitOrientation } from './storybuk-theme';
import type { ActorRefFrom } from 'xstate';

/**
 * Position on the canvas
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Configuration for a story background
 */
export interface BackgroundConfig {
  type: 'none' | 'solid' | 'image' | 'game';
  color: string;
  image?: string;
}

/**
 * Configuration for a single actor in a story
 */
export interface ActorConfig {
  type: 'hen' | 'chef' | 'egg' | 'egg-caught-points';
  machineVersion: string;
  componentVersion: string;
  startPosition: Position;
  id?: string;
  eggColor?: string; // For egg-caught-points
}

/**
 * Story type determines playback behavior
 * - static: No animation, shows graphic and state chart only (no play/reset buttons)
 * - animated: Has animation that can be played/reset
 */
export type StoryType = 'static' | 'animated';

/**
 * Configuration for a complete story
 */
export interface StoryConfig {
  id: string;
  type: StoryType;
  actors: ActorConfig[];
  background: BackgroundConfig;
  title: string;
  description: string;
  layoutMode: LayoutMode;
  splitOrientation: SplitOrientation;
  canvasWidth: number;
  canvasHeight: number;
  statelyEmbedUrl: string;
}

/**
 * Runtime instance of a story actor
 */
export interface StoryActorInstance {
  actor: ActorRefFrom<any>;
  Component: React.ComponentType<any>;
  config: ActorConfig;
}

/**
 * Collection of all story configurations
 */
export type StoryConfigs = Record<string, StoryConfig>;

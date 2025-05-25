import type { ChefData, EggData } from '../../src/test-api';
import type { Direction } from '../../src/types';

export interface EnhancedEggData extends EggData {
  timeToCatch: number;
  maxTravel: number;
  isReachable: boolean;
  score: number;
}

/**
 * Calculate the time needed to catch an egg
 */
export function calculateTimeToCatch(egg: EggData, chef: ChefData): number {
  const catchY = chef.position.y + chef.potRimOffsetY;
  return (catchY - egg.position.y) / egg.speedY;
}

/**
 * Calculate the maximum distance the chef can travel in the given time
 */
export function calculateMaxTravel(
  timeToCatch: number,
  chef: ChefData
): number {
  return chef.speedLimit * timeToCatch;
}

/**
 * Determine if an egg is reachable by the chef
 */
export function isEggReachable(
  egg: EggData,
  chef: ChefData,
  timeToCatch: number,
  maxTravel: number
): boolean {
  return (
    timeToCatch > 0 && Math.abs(egg.position.x - chef.position.x) <= maxTravel
  );
}

/**
 * Calculate the base score for an egg based on its color
 */
export function calculateBaseScore(color: EggData['color']): number {
  switch (color) {
    case 'gold':
      return 5;
    case 'white':
      return 1;
    case 'black':
      return -10;
    default:
      return 0;
  }
}

/**
 * Calculate a normalized position score based on distance to chef
 */
export function calculatePositionScore(egg: EggData, chef: ChefData): number {
  const distanceToChef = Math.abs(egg.position.x - chef.position.x);
  return 1 / (1 + distanceToChef / 100); // Normalize between 0 and 1
}

/**
 * Calculate a normalized time score based on time to catch
 */
export function calculateTimeScore(timeToCatch: number): number {
  return 1 / (1 + timeToCatch); // Normalize between 0 and 1
}

/**
 * Calculate a movement score based on whether the hen was moving
 */
export function calculateMovementScore(henIsMoving: boolean): number {
  return henIsMoving ? 0.5 : 0;
}

/**
 * Calculate the final score for an egg
 */
export function calculateEggScore(
  egg: EggData,
  chef: ChefData,
  timeToCatch: number
): number {
  const baseScore = calculateBaseScore(egg.color);
  const positionScore = calculatePositionScore(egg, chef);
  const timeScore = calculateTimeScore(timeToCatch);
  const movementScore = calculateMovementScore(egg.henIsMoving);

  return baseScore * (positionScore + timeScore + movementScore);
}

/**
 * Enhance an egg with additional properties and scoring
 */
export function enhanceEgg(egg: EggData, chef: ChefData): EnhancedEggData {
  const timeToCatch = calculateTimeToCatch(egg, chef);
  const maxTravel = calculateMaxTravel(timeToCatch, chef);
  const isReachable = isEggReachable(egg, chef, timeToCatch, maxTravel);
  const score = calculateEggScore(egg, chef, timeToCatch);

  return {
    ...egg,
    timeToCatch,
    maxTravel,
    isReachable,
    score,
  };
}

/**
 * Find the best egg to catch from a list of eggs
 */
export function findBestEgg(
  eggs: EggData[],
  chef: ChefData
): EnhancedEggData | null {
  // Enhance all eggs with additional properties and scoring
  const enhancedEggs = eggs.map(egg => enhanceEgg(egg, chef));

  // Filter out unreachable eggs and black eggs
  const validEggs = enhancedEggs.filter(
    egg => egg.isReachable && egg.color !== 'black'
  );

  if (validEggs.length === 0) {
    return null;
  }

  // Sort eggs by score in descending order
  validEggs.sort((a, b) => b.score - a.score);

  // Return the highest scoring egg
  return validEggs[0];
}

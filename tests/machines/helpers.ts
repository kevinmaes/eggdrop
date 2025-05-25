import type { ChefData, EggData } from '../../src/test-api';
import type { Direction } from '../../src/types';
import type { GameConfig } from '../../src/GameLevel/gameConfig';

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
 * Calculate penalties for an egg based on various factors
 */
export function calculatePenalties(
  egg: EggData,
  chef: ChefData,
  timeToCatch: number
): number {
  let totalPenalty = 0;

  // Penalty for eggs that require the chef to change direction
  if (chef.movingDirection !== 'none') {
    const eggIsToTheRight = egg.position.x > chef.position.x;
    const chefIsMovingRight = chef.movingDirection === 'right';
    if (eggIsToTheRight !== chefIsMovingRight) {
      totalPenalty += 0.5; // Penalty for direction change
    }
  }

  // Penalty for eggs that are very close to the catch line
  const distanceToCatchLine = Math.abs(
    chef.position.y + chef.potRimOffsetY - egg.position.y
  );
  if (distanceToCatchLine < 50) {
    totalPenalty += 0.3; // Penalty for eggs that are too close to catch line
  }

  // Penalty for eggs that are moving very fast horizontally
  if (Math.abs(egg.henCurentTweenSpeed) > 5) {
    totalPenalty += 0.4; // Penalty for fast-moving eggs
  }

  return totalPenalty;
}

/**
 * Calculate bonuses for an egg based on various factors
 */
export function calculateBonuses(
  egg: EggData,
  chef: ChefData,
  timeToCatch: number
): number {
  let totalBonus = 0;

  // Bonus for eggs that are already in the chef's path
  if (chef.movingDirection !== 'none') {
    const eggIsToTheRight = egg.position.x > chef.position.x;
    const chefIsMovingRight = chef.movingDirection === 'right';
    if (eggIsToTheRight === chefIsMovingRight) {
      totalBonus += 0.3; // Bonus for eggs in current path
    }
  }

  // Bonus for eggs that are at a good height (not too high, not too low)
  const optimalHeight = 200; // Arbitrary "good" height
  const heightDifference = Math.abs(egg.position.y - optimalHeight);
  if (heightDifference < 100) {
    totalBonus += 0.2; // Bonus for eggs at good height
  }

  // Bonus for eggs that are moving slowly horizontally
  if (Math.abs(egg.henCurentTweenSpeed) < 2) {
    totalBonus += 0.2; // Bonus for slow-moving eggs
  }

  return totalBonus;
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
  const penalties = calculatePenalties(egg, chef, timeToCatch);
  const bonuses = calculateBonuses(egg, chef, timeToCatch);

  // Apply penalties and bonuses to the base score
  const adjustedBaseScore = baseScore * (1 - penalties + bonuses);

  return adjustedBaseScore * (positionScore + timeScore + movementScore);
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
 * Calculate the danger score based on proximity to black eggs, considering the chef's pot rim width
 */
export function calculateBlackEggDanger(
  egg: EggData,
  sortedEggs: EggData[],
  chef: ChefData,
  safeDistance: number = 100
): number {
  let dangerScore = 0;
  const eggIndex = sortedEggs.findIndex(e => e.id === egg.id);

  // Calculate the effective danger zone based on pot rim width
  const potRimHalfWidth = chef.potRimWidth / 2;
  const effectiveSafeDistance = Math.max(safeDistance, potRimHalfWidth);

  // Check neighboring eggs in both directions
  for (
    let i = Math.max(0, eggIndex - 2);
    i <= Math.min(sortedEggs.length - 1, eggIndex + 2);
    i++
  ) {
    const neighborEgg = sortedEggs[i];
    if (neighborEgg.id === egg.id) continue;

    if (neighborEgg.color === 'black') {
      const xDistance = Math.abs(egg.position.x - neighborEgg.position.x);
      const yDistance = Math.abs(egg.position.y - neighborEgg.position.y);

      // If black egg is within effective safe distance both horizontally and vertically
      if (xDistance < effectiveSafeDistance && yDistance < safeDistance) {
        // Calculate danger based on both x and y distances
        const xDanger = 1 - xDistance / effectiveSafeDistance;
        const yDanger = 1 - yDistance / safeDistance;

        // Higher danger when black egg is closer to the pot rim center
        const rimProximityDanger = xDistance < potRimHalfWidth ? 1.5 : 1;

        // Combine dangers with higher weight for x-axis (rim width) danger
        const proximityScore = (xDanger * 1.5 + yDanger) * rimProximityDanger;
        dangerScore += proximityScore;
      }
    }
  }

  return Math.min(dangerScore, 1); // Cap the danger score at 1
}

/**
 * Calculate a cluster bonus for eggs that are near other valuable eggs
 */
export function calculateClusterBonus(
  egg: EggData,
  sortedEggs: EggData[],
  clusterDistance: number = 150
): number {
  let clusterScore = 0;
  const eggIndex = sortedEggs.findIndex(e => e.id === egg.id);

  // Check neighboring eggs in both directions
  for (
    let i = Math.max(0, eggIndex - 2);
    i <= Math.min(sortedEggs.length - 1, eggIndex + 2);
    i++
  ) {
    const neighborEgg = sortedEggs[i];
    if (neighborEgg.id === egg.id) continue;

    if (neighborEgg.color !== 'black') {
      const xDistance = Math.abs(egg.position.x - neighborEgg.position.x);
      const yDistance = Math.abs(egg.position.y - neighborEgg.position.y);

      // If valuable egg is within cluster distance
      if (xDistance < clusterDistance && yDistance < clusterDistance) {
        // Higher bonus for closer valuable eggs
        const proximityBonus = 0.3 * (1 - xDistance / clusterDistance);
        clusterScore += proximityBonus;
      }
    }
  }

  return clusterScore;
}

/**
 * Find the best egg to catch from a list of eggs
 */
export function findBestEgg(
  eggs: EggData[],
  chef: ChefData,
  gameConfig: GameConfig
): EnhancedEggData | null {
  // Pre-sort eggs by x position for efficient neighbor checking
  const sortedEggs = [...eggs].sort((a, b) => a.position.x - b.position.x);

  // Enhance all eggs with additional properties and scoring
  const enhancedEggs = sortedEggs.map(egg => {
    const enhancedEgg = enhanceEgg(egg, chef);

    // Add black egg danger score and cluster bonus
    const blackEggDanger = calculateBlackEggDanger(egg, sortedEggs, chef);
    const clusterBonus = calculateClusterBonus(egg, sortedEggs);

    // Adjust the score based on black egg danger and cluster bonus
    enhancedEgg.score = enhancedEgg.score * (1 - blackEggDanger) + clusterBonus;

    return enhancedEgg;
  });

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

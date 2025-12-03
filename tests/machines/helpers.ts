import type { ChefData, EggData } from '../../src/test-api';
import type { Direction } from '../../src/types';
import type { GameConfig } from '../../src/gameConfig';

/**
 * EggData pulls context values from the egg actor.
 * EnhancedEggData adds additional properties used to determine the score
 * when choosing the next best egg to catch.
 */
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
 * Calculate the maximum distance the chef can travel in the given time,
 * considering acceleration, current speed, direction changes, and deceleration
 */
export function calculateMaxTravel(
  timeToCatch: number,
  chef: ChefData,
  egg: EggData
): number {
  const currentSpeed = chef.speed;
  const isMovingTowardsTarget =
    (chef.movingDirection === 'right' && egg.position.x > chef.position.x) ||
    (chef.movingDirection === 'left' && egg.position.x < chef.position.x);

  const needsDirectionChange =
    chef.movingDirection !== 'none' &&
    !isMovingTowardsTarget &&
    currentSpeed > 0;

  let availableTime = timeToCatch;
  let distanceCovered = 0;

  // If chef needs to change direction, account for deceleration time
  if (needsDirectionChange) {
    const decelerationTime = currentSpeed / chef.deceleration;

    // If not enough time to even stop, egg is unreachable
    if (decelerationTime >= timeToCatch) {
      return 0;
    }

    // Distance covered while decelerating (in wrong direction, so subtract)
    const decelerationDistance = 0.5 * currentSpeed * decelerationTime;
    distanceCovered -= decelerationDistance; // Negative because moving away
    availableTime -= decelerationTime;
  }

  // Now calculate distance in the correct direction
  const timeToReachSpeedLimit = chef.speedLimit / chef.acceleration;

  if (availableTime >= timeToReachSpeedLimit) {
    // Enough time to reach full speed
    const accelerationDistance =
      0.5 * chef.acceleration * timeToReachSpeedLimit * timeToReachSpeedLimit;
    const fullSpeedTime = availableTime - timeToReachSpeedLimit;
    const fullSpeedDistance = chef.speedLimit * fullSpeedTime;
    distanceCovered += accelerationDistance + fullSpeedDistance;
  } else {
    // Only have time to accelerate partway
    distanceCovered += 0.5 * chef.acceleration * availableTime * availableTime;
  }

  // Return absolute value since we track direction separately
  return Math.abs(distanceCovered);
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
  // First check if the egg hasn't fallen past the catch line
  if (timeToCatch <= 0) return false;

  const distanceToTarget = Math.abs(egg.position.x - chef.position.x);

  // Add a buffer to account for timing variations and pot rim width
  const safetyBuffer = chef.potRimWidth * 0.75; // Use pot rim width as buffer
  return distanceToTarget <= maxTravel + safetyBuffer;
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
  const maxTravel = calculateMaxTravel(timeToCatch, chef, egg);
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
  const eggIndex = sortedEggs.findIndex((e) => e.id === egg.id);

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
 * Calculate a cluster bonus for eggs that are near other valuable eggs.
 * A cluster is a group of eggs that can be caught in sequence, with the first-to-fall
 * egg being the most important to target. The bonus considers both spatial proximity
 * and temporal sequence of the eggs.
 *
 * The function uses a dynamic approach where:
 * 1. Eggs close in y-position (falling at similar times) need to be closer in x-position
 * 2. Eggs far apart in y-position can be further apart in x-position
 * 3. Eggs falling in sequence get additional bonus
 *
 * This creates a natural "chain" of catching eggs, where catching the first egg
 * in a cluster makes the remaining eggs more attractive targets in subsequent passes.
 */
export function calculateClusterBonus(
  egg: EggData,
  sortedEggs: EggData[],
  chef: ChefData,
  clusterDistance: number = 150
): number {
  let clusterScore = 0;
  const eggIndex = sortedEggs.findIndex((e) => e.id === egg.id);

  // Calculate time-to-catch for the current egg
  // This is crucial for determining if eggs will fall in sequence
  const eggTimeToCatch = calculateTimeToCatch(egg, chef);

  // Check neighboring eggs in both directions
  // We look at 2 eggs in each direction (5 eggs total including current)
  // This is a balance between finding clusters and computational efficiency
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
      const neighborTimeToCatch = calculateTimeToCatch(neighborEgg, chef);

      // Calculate dynamic x-distance threshold based on y-distance
      // If eggs are close in y (falling at similar times), they need to be closer in x
      // This is because the chef has less time to move between catches
      const yDistanceFactor = Math.max(0.5, 1 - yDistance / clusterDistance);
      const dynamicXThreshold = clusterDistance * yDistanceFactor;

      // If valuable egg is within dynamic x-distance and y-distance thresholds
      if (xDistance < dynamicXThreshold && yDistance < clusterDistance) {
        // Base proximity bonus based on x-distance
        // Closer eggs get higher bonus, scaled by the dynamic threshold
        const proximityBonus = 0.3 * (1 - xDistance / dynamicXThreshold);

        // Time sequence bonus - higher for eggs that will fall in sequence
        // This encourages targeting the first-to-fall egg in a cluster
        const timeDiff = Math.abs(eggTimeToCatch - neighborTimeToCatch);
        const timeSequenceBonus = 0.2 * (1 - timeDiff / 2); // Max 0.2 bonus for eggs falling within 2 seconds of each other

        // Combine both bonuses
        // The total bonus for each neighboring egg can be up to 0.5 (0.3 proximity + 0.2 sequence)
        clusterScore += proximityBonus + timeSequenceBonus;
      }
    }
  }

  return clusterScore;
}

/**
 * Check if there are any black eggs in the path between the chef and target egg
 * Returns a danger score between 0 and 1, where 1 means the path is completely unsafe
 */
export function calculatePathDanger(
  targetEgg: EggData,
  sortedEggs: EggData[],
  chef: ChefData,
  safeDistance: number = 50 // Half the pot rim width as default safe distance
): number {
  let maxDanger = 0;
  const chefX = chef.position.x;
  const targetX = targetEgg.position.x;
  const isMovingRight = targetX > chefX;

  // Check all eggs that could be in the path
  for (const egg of sortedEggs) {
    if (egg.id === targetEgg.id || egg.color !== 'black') continue;

    const eggX = egg.position.x;
    const eggY = egg.position.y;
    const targetY = targetEgg.position.y;

    // Only consider black eggs that are:
    // 1. Between the chef and target horizontally
    // 2. At a similar height to the target (within safe distance)
    if (
      (isMovingRight && eggX > chefX && eggX < targetX) ||
      (!isMovingRight && eggX < chefX && eggX > targetX)
    ) {
      const yDistance = Math.abs(eggY - targetY);
      if (yDistance < safeDistance) {
        // Calculate how close the black egg is to the center of the path
        const pathLength = Math.abs(targetX - chefX);
        const distanceFromPath = Math.abs(
          eggX - (isMovingRight ? chefX : targetX)
        );
        const normalizedDistance = distanceFromPath / pathLength;

        // Higher danger for black eggs closer to the path center
        const danger = 1 - normalizedDistance;
        maxDanger = Math.max(maxDanger, danger);
      }
    }
  }

  return maxDanger;
}

/**
 * Find the best egg to catch from a list of eggs
 */
export function findBestEgg(
  eggs: EggData[],
  chef: ChefData
): EnhancedEggData | null {
  // Pre-sort eggs by x position for efficient neighbor checking
  const sortedEggs = [...eggs].sort((a, b) => a.position.x - b.position.x);

  // Enhance all eggs with additional properties and scoring
  const enhancedEggs = sortedEggs.map((egg) => {
    const enhancedEgg = enhanceEgg(egg, chef);

    // Add black egg danger score and cluster bonus
    const blackEggDanger = calculateBlackEggDanger(egg, sortedEggs, chef);
    const clusterBonus = calculateClusterBonus(egg, sortedEggs, chef);

    // Add path danger check
    const pathDanger = calculatePathDanger(egg, sortedEggs, chef);

    // Adjust the score based on black egg danger, cluster bonus, and path danger
    // Path danger is weighted more heavily as it's a direct safety concern
    enhancedEgg.score =
      enhancedEgg.score * (1 - blackEggDanger) * (1 - pathDanger * 1.5) +
      clusterBonus;

    return enhancedEgg;
  });

  // Filter out unreachable eggs and black eggs
  const validEggs = enhancedEggs.filter(
    (egg) => egg.isReachable && egg.color !== 'black'
  );

  if (validEggs.length === 0) {
    return null;
  }

  // Sort eggs by score in descending order
  validEggs.sort((a, b) => b.score - a.score);

  // Return the highest scoring egg
  return validEggs[0];
}

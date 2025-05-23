/**
 * Helper functions for Playwright tests
 */

/**
 * Creates a new logger instance with its own timing state
 * @returns A logger object with a logStep function
 */
export function createLogger() {
  let lastLogTime = Date.now();

  /**
   * Logs a step with timing information since the last log
   * @param step The message to log
   */
  function logStep(step: string): void {
    const now = Date.now();
    const elapsed = now - lastLogTime;
    console.log(`[${elapsed}ms] ${step}`);
    lastLogTime = now;
  }

  return { logStep };
}

// Create a default logger instance for convenience
const defaultLogger = createLogger();

/**
 * Logs a step with timing information since the last log
 * Uses a default logger instance
 * @param step The message to log
 */
export function logStep(step: string): void {
  defaultLogger.logStep(step);
}

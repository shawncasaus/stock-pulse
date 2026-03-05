/**
 * Rate Limiter for Polygon API
 * 
 * Implements a sliding window rate limiter to respect Polygon's API limits.
 * Free tier: 5 calls per minute
 * 
 * Usage:
 *   const result = await rateLimiter.executeRequest(async () => {
 *     return await fetch('...');
 *   });
 */

const MAX_REQUESTS = 5;
const WINDOW_MS = 60000; // 1 minute in milliseconds
const BUFFER_MS = 100; // Small buffer to be conservative

/**
 * RateLimiter class using sliding window algorithm
 */
class RateLimiter {
  private requestTimestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = MAX_REQUESTS, windowMs: number = WINDOW_MS) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Executes a request function while respecting rate limits
   * Automatically queues requests that exceed the limit
   */
  async executeRequest<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitIfNeeded();
    
    // Record this request timestamp
    this.requestTimestamps.push(Date.now());
    
    // Execute the request
    return await fn();
  }

  /**
   * Waits if we've hit the rate limit
   */
  private async waitIfNeeded(): Promise<void> {
    while (true) {
      this.cleanupOldTimestamps();

      if (this.requestTimestamps.length < this.maxRequests) {
        return;
      }

      const oldestRequest = this.requestTimestamps[0];
      const now = Date.now();
      const timeSinceOldest = now - oldestRequest;
      const waitTime = this.windowMs - timeSinceOldest + BUFFER_MS;

      if (waitTime > 0) {
        console.log(`[RateLimiter] Rate limit reached. Waiting ${waitTime}ms before next request.`);
        await this.sleep(waitTime);
        // Loop will continue and check again after waiting
      }
    }
  }

  /**
   * Removes timestamps older than the sliding window
   */
  private cleanupOldTimestamps(): void {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < this.windowMs
    );
  }

  /**
   * Helper to sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gets the current number of requests in the window
   * Useful for debugging/monitoring
   */
  getCurrentRequestCount(): number {
    this.cleanupOldTimestamps();
    return this.requestTimestamps.length;
  }

  /**
   * Gets the time until the next request slot is available
   * Returns 0 if a slot is currently available
   */
  getTimeUntilNextSlot(): number {
    this.cleanupOldTimestamps();
    
    if (this.requestTimestamps.length < this.maxRequests) {
      return 0;
    }

    const oldestRequest = this.requestTimestamps[0];
    const now = Date.now();
    const timeSinceOldest = now - oldestRequest;
    const waitTime = this.windowMs - timeSinceOldest + BUFFER_MS;

    return Math.max(0, waitTime);
  }

  /**
   * Resets the rate limiter (useful for testing)
   */
  reset(): void {
    this.requestTimestamps = [];
  }
}

/**
 * Singleton instance for Polygon API rate limiting
 * Export this for use throughout the application
 */
export const rateLimiter = new RateLimiter(MAX_REQUESTS, WINDOW_MS);

/**
 * Export the class for testing purposes
 */
export { RateLimiter };

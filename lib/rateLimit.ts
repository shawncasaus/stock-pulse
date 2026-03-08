/**
 * Rate Limiter for Polygon API
 * Implements sliding window algorithm to respect 5 calls/minute limit.
 */

const MAX_REQUESTS = 5;
const WINDOW_MS = 60000;
const BUFFER_MS = 100;
class RateLimiter {
  private requestTimestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = MAX_REQUESTS, windowMs: number = WINDOW_MS) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /** Executes a request function while respecting rate limits */
  async executeRequest<T>(fn: () => Promise<T>): Promise<T> {
    const waitTime = await this.waitIfNeeded();
    this.requestTimestamps.push(Date.now());
    return await fn();
  }

  /** Waits if rate limit has been reached and returns total wait time */
  private async waitIfNeeded(): Promise<number> {
    let totalWaitTime = 0;
    
    while (true) {
      this.cleanupOldTimestamps();

      if (this.requestTimestamps.length < this.maxRequests) {
        return totalWaitTime;
      }

      const oldestRequest = this.requestTimestamps[0];
      const now = Date.now();
      const timeSinceOldest = now - oldestRequest;
      const waitTime = this.windowMs - timeSinceOldest + BUFFER_MS;

      if (waitTime > 0) {
        console.log(`[RateLimiter] Rate limit reached. Waiting ${waitTime}ms before next request.`);
        totalWaitTime += waitTime;
        await this.sleep(waitTime);
      }
    }
  }

  /** Removes timestamps older than the sliding window */
  private cleanupOldTimestamps(): void {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < this.windowMs
    );
  }

  /** Helper to sleep for specified milliseconds */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Gets the current number of requests in the window */
  getCurrentRequestCount(): number {
    this.cleanupOldTimestamps();
    return this.requestTimestamps.length;
  }

  /** Gets the time until the next request slot is available (0 if available now) */
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

  /** Resets the rate limiter */
  reset(): void {
    this.requestTimestamps = [];
  }
}

/** Singleton instance for Polygon API rate limiting */
export const rateLimiter = new RateLimiter(MAX_REQUESTS, WINDOW_MS);

export { RateLimiter };

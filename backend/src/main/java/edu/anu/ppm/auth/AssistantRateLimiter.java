package edu.anu.ppm.auth;

import java.time.Clock;

import org.springframework.stereotype.Component;

/** Small process-wide guard for the public demo endpoint; provider errors use the offline browser guide. */
@Component
class AssistantRateLimiter {
    private static final long WINDOW_MILLIS = 60_000;
    private static final int MAX_REQUESTS_PER_WINDOW = 60;

    private final Clock clock = Clock.systemUTC();
    private long windowStartedAt = clock.millis();
    private int requestsInWindow;

    synchronized boolean tryAcquire() {
        long now = clock.millis();
        if (now - windowStartedAt >= WINDOW_MILLIS) {
            windowStartedAt = now;
            requestsInWindow = 0;
        }
        if (requestsInWindow >= MAX_REQUESTS_PER_WINDOW) return false;
        requestsInWindow += 1;
        return true;
    }
}

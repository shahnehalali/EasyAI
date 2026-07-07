// CommonJS port of @rit-services/feedback-server rate limiter.
function createRateLimiter(opts) {
  const buckets = new Map();

  return (req, res, next) => {
    const key = opts.keyFn(req);
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
      return next();
    }

    if (bucket.count >= opts.max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({
        error: 'rate_limited',
        message: `Too many feedback submissions. Retry in ${retryAfter}s.`,
      });
      return;
    }

    bucket.count += 1;
    next();
  };
}

module.exports = { createRateLimiter };

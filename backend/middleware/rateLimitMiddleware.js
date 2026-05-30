const loginAttempts = new Map(); // ip -> { count, lastAttempt }

export const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes window
  const maxAttempts = 5; // limit each IP to 5 login attempts per windowMs

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return next();
  }

  const attempt = loginAttempts.get(ip);

  // If the window has expired, reset count and timestamp
  if (now - attempt.lastAttempt > windowMs) {
    attempt.count = 1;
    attempt.lastAttempt = now;
    return next();
  }

  attempt.count += 1;
  attempt.lastAttempt = now;

  if (attempt.count > maxAttempts) {
    const remainingTime = Math.ceil((windowMs - (now - attempt.lastAttempt)) / 1000 / 60);
    return res.status(429).json({
      message: `Too many login attempts from this IP. Please try again after ${remainingTime} minutes.`
    });
  }

  next();
};

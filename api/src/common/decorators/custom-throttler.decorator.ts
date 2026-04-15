import { Throttle } from '@nestjs/throttler';

// strict throttle for auth/payments
export const StrictThrottler = () => {
  return Throttle({
    default: {
      ttl: 1000,
      limit: 3,
    },
  });
};

// Moderate throttle for orders
export const ModerateThrottler = () => {
  return Throttle({
    default: {
      ttl: 1000,
      limit: 5,
    },
  });
};

// relaxed throttle for read operations
export const RelaxedThrottler = () => {
  return Throttle({
    default: {
      ttl: 1000,
      limit: 20,
    },
  });
};

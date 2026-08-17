// Sliding window via Redis sorted set — single Lua round-trip.
//
// [1] Returns [newCount, oldestScore] — no secondary call needed
// [2] Uses redis.call('TIME') — server-side clock, immune to app-server drift
// [3] Inserts `weight` members — heavy requests consume multiple slots
//
// Compatibility: Redis >= 2.6 (no 6.2-only ZRANGE flags used)
//
// ioredis call convention:
//   redis.eval(script, 1, KEYS[1], ARGV[1], ARGV[2], ARGV[3], ARGV[4])
//
//   KEYS[1]  → composite rate-limit key
//   ARGV[1]  → interval  (seconds)
//   ARGV[2]  → limit     (max slots)
//   ARGV[3]  → requestId (unique prefix for inserted members)
//   ARGV[4]  → weight    (slots consumed by this request)
//
// Returns: Redis array → [newCount, oldestScore]
//   newCount    → total slots used after this request
//   oldestScore → unix timestamp (float) of the oldest member in the window,
//                 used upstream to compute RateLimit-Reset

export const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local interval = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local weight = tonumber(ARGV[4])
local requestId = ARGV[5]

-- Remove old entries
redis.call('ZREMRANGEBYSCORE', key, 0, now - interval)

-- Count current requests
local count = redis.call('ZCARD', key)

-- Always insert current request(s)
for i = 1, weight do
  redis.call('ZADD', key, now + (i * 0.000001), requestId .. ':' .. i)
end

redis.call('EXPIRE', key, interval)

-- Get updated count
local newCount = redis.call('ZCARD', key)

-- Oldest timestamp
local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')

return { newCount, oldest[2] }
`;

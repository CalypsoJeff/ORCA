import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  // optional retry strategy
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
});

redis.on("connect", () => {
  console.log("Connected to Redis successfully!");
});

redis.on("ready", () => {
  console.log("Redis is ready to accept commands!");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("end", () => {
  console.log("Redis connection closed.");
});

redis.on("reconnecting", () => {
  console.log("Reconnecting to Redis...");
});

export default redis;

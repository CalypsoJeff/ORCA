
import Redis from "ioredis";

// Create Redis client instance
const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
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

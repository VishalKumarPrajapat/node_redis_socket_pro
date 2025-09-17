import Redis from "ioredis";

const redis = new Redis({
  host: "redis-18852.c1.asia-northeast1-1.gce.redns.redis-cloud.com" ,
  port: 18852,
  password: "DR66RPPkit2ChuyLGF4d18iuWtQKCR2R",
});

redis.on("connect", () => {
  console.log("--- Redis Server connected");
});

redis.on("error", (err) => {
  console.error("Redis error: ", err);
});

export default redis;

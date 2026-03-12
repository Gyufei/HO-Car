import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// 优先加载开发环境本地配置（与 Next 的约定保持一致）
dotenv.config({ path: ".env.development.local" });
// 兜底加载 .env 等默认文件
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});


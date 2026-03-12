### 后端与部署说明（Home Calc）

#### 1. 概览

- **后端形态**：使用 Next.js App Router 内置的 Route Handlers（`app/api`），不单独新建后端项目。
- **数据库**：Postgres（推荐使用 Vercel Postgres/Neon），通过 `DATABASE_URL` 环境变量配置。
- **ORM**：Prisma（`prisma/schema.prisma`）。
- **鉴权**：Auth.js / NextAuth v5 Credentials Provider，单账号登录。

#### 2. 数据模型

- 文件：`prisma/schema.prisma`
- 核心模型：`Bill`（账单）
  - 字段：
    - `id`：主键 `String @id @default(cuid())`
    - `userId`：用户 ID（当前通过环境变量固定单用户）
    - `type`：`ELE | WATER`
    - `year`：年份
    - `month`：月份
    - `amount`：当月总费用
    - `usage`：当月总用量（电度/水量）
    - `unitPrice?`：单价（预留）
    - `createdAt` / `updatedAt`：时间戳

数据库表名为 `bills`，并对 `user_id + year + month + type` 建有索引。

#### 3. 主要 API 设计

- 列表与创建：`app/api/bills/route.ts`
  - `GET /api/bills?type=ELE|WATER&year=YYYY&month=MM`
    - 按用户、类型与年月筛选账单。
  - `POST /api/bills`
    - Body：
      - `type: "ELE" | "WATER"`
      - `year: number`
      - `month: number`
      - `amount: number`
      - `usage: number`
      - `unitPrice?: number`
- 明细更新与删除：`app/api/bills/[id]/route.ts`
  - `PATCH /api/bills/:id`
  - `DELETE /api/bills/:id`

所有接口返回统一结构：

```json
{ "success": true, "data": ... }
{ "success": false, "error": { "code": "...", "message": "..." } }
```

#### 4. 鉴权与路由保护

- 配置文件：`auth.config.ts`
- 实例化：`auth.ts`（导出 `auth`, `signIn`, `signOut`, `handlers`）
- API 路由：`app/api/auth/[...nextauth]/route.ts`
- 登录页：`app/login/page.tsx`
- 中间件：`middleware.ts`
  - 保护路径：`/ele/*`, `/water/*`, `/api/bills/*`

登录方式：Credentials Provider

- 登录表单字段：`username`、`password`
- 校验逻辑：
  - 用户名等于 `ADMIN_USERNAME`
  - 密码使用 `bcrypt` 对比 `ADMIN_PASSWORD_HASH`

Root Layout 中通过 `app/providers.tsx` 使用 `SessionProvider` 包裹全局 React 树，支持客户端获取会话。

#### 5. 前端与数据流

- 电费页面：`app/ele/page.tsx`
  - 保留原有计算逻辑。
  - 新增：
    - 年份、月份输入。
    - “保存本月电费记录”按钮：调用 `POST /api/bills`（`type: "ELE"`）。
    - “历史电费记录”列表：`GET /api/bills?type=ELE`，支持删除。
- 水费页面：`app/water/page.tsx`
  - 同电费页：
    - “保存本次水费记录”：`type: "WATER"`。
    - “历史水费记录”列表。

#### 6. 环境变量与本地开发

本地 `.env` 示例（不要提交到 Git）：

```bash
DATABASE_URL="postgresql://user:password@host:5432/home_calc"
AUTH_SECRET="请使用 openssl rand -base64 32 生成"
ADMIN_USERNAME="your-admin"
ADMIN_PASSWORD_HASH="bcrypt-哈希后的密码"
SINGLE_USER_ID="home-calc-single-user"
```

初始化数据库：

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

启动开发：

```bash
pnpm dev
```

#### 7. 在 Vercel 上部署

1. 将仓库推送到 GitHub/GitLab，并在 Vercel 上 Import 项目。
2. 在 Vercel Dashboard 中添加环境变量（Production + Preview）：
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD_HASH`
   - `SINGLE_USER_ID`（建议与本地保持一致）
3. 为项目创建 Vercel Postgres 数据库，并将连接字符串复制到 `DATABASE_URL`。
4. 第一次部署成功后，在生产环境运行 Prisma 迁移：
   - 可在本地连接生产库执行 `pnpm prisma:migrate`，或在 CI / Vercel 的 Build 完成后专门执行一次迁移命令。
5. 访问生产环境：
   - 打开 `/login`，使用配置的账号密码登录。
   - 登录后访问 `/ele`、`/water`，测试计算与保存/历史功能。

#### 8. 维护与扩展

- 修改管理员密码：
  - 使用命令行重新生成 bcrypt 哈希，更新 `ADMIN_PASSWORD_HASH` 环境变量并重新部署。
- 多用户扩展：
  - 在 Prisma 中增加 `User` 模型，将 `Bill.userId` 改为外键。
  - 在 Auth.js 的 Credentials Provider 中从数据库查找用户并校验密码。
- 图表与统计：
  - 可以新增 `/api/stats` 路由，对 `bills` 做分组聚合，为前端图表提供数据。


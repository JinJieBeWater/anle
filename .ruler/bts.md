# anle 项目上下文说明

## 项目概览

- 本项目由 Better-T-Stack CLI 创建，是 Turborepo + pnpm 工作区的 TypeScript 全栈工程。
- 系统组成：React + Hono API + oRPC 类型安全接口 + Drizzle + PostgreSQL。
- 前端集成 PowerSync + TanStack React DB，实现本地 SQLite、离线优先与多端适配的同步能力。
- 包含 Mastra AI/Workflow 示例能力。

## 本项目是做什么的

- 目标是打造一个通用的、类似 Notion 的模板化创作应用。
- 用户可以创建模板（例如 小说 / 日记 / 笔记 / 博客 等），并在模板下进行内容创作与组织。
- 初期优先围绕“小说”场景构建功能，但底层保持模板化架构，以支持后续扩展到更多内容类型。

## 技术栈与关键能力

- 前端：React 19、TanStack Router（文件路由）、Vite、TailwindCSS、shadcn/ui（Base UI 版本）、SQLite。
- 后端：Hono、oRPC、Drizzle ORM。
- 数据库：PostgreSQL、RLS（Row-Level Security）。
- 同步：PowerSync。
- 工具链：Oxlint/Oxfmt、Lefthook、Turborepo、PWA。

## UI 规范

- 实现 UI 必须严格遵循 shadcn/ui 的设计系统（本项目为 Base UI 版本），组件风格与交互保持一致。

## Monorepo 结构

- `apps/web/`：Web 前端应用。
- `apps/server/`：后端服务（Hono + oRPC + Mastra）。
- `packages/api/`：oRPC 合约与服务层。
- `packages/auth/`：认证相关配置（如需接入再补充）。
- `packages/db/`：Drizzle schema 与数据库配置。
- `packages/env/`：环境变量校验（server/web）。
- `packages/config/`：共享 TS 配置。
- `packages/infra/`：Docker 基础设施脚本与 PowerSync 配置。
- `packages/mastra/`：Mastra workflows/agents/tools。

## 运行与脚本

- 根目录（跨工作区）：
  - `pnpm run dev`：启动全部应用。
  - `pnpm run dev:web`：仅启动 web。
  - `pnpm run dev:server`：仅启动 server。
  - `pnpm run build`：构建全部应用。
  - `pnpm run check`：Oxlint + Oxfmt。
  - `pnpm run check-types`：全局类型检查。
- 数据库（从根目录触发，实际在 `@anle/db`）：
  - `pnpm run db:push` / `db:generate` / `db:studio` / `db:migrate`。
- 基础设施：
  - `pnpm run infra:start|watch|stop|down`。

## 项目配置

- `bts.jsonc`：Better-T-Stack 配置与选项记录（可删除）。

## 数据库与 RLS

- Schema 位置：`packages/db/src/schema/`。
- 关键表（节选）：
  - 认证表：`user`, `session`, `account`, `verification`, `jwks`。
  - 业务表：
    - `object_template`：模板定义与元数据 schema。
    - `object`：模板实例（含 `type`, `name`, `metadata`）。
    - `object_relation`：对象关系（member/parent/next/prev/reference）。
    - `object_update`：CRDT/增量更新（`update_data` bytea）。
    - `todo`：示例表。
- RLS：
  - 多数表启用 `enableRLS()`，用 `app.user_id` 控制访问。
  - `packages/api/src/rls.ts` 提供 `withRls()`，事务内 `set_config('app.user_id', ...)`。

## API 层（oRPC）

- 入口：`packages/api/src/routers/index.ts`。
- 主要 Router：`object`, `objectTemplate`, `objectUpdate`, `todo`。
- 上下文：`packages/api/src/context.ts`（从 auth session 构建）。
- 典型链路：Web → oRPC client → Hono server → withRls 事务 → Drizzle。

## Web 端（TanStack Router + PowerSync）

- 路由目录：`apps/web/src/routes/`。
- PowerSync 本地 SQLite：
  - 表结构定义：`apps/web/src/lib/powersync/schema/`。
  - PG 与 SQLite 类型/结构差异需要反序列化（Deserialization）。
  - 支持离线优先与多端适配的同步体验。
- 同步与集合：
  - DB 实例：`apps/web/src/lib/powersync/db.ts`。
  - 连接器：`apps/web/src/lib/powersync/connector.ts`。
  - 集合：`apps/web/src/lib/collections.ts`。
  - 反序列化：集合配置 `deserializationSchema`，将 SQLite 数据映射为前端期望类型。
- 上传处理（Handlers）：
  - 位置：`apps/web/src/lib/powersync/handler/*`。
  - 上传时对 `connector.ts` 传入的 CRUD 数据进行解析/反序列化（通常通过 schema.parse）。

## 实际数据突变流程

- 用户在前端触发操作（例如新增/编辑/删除）。
- PowerSync SQLite 写入发生变化。
- `connector.ts` 监测到本地变更并触发上传。
- 对应的 Handler 解析/反序列化变更数据。
- Handler 使用 oRPC client 将变更提交到后端。

## PowerSync Service 同步规则

- 规则文件：`packages/infra/config/sync_rules.yaml`。
- 当 PostgreSQL 表结构或同步字段变化时，需要同步更新该规则文件。

## 环境变量

- Server：`packages/env/src/server.ts`
  - `DATABASE_URL`, `CORS_ORIGIN`, `NODE_ENV`。
- Web：`packages/env/src/web.ts`
  - `VITE_SERVER_URL`, `VITE_POWERSYNC_URL`。

## AI / Workflow（Mastra）

- 入口：`packages/mastra/src/index.ts`。
- 包含：
  - `weather-agent`（调用 weather tool）。
  - `weather-workflow`（拉取天气 → 生成活动建议）。
- Server 通过 `/ai` 暴露 Mastra（带 auth middleware）。

## 关键页面路由（Web）

- `/`：首页。
- `/login`：登录。
- `/dashboard`：主界面（如有）。
- `/tanstack-db-todos`：TanStack DB + PowerSync 示例。
- `/crdt/$documentId`：CRDT/富文本协作示例。
- `/t/$templateName`：基于模板的对象列表页。

## 维护提示

- 当对项目做了变更时，应实时更新 .ruler\bts.md 的说明。
- 更新完成后运行 pnpm run ruler:apply 以应用到相关 AI 上下文文件。

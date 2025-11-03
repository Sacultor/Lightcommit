### 贡献指南

### 分支与提交

- 分支命名: `feat/`、`fix/`、`docs/`、`chore/`
- 提交信息: 中文，简洁准确，包含动宾结构

### 代码规范

- TypeScript 严格类型，避免 `any`
- 命名小写，驼峰或下划线
- 代码简洁高效，不加入冗余兼容代码
- 不写代码注释

### 前端开发

- 使用 `Web3Context`、`useContract` 统一获取链上依赖
- 新增 API 放置于 `src/app/api`，类型在 `src/types`

### 数据与迁移

- 新增字段或表时同时更新 `migrations` 与 `docs/database.md`
- 保持向前兼容或提供数据迁移脚本

### 文档

- 所有项目文档位于 `docs` 目录
- 更新或新增模块时同步补充相关文档

### 提交流程

- `pnpm install:all`
- `pnpm lint` 并修复问题
- 本地验证 `pnpm dev` 与合约交互页面


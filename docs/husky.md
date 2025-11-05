# Husky 使用说明

## 功能

- 在 Git 提交前自动执行检查
- 与 lint-staged 配合只检查改动文件

## 已完成配置

- 根目录安装 husky、lint-staged
- `.husky/pre-commit` 执行 `pnpm exec lint-staged`
- 根 `package.json` 配置 `lint-staged` 仅检查 `frontend/src/**/*.{ts,tsx,js,jsx}`

## 使用

- 正常提交即可触发
```bash
git add -A
git commit -m "feat: message"
```

- 手动运行 lint-staged（可选）
```bash
pnpm exec lint-staged
```

## 调整规则

- 修改根 `package.json` 中 `lint-staged` 条目
- 修改 `frontend/eslint.config.mjs` 以变更 ESLint 规则

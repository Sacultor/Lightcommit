# ESLint 使用指南

## 项目配置

项目已经在 `frontend/eslint.config.mjs` 中配置好了 ESLint，包含以下配置：

- Next.js 官方 ESLint 配置
- TypeScript 支持
- 自定义代码风格规则

## 基本使用

### 1. 检查所有文件

```bash
cd frontend
npm run lint
```

### 2. 检查特定文件或目录

```bash
cd frontend
npx eslint src/
npx eslint src/app/page.tsx
npx eslint "src/**/*.{ts,tsx}"
```

### 3. 自动修复可修复的问题

```bash
cd frontend
npx eslint --fix src/
npm run lint -- --fix
```

### 4. 检查特定文件类型

```bash
npx eslint "src/**/*.tsx"
npx eslint "src/**/*.ts"
```

## 当前配置的规则

### 代码风格规则

- **单引号**：使用单引号而非双引号
- **分号**：语句末尾必须加分号
- **逗号**：多行对象/数组最后一项后必须加逗号
- **缩进**：使用 2 个空格缩进
- **尾随空格**：不允许行尾空格
- **文件末尾**：文件必须以空行结尾

### TypeScript 规则

- **未使用的变量**：未使用的变量会报错（但以 `_` 开头的参数除外）
- **any 类型**：使用 `any` 会警告（不会报错）
- **函数返回类型**：不强制要求显式声明

## 在编辑器中集成

### VS Code

1. 安装 ESLint 扩展
2. 在设置中添加：

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### Cursor

Cursor 默认已集成 ESLint，会自动显示错误和警告。

## 常见问题

### 忽略特定文件

已配置忽略以下目录：
- `node_modules/`
- `.next/`
- `out/`
- `build/`
- `next-env.d.ts`

如需添加更多忽略规则，修改 `eslint.config.mjs` 中的 `ignores` 数组。

### 忽略特定行的规则

```typescript
// eslint-disable-next-line rule-name
const foo = bar();

// eslint-disable-next-line
const foo = bar();
```

### 忽略整个文件

在文件顶部添加：

```typescript
/* eslint-disable */
```

## 在 Git 提交前自动检查

可以配合 husky 和 lint-staged 在提交前自动运行 ESLint：

```bash
cd frontend
npm install -D husky lint-staged
npx husky init
```

在 `package.json` 中添加：

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

在 `.husky/pre-commit` 中添加：

```bash
npx lint-staged
```

## 查看具体错误信息

```bash
npx eslint --debug src/app/page.tsx
npx eslint --format verbose src/
```

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `npm run lint` | 检查所有文件 |
| `npx eslint --fix .` | 自动修复所有文件 |
| `npx eslint src/app/` | 检查特定目录 |
| `npx eslint --ext .ts,.tsx src/` | 指定文件扩展名 |
| `npx eslint --cache .` | 使用缓存加快检查速度 |

## 修改配置

如需修改 ESLint 规则，编辑 `frontend/eslint.config.mjs`：

```javascript
{
  rules: {
    'rule-name': 'off',
    'rule-name': 'warn',
    'rule-name': 'error',
  },
}
```


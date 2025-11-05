# Storybook 安装和使用指南

## 概述

本文档介绍如何在 LightCommit 项目中安装和使用 Storybook。Storybook 是一个用于独立开发和测试 UI 组件的工具，可以帮助我们更好地管理和展示组件库。

## 技术栈

- Next.js 15.5.4
- React 19.1.0
- TypeScript
- Tailwind CSS 4.x
- Radix UI 组件

## 安装步骤

### ⚠️ 重要提示

本项目使用 **pnpm workspace**，必须在 frontend 子目录中单独安装 Storybook，避免触发其他子项目（如 hardhat）的构建错误。

### 1. 自动初始化 Storybook（推荐）

**步骤 1：进入 frontend 目录**

```bash
cd /Users/frederick/Documents/Lightcommit/frontend
```

**步骤 2：运行 Storybook 初始化**

```bash
npx storybook@latest init
```

安装过程中会：
- 自动检测项目使用的框架（Next.js）
- 安装必要的依赖到 frontend/package.json
- 创建 `.storybook` 配置目录
- 创建示例 stories
- 添加运行脚本到 package.json

**步骤 3：等待安装完成**

安装过程大约需要 1-3 分钟，完成后会看到：
```
✔ Storybook 安装成功！
To run your Storybook, type:
  npm run storybook
```

### 2. 手动安装（如果需要精确控制）

如果自动安装有问题，可以手动安装：

```bash
cd frontend

npm install --save-dev @storybook/react @storybook/react-webpack5 @storybook/addon-essentials @storybook/addon-interactions @storybook/test @storybook/nextjs storybook
```

## 配置

### 1. Storybook 主配置

创建 `frontend/.storybook/main.ts`：

```typescript
import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';

const config: StorybookConfig = {
  // 指定 stories 文件的位置
  // 支持 MDX 文档和各种 JS/TS 格式的 stories 文件
  stories: [
    '../src/**/*.mdx',  // Markdown 格式的组件文档
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',  // 所有 stories 文件
  ],
  
  // Storybook 插件配置
  addons: [
    '@storybook/addon-essentials',  // 核心功能集合（控制面板、操作、视口等）
    '@storybook/addon-interactions',  // 交互测试插件
    '@storybook/addon-links',  // 在 stories 之间创建链接
  ],
  
  // 框架配置：使用 Next.js 适配器
  // 这确保 Storybook 可以正确处理 Next.js 特性（图片、字体优化等）
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  
  // 文档配置：自动为带有 'autodocs' 标签的组件生成文档
  docs: {
    autodocs: 'tag',
  },
  
  // 静态资源目录，Storybook 可以直接访问这些文件
  // 例如：在 stories 中可以使用 '/assets/logo.png' 引用 public/assets/logo.png
  staticDirs: ['../public'],
  
  // Webpack 最终配置：自定义 webpack 配置
  webpackFinal: async (config) => {
    if (config.resolve) {
      // 配置路径别名，使 '@/...' 指向 src 目录
      // 这样在 stories 中可以使用 '@/components/Button' 而不是 '../../../components/Button'
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../src'),
      };
    }
    return config;
  },
};

export default config;
```

#### 配置项详解

**stories 配置**
- `../src/**/*.mdx`：加载所有 MDX 文档，用于编写组件的详细说明文档
- `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`：加载所有 stories 文件，`**` 表示递归查找所有子目录

**addons 插件**
- `addon-essentials`：包含了最常用的插件集合
  - Controls：动态修改组件属性
  - Actions：查看事件处理器的调用
  - Viewport：测试不同屏幕尺寸
  - Backgrounds：切换背景颜色
  - Toolbars：自定义工具栏
  - Docs：自动生成文档页面
- `addon-interactions`：提供交互测试功能，可以模拟用户操作
- `addon-links`：在不同 stories 之间创建导航链接

**framework 框架**
- 使用 `@storybook/nextjs` 而不是普通的 `@storybook/react`
- 自动支持 Next.js 特性：
  - `next/image` 图片组件优化
  - `next/font` 字体优化
  - CSS Modules
  - 路由系统模拟

**docs 文档**
- `autodocs: 'tag'`：只为在 meta 中标记了 `tags: ['autodocs']` 的组件生成文档
- 可选值：
  - `'tag'`：需要显式标记
  - `true`：为所有组件生成文档
  - `false`：不生成文档

**staticDirs 静态目录**
- 指定 `../public` 目录，使 Storybook 可以访问项目的静态资源
- stories 中可以直接使用 `/assets/logo.png` 这样的路径

**webpackFinal 自定义配置**
- 配置路径别名 `@` 指向 `src` 目录
- 保持与项目主配置一致，避免导入路径问题
- 简化导入语句：`import { Button } from '@/components/Button'`

### 2. Preview 配置

创建 `frontend/.storybook/preview.ts`：

```typescript
import type { Preview } from '@storybook/react';
import '../src/app/globals.css';  // 导入全局样式，包括 Tailwind CSS

const preview: Preview = {
  parameters: {
    // Actions 配置：自动为符合模式的 props 创建动作日志
    // 匹配所有以 'on' 开头后跟大写字母的 props（如 onClick, onSubmit）
    actions: { argTypesRegex: '^on[A-Z].*' },
    
    // Controls 配置：控制面板的行为
    controls: {
      matchers: {
        // 为包含 'color' 或 'background' 的 prop 提供颜色选择器
        color: /(background|color)$/i,
        // 为包含 'date' 的 prop 提供日期选择器
        date: /Date$/i,
      },
    },
    
    // Backgrounds 配置：为 stories 提供背景切换功能
    backgrounds: {
      default: 'light',  // 默认背景
      values: [
        {
          name: 'light',
          value: '#ffffff',  // 亮色背景
        },
        {
          name: 'dark',
          value: '#1a1a1a',  // 暗色背景
        },
      ],
    },
  },
};

export default preview;
```

#### Preview 配置详解

**全局样式导入**
- `import '../src/app/globals.css'`：导入项目的全局 CSS 文件
- 确保 Tailwind CSS 类名在 Storybook 中生效
- 包含项目的自定义样式和 CSS 变量

**actions 动作配置**
- 自动检测事件处理器 props（如 `onClick`、`onChange`、`onSubmit`）
- 在 Actions 面板中显示调用日志
- 可以查看传递的参数和调用次数
- 示例：点击按钮时会在 Actions 面板显示 "onClick" 被调用

**controls 控制配置**
- `color` matcher：为颜色相关的 props 提供可视化颜色选择器
  - 匹配：`backgroundColor`、`color`、`borderColor` 等
- `date` matcher：为日期相关的 props 提供日期选择器
  - 匹配：`createdDate`、`updateDate` 等
- 可以在控制面板中实时修改组件属性，无需修改代码

**backgrounds 背景配置**
- 在工具栏提供背景切换按钮
- 可以测试组件在不同背景下的显示效果
- 适合测试暗色模式适配
- 可以添加更多背景选项（如渐变、图片背景等）

#### 扩展配置示例

如果需要添加更多全局配置，可以扩展 preview：

```typescript
const preview: Preview = {
  parameters: {
    // 添加视口配置
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
      },
    },
  },
  
  // 全局装饰器：为所有 stories 添加包装
  decorators: [
    (Story) => (
      <div style={{ padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};
```

### 3. 更新 package.json

在 `frontend/package.json` 的 scripts 中添加：

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

## 创建 Stories

### Story 文件结构说明

每个 story 文件由三部分组成：

1. **Meta 配置**：定义组件的元数据和全局配置
2. **Story 类型**：TypeScript 类型定义
3. **具体 Stories**：组件的不同状态和变体

### 基础示例

为 `connect-wallet-modal.tsx` 创建故事文件 `frontend/src/components/connect-wallet-modal.stories.tsx`：

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ConnectWalletModal } from './connect-wallet-modal';

// Meta 配置：定义组件的基本信息
const meta = {
  // 在 Storybook 侧边栏中的位置
  // 'Components/ConnectWalletModal' 会创建 Components 文件夹，下面有 ConnectWalletModal 项
  title: 'Components/ConnectWalletModal',
  
  // 要展示的组件
  component: ConnectWalletModal,
  
  // 参数配置
  parameters: {
    layout: 'centered',  // 布局方式：centered（居中）、fullscreen（全屏）、padded（带边距）
  },
  
  // 标签：启用自动文档生成
  tags: ['autodocs'],
  
  // 参数类型配置：为组件 props 添加控制器和说明
  argTypes: {
    isOpen: {
      control: 'boolean',  // 控制器类型：boolean 开关
      description: '模态框是否打开',  // 在文档中显示的说明
    },
    onClose: {
      action: 'closed',  // 将回调函数显示为 action
      description: '关闭回调函数',
    },
  },
} satisfies Meta<typeof ConnectWalletModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// 默认状态：模态框打开
export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
  },
};

// 关闭状态：模态框关闭
export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
  },
};
```

#### 代码解释

**Meta 配置项**
- `title`：组件在侧边栏的路径，使用 `/` 分隔创建层级结构
- `component`：要展示的 React 组件
- `parameters.layout`：
  - `centered`：组件居中显示，适合小组件
  - `fullscreen`：占满整个画布，适合页面级组件
  - `padded`：带内边距，默认选项
- `tags: ['autodocs']`：自动生成文档页面
- `argTypes`：为每个 prop 定义控制器类型和说明

**控制器类型**
- `boolean`：开关按钮
- `text`：文本输入框
- `number`：数字输入框
- `range`：滑块
- `select`：下拉选择
- `radio`：单选按钮
- `object`：JSON 编辑器
- `color`：颜色选择器

**Story 定义**
- 每个导出的常量代表组件的一个状态
- `args`：传递给组件的 props
- 可以定义多个 stories 展示不同场景

### Footer 组件示例

创建 `frontend/src/components/footer.stories.tsx`：

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from './footer';

const meta = {
  title: 'Layout/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

### Navbar 组件示例

创建 `frontend/src/components/layout/navbar.stories.tsx`：

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Navbar } from './navbar';

const meta = {
  title: 'Layout/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
```

### 带有多种状态的组件示例

创建 `frontend/src/components/collection-card.stories.tsx`：

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CollectionCard } from './collection-card';

const meta = {
  title: 'Components/CollectionCard',
  component: CollectionCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CollectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'My Collection',
    description: 'A collection of commits',
    imageUrl: '/assets/nfts/example.png',
    itemCount: 42,
  },
};

export const WithoutImage: Story = {
  args: {
    title: 'Empty Collection',
    description: 'No items yet',
    itemCount: 0,
  },
};

export const LongDescription: Story = {
  args: {
    title: 'Collection with Long Description',
    description: 'This is a very long description that should demonstrate how the component handles overflow text and wrapping behavior in different scenarios.',
    imageUrl: '/assets/nfts/example.png',
    itemCount: 128,
  },
};
```

## 运行 Storybook

### 开发模式

```bash
cd frontend
npm run storybook
```

Storybook 将在 `http://localhost:6006` 启动。

### 构建静态版本

```bash
cd frontend
npm run build-storybook
```

构建产物会生成在 `storybook-static` 目录，可以部署到静态托管服务。

## 最佳实践

### 1. 文件组织

建议将 stories 文件放在组件旁边：

```
src/
  components/
    footer.tsx
    footer.stories.tsx
    navbar/
      navbar.tsx
      navbar.stories.tsx
```

### 2. Story 命名规范

- 使用 PascalCase：`Default`、`WithProps`、`ErrorState`
- 语义化命名：`Loading`、`Empty`、`WithData`

### 3. 参数配置

为组件添加有意义的参数描述：

```typescript
argTypes: {
  variant: {
    control: 'select',
    options: ['default', 'primary', 'secondary'],
    description: '按钮变体样式',
  },
  size: {
    control: 'radio',
    options: ['sm', 'md', 'lg'],
    description: '按钮尺寸',
  },
}
```

### 4. 模拟数据

为需要外部数据的组件创建 mock 数据：

```typescript
const mockContributions = [
  { id: 1, message: 'Initial commit', date: '2024-01-01' },
  { id: 2, message: 'Add feature', date: '2024-01-02' },
];

export const WithData: Story = {
  args: {
    contributions: mockContributions,
  },
};
```

### 5. 装饰器

为需要特定上下文的组件添加装饰器：

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const decorators = [
  (Story) => (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  ),
];
```

## 常见问题

### 1. pnpm workspace 安装错误

**错误信息：**
```
ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  hardhat@1.0.0 compile: `hardhat compile`
Exit status 1
```

**原因：**
在根目录运行安装时，pnpm workspace 会尝试构建所有子项目，hardhat 编译失败导致安装中断。

**解决方法：**
必须在 frontend 目录下单独运行：
```bash
cd /Users/frederick/Documents/Lightcommit/frontend
npx storybook@latest init
```

**注意：** 
- 不要在项目根目录运行
- 不要使用 `pnpm -r` 或 `pnpm --recursive` 命令
- 确保当前工作目录是 frontend

### 2. Tailwind 样式不生效

确保在 `.storybook/preview.ts` 中导入了全局样式：

```typescript
import '../src/app/globals.css';
```

### 2. 路径别名不识别

在 `.storybook/main.ts` 中配置 webpack 别名：

```typescript
webpackFinal: async (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, '../src'),
  };
  return config;
};
```

### 3. Next.js 特定功能

使用 `@storybook/nextjs` 而不是 `@storybook/react`，它支持：
- Next.js 图片优化
- 字体优化
- 路由模拟

### 4. 环境变量

创建 `.storybook/.env.local` 用于 Storybook 特定的环境变量。

## 进阶功能

### 1. 交互测试

使用 `@storybook/addon-interactions` 进行交互测试：

```typescript
import { userEvent, within } from '@storybook/test';

export const InteractiveTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
  },
};
```

### 2. 可访问性测试

添加 `@storybook/addon-a11y`：

```bash
npm install --save-dev @storybook/addon-a11y
```

在 `.storybook/main.ts` 中添加：

```typescript
addons: [
  '@storybook/addon-a11y',
],
```

### 3. 主题切换

为支持暗色模式的组件添加主题切换：

```typescript
export const decorators = [
  (Story, context) => {
    const theme = context.globals.theme || 'light';
    return (
      <div className={theme}>
        <Story />
      </div>
    );
  },
];

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: ['light', 'dark'],
    },
  },
};
```

## 部署

### Vercel 部署

在 `vercel.json` 中添加：

```json
{
  "buildCommand": "cd frontend && npm run build-storybook",
  "outputDirectory": "frontend/storybook-static"
}
```

### Chromatic 集成

用于视觉回归测试：

```bash
npm install --save-dev chromatic
npx chromatic --project-token=<your-token>
```

## 参考资源

- [Storybook 官方文档](https://storybook.js.org/docs)
- [Storybook Next.js 集成](https://storybook.js.org/docs/get-started/nextjs)
- [Storybook 最佳实践](https://storybook.js.org/docs/writing-stories)
- [Component Story Format (CSF)](https://storybook.js.org/docs/api/csf)

## 项目特定注意事项

### 钱包连接组件

对于使用 ethers.js 的组件，需要 mock provider：

```typescript
const mockProvider = {
  getSigner: () => Promise.resolve({}),
  getNetwork: () => Promise.resolve({ chainId: 1 }),
};
```

### Supabase 集成

对于使用 Supabase 的组件，创建 mock client：

```typescript
const mockSupabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
  }),
};
```

### GitHub API 组件

使用 MSW (Mock Service Worker) 模拟 API 响应：

```bash
npm install --save-dev msw msw-storybook-addon
```

## 团队协作

### Code Review

- 提交新组件时，同时提交对应的 stories
- 在 PR 中包含 Storybook 截图
- 确保所有状态都有对应的 story

### 文档规范

使用 MDX 编写组件文档：

```mdx
import { Meta } from '@storybook/blocks';

<Meta title="Components/Button" />

# Button 组件

按钮组件用于触发操作。

## 使用场景

- 表单提交
- 操作确认
- 导航跳转
```

## 维护清单

- [x] 安装 Storybook
- [x] 配置 Tailwind CSS
- [ ] 为核心组件创建 stories
- [ ] 配置环境变量
- [ ] 添加交互测试
- [ ] 设置 CI/CD 集成
- [ ] 部署 Storybook 静态站点

## 故障排除

### 已修复的问题

#### 1. `__dirname is not defined` 错误

**问题**: 在 ESM 模块中使用 CommonJS 的 `__dirname` 导致运行时错误。

**解决方案**: 在 `.storybook/main.ts` 中添加 ESM 兼容的 `__dirname` 定义：

```typescript
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

#### 2. 缺少必需的 Storybook 插件

**问题**: `@storybook/addon-essentials`、`@storybook/addon-interactions`、`@storybook/addon-links` 未安装。

**解决方案**: 在 `package.json` 中添加这些依赖，并统一所有 Storybook 包的版本为 `8.6.14`：

```json
"@storybook/addon-essentials": "^8.6.14",
"@storybook/addon-interactions": "^8.6.14",
"@storybook/addon-links": "^8.6.14"
```

#### 3. ESLint 错误：未转义的引号

**问题**: `Page.tsx` 中存在未转义的引号字符。

**解决方案**: 将 `"args"` 替换为 HTML 实体 `&ldquo;args&rdquo;`。


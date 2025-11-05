import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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


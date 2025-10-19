# JOIN US 组件文档

## 概述

创建了统一的`JoinUs`组件，用于在多个页面展示社交媒体链接。

## 组件特点

### 设计风格
- 圆形按钮设计
- 白色背景 + 黑色粗边框
- 偏移阴影效果：4px → 6px (hover)
- 手绘风格，与整体设计保持一致

### 社交媒体
1. **Discord** - 使用自定义SVG图标
2. **Twitter** - 使用Lucide图标
3. **Instagram** - 使用Lucide图标

### 交互效果
- **Hover**: 放大1.1倍 + 旋转5度 + 阴影增强
- **Tap**: 缩小0.95倍
- **过渡**: 平滑动画效果

## 组件API

### Props

```typescript
interface JoinUsProps {
  className?: string;        // 额外的CSS类名
  showTitle?: boolean;       // 是否显示标题，默认true
  titleSize?: 'small' | 'medium' | 'large';  // 标题大小，默认'large'
}
```

### 标题尺寸

| 尺寸 | 移动端 | 桌面端 | 使用场景 |
|------|--------|--------|----------|
| small | 2xl | 3xl | 小型侧边栏 |
| medium | 3xl | 4xl | 内容区域（Landing Page） |
| large | 5xl | 6xl | 独立展示区（Roadmap） |

## 使用示例

### 基础使用

```tsx
import { JoinUs } from '@/components/join-us';

<JoinUs />
```

### 自定义标题大小

```tsx
// Landing Page (WhatSection)
<JoinUs titleSize="medium" />

// Roadmap Page
<JoinUs titleSize="large" />
```

### 不显示标题

```tsx
<JoinUs showTitle={false} />
```

### 添加自定义样式

```tsx
<JoinUs className="mt-8 mb-4" titleSize="small" />
```

## 当前使用位置

### 1. Landing Page (`/`)

**组件**: `WhatSection`  
**配置**: `titleSize="medium"`  
**位置**: WHAT'S LIGHTCOMMIT 区域底部

```tsx
<JoinUs titleSize="medium" />
```

### 2. Roadmap Page (`/roadmap`)

**组件**: `RoadmapPage`  
**配置**: `titleSize="large"`  
**位置**: 路线图容器下方，独立展示区

```tsx
<JoinUs titleSize="large" />
```

## 样式详情

### 按钮样式

```css
width: 64px (16 * 4)
height: 64px (16 * 4)
border-radius: 50%
background: white
border: 4px solid black
box-shadow: 4px 4px 0px 0px rgba(0,0,0,1)
```

### Hover 样式

```css
transform: scale(1.1) rotate(5deg)
box-shadow: 6px 6px 0px 0px rgba(0,0,0,1)
```

### 图标样式

```css
width: 32px (8 * 4)
height: 32px (8 * 4)
stroke-width: 2 (for Lucide icons)
```

## 链接配置

当前使用占位链接，需要更新为实际的社交媒体链接：

```tsx
Discord: https://discord.gg/your-server
Twitter: https://twitter.com/your-account
Instagram: https://instagram.com/your-account
```

## 可访问性

- 所有链接包含 `aria-label` 属性
- 使用 `target="_blank"` 和 `rel="noopener noreferrer"`
- 支持键盘导航
- 清晰的视觉反馈

## 技术实现

### 依赖

- `framer-motion` - 动画效果
- `lucide-react` - Twitter & Instagram 图标
- 自定义 Discord SVG 图标

### Discord SVG

使用完整的Discord品牌SVG路径，确保图标准确显示。

## 后续优化

### 建议改进

1. **配置化**: 通过props传入社交媒体链接
2. **扩展性**: 支持添加更多社交平台
3. **主题支持**: 支持深色/浅色主题切换
4. **分析集成**: 添加点击事件追踪
5. **国际化**: 支持不同地区的社交平台

### 示例：可配置链接

```tsx
interface JoinUsProps {
  links?: {
    discord?: string;
    twitter?: string;
    instagram?: string;
  };
}

<JoinUs 
  links={{
    discord: 'https://discord.gg/lightcommit',
    twitter: 'https://twitter.com/lightcommit',
    instagram: 'https://instagram.com/lightcommit'
  }}
/>
```

## 文件位置

```
frontend/src/components/join-us.tsx
```

## 相关组件

- `WhatSection` - Landing Page使用
- `RoadmapPage` - Roadmap页面使用

## 版本历史

- **v1.0** (2025-01-19): 初始版本，统一JOIN US样式
  - 创建可重用组件
  - 支持3种标题尺寸
  - 统一动画效果


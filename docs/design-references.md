# LightCommit 设计参考

本文档记录 LightCommit 项目的设计灵感来源和参考资料。

## 🎨 主要设计参考

### 1. [Good Vibes Club](https://www.goodvibesclub.io/)
- **借鉴元素**:
  - 极简主义设计
  - 超大标题字体
  - 黑白主题配色
  - 清晰的 FAQ 折叠布局
  - 简洁的合作方展示
  
- **应用场景**:
  - Landing Page 整体布局
  - Hero Section 设计
  - 文字排版风格

### 2. [Bored Ape Yacht Club](https://www.boredapeyachtclub.com/)
- **借鉴元素**:
  - NFT 收藏展示方式
  - 社区氛围营造
  - 复古/艺术风格
  
- **应用场景**:
  - NFT 卡片设计（早期版本）
  - 视觉装饰元素

## 🎯 设计原则

### 极简主义
- 减少不必要的装饰
- 留白的合理使用
- 聚焦核心信息

### 技术感
- 代码元素融入
- 现代化 UI 组件
- 流畅的动画效果

### 开发者友好
- 暗色主题优先
- 清晰的信息层级
- 直观的交互设计

## 🖼️ 视觉风格

### 色彩
- **主色**: 黑色 (#000000)
- **强调色**: 紫色渐变 (#a855f7 → #ec4899)
- **辅助色**: 白色、灰度

### 字体
- **标题**: 超大、极粗（font-black, text-6xl-9xl）
- **正文**: 中等大小（text-lg-xl）
- **代码**: 等宽字体（font-mono）

### 动画
- 页面加载: fade-in + slide-up
- 悬停效果: scale + translate
- 过渡时间: 300-600ms
- 缓动函数: ease-in-out

## 🏗️ 布局参考

### Landing Page 结构
```
1. Hero Section (全屏/接近全屏)
   - 超大标题
   - 副标题
   - CTA 按钮
   - 统计数据

2. Partners Section
   - 合作方 Logo
   - 简洁展示

3. Collection Preview
   - NFT 预览
   - 简短介绍

4. About Section
   - 产品介绍
   - 核心功能

5. FAQ Section
   - 可折叠问答

6. Footer
   - 链接
   - 社交媒体
```

## 📱 响应式设计

### 断点
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

### 适配策略
- Mobile First 设计
- 灵活的网格系统
- 可缩放的字体大小
- 适应性图片

## 🔍 竞品参考

### NFT 平台
- OpenSea
- Rarible
- Foundation

### 开发者平台
- GitHub
- GitLab
- Vercel

## 💡 设计灵感

### 网站
- [Awwwards](https://www.awwwards.com/)
- [Dribbble](https://dribbble.com/)
- [Behance](https://www.behance.net/)

### 设计系统
- [Tailwind UI](https://tailwindui.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)

## 🎬 动画参考

- [Framer Motion Examples](https://www.framer.com/motion/)
- [Awwwards Animation](https://www.awwwards.com/awwwards/collections/animation/)
- [Codrops](https://tympanus.net/codrops/)

## 📝 设计文档

- 详细素材需求: `docs/assets-requirements.md`
- 前端架构: `frontend/README.md`

---

**持续更新中**

添加新的设计参考时，请更新此文档。


# LightCommit 素材需求清单

## 📁 素材目录结构

```
frontend/public/assets/
├── logos/              # Logo 和品牌标识
├── images/             # 通用图片
├── icons/              # 图标文件
├── backgrounds/        # 背景图片
└── nfts/              # NFT 示例图片
```

## 🎨 需要的素材

### 1. Logo 和品牌标识 (`/logos/`)

#### 主 Logo
- **logo.svg** - 主 Logo（SVG 格式，可缩放）
- **logo.png** - 主 Logo（PNG 格式，透明背景，2000x2000px）
- **logo-white.svg** - 白色版本 Logo
- **logo-dark.svg** - 深色版本 Logo

#### Favicon
- **favicon.ico** - 网站图标（32x32, 16x16）
- **favicon-192.png** - PWA 图标（192x192px）
- **favicon-512.png** - PWA 图标（512x512px）

#### 社交媒体
- **og-image.png** - Open Graph 分享图（1200x630px）
- **twitter-card.png** - Twitter 卡片图（1200x600px）

---

### 2. 背景图片 (`/backgrounds/`)

#### Hero Section 背景
- **hero-bg.jpg** - Hero 区域背景图（1920x1080px 或更大）
- **hero-pattern.svg** - 背景图案（可重复）
- **gradient-overlay.png** - 渐变叠加层

#### 装饰元素
- **code-pattern.svg** - 代码风格背景图案
- **grid-pattern.svg** - 网格背景
- **noise-texture.png** - 噪点纹理（用于叠加）

---

### 3. NFT 相关 (`/nfts/`)

#### NFT 示例卡片
- **nft-example-1.png** - NFT 示例图 1（1000x1000px）
- **nft-example-2.png** - NFT 示例图 2（1000x1000px）
- **nft-example-3.png** - NFT 示例图 3（1000x1000px）
- **nft-example-4.png** - NFT 示例图 4（1000x1000px）
- **nft-example-5.png** - NFT 示例图 5（1000x1000px）
- **nft-example-6.png** - NFT 示例图 6（1000x1000px）

#### NFT 类型图标
- **commit-badge.svg** - Commit 类型徽章
- **pr-badge.svg** - Pull Request 类型徽章
- **issue-badge.svg** - Issue 类型徽章

#### NFT 预览
- **collection-preview.jpg** - 收藏预览大图（2400x1350px）

---

### 4. 图标 (`/icons/`)

#### 功能图标（SVG 格式）
- **github-icon.svg** - GitHub 图标
- **wallet-icon.svg** - 钱包图标
- **blockchain-icon.svg** - 区块链图标
- **nft-icon.svg** - NFT 图标
- **code-icon.svg** - 代码图标
- **trophy-icon.svg** - 奖杯图标

#### 社交媒体图标
- **twitter-icon.svg** - Twitter/X 图标
- **discord-icon.svg** - Discord 图标
- **telegram-icon.svg** - Telegram 图标

---

### 5. 插图和装饰 (`/images/`)

#### 功能插图
- **feature-github.png** - GitHub 集成插图（800x600px）
- **feature-blockchain.png** - 区块链插图（800x600px）
- **feature-nft.png** - NFT 铸造插图（800x600px）

#### 流程图
- **how-it-works-1.svg** - 步骤 1 插图
- **how-it-works-2.svg** - 步骤 2 插图
- **how-it-works-3.svg** - 步骤 3 插图
- **how-it-works-4.svg** - 步骤 4 插图

#### 装饰元素
- **decoration-1.svg** - 装饰元素 1
- **decoration-2.svg** - 装饰元素 2
- **sparkle.svg** - 星星装饰

---

## 🎨 设计规范

### 色彩方案
```css
/* 主色 */
--black: #000000
--white: #FFFFFF

/* 强调色 */
--purple-400: #a855f7
--purple-500: #9333ea
--pink-500: #ec4899
--pink-600: #db2777

/* 灰度 */
--gray-100: #f3f4f6
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827
```

### 字体
- **主标题**: 极粗体（font-black）、超大尺寸（6xl-9xl）
- **副标题**: 粗体（font-bold）、大尺寸（3xl-5xl）
- **正文**: 常规（font-normal）、标准尺寸（base-xl）
- **代码**: 等宽字体（font-mono）

### Logo 设计要求
- 简洁现代
- 易于识别
- 黑白两色可用
- 在小尺寸下清晰可辨

### NFT 示例设计建议
- 3D 风格或扁平插画风格
- 科技感/代码主题
- 每个 NFT 应该独特但风格统一
- 考虑使用：代码片段、Git 图标、开发者元素

### 图标设计要求
- SVG 格式优先
- 线条粗细一致（2-3px）
- 24x24px 基础尺寸
- 可单色可渐变

---

## 📐 尺寸规范

### 响应式断点
- Mobile: 0-767px
- Tablet: 768-1023px
- Desktop: 1024px+

### 图片导出尺寸
- **小图标**: 24x24px, 32x32px, 48x48px
- **中等图片**: 400x400px, 800x600px
- **大图**: 1200x800px, 1920x1080px
- **超大图**: 2400x1350px, 3840x2160px

### 导出格式建议
- **Logo**: SVG（首选）+ PNG（备用）
- **图标**: SVG
- **照片/插图**: JPG（有损）或 PNG（无损）
- **背景图**: JPG（压缩后）
- **装饰元素**: SVG 或 PNG（透明背景）

---

## 🚀 优先级

### P0 - 立即需要（核心功能）
- [ ] Logo（主 Logo + Favicon）
- [ ] 3-6 个 NFT 示例图
- [ ] Hero Section 背景图

### P1 - 重要（视觉完整性）
- [ ] 功能图标（GitHub、钱包、区块链等）
- [ ] NFT 类型徽章
- [ ] 社交媒体图标

### P2 - 可选（锦上添花）
- [ ] 功能插图
- [ ] 流程图
- [ ] 装饰元素
- [ ] 背景纹理

---

## 💡 临时替代方案

在获得正式设计素材前，可以使用：

1. **Logo 占位符**
   - 使用文字 Logo："LightCommit" 或 "LC"
   - CSS 渐变背景

2. **图标**
   - Lucide React（已集成）
   - Heroicons
   - Feather Icons

3. **NFT 示例**
   - 使用渐变背景 + 图标
   - 或从 Unsplash 等免费素材站下载占位图

4. **背景图**
   - CSS 渐变
   - SVG 图案生成器（如 Hero Patterns）

---

## 📦 素材来源建议

### 免费资源
- **插图**: [unDraw](https://undraw.co/), [Humaaans](https://www.humaaans.com/)
- **图标**: [Lucide](https://lucide.dev/), [Heroicons](https://heroicons.com/)
- **照片**: [Unsplash](https://unsplash.com/), [Pexels](https://pexels.com/)
- **图案**: [Hero Patterns](https://heropatterns.com/), [SVG Backgrounds](https://svgbackgrounds.com/)
- **Logo 生成**: [Hatchful](https://www.shopify.com/tools/logo-maker), [Looka](https://looka.com/)

### 专业设计
- 聘请设计师（Fiverr、99designs）
- 使用 AI 生成（Midjourney、DALL-E）
- 委托专业设计公司

---

## 🔧 技术规格

### 文件命名规范
- 使用小写字母
- 单词用连字符分隔
- 避免空格和特殊字符
- 例如：`logo-white.svg`, `nft-example-1.png`

### 优化建议
- **SVG**: 压缩并移除不必要的元数据
- **PNG**: 使用 TinyPNG 压缩
- **JPG**: 质量 80-85%
- **响应式**: 提供多尺寸版本（使用 Next.js Image 组件）

### 版本控制
- 将大型素材文件添加到 `.gitignore`（如果超过 1MB）
- 考虑使用 Git LFS 管理大文件
- 或使用 CDN 托管

---

## 📝 使用说明

1. **下载/创建素材**后，放入对应的文件夹
2. 在代码中使用：
   ```tsx
   // 方式 1: 直接引用
   <img src="/assets/logos/logo.svg" alt="Logo" />
   
   // 方式 2: Next.js Image（推荐）
   import Image from 'next/image'
   <Image src="/assets/logos/logo.svg" width={200} height={60} alt="Logo" />
   ```
3. 更新此文档，标记已完成的素材项

---

**最后更新**: 2025-01-19

如有问题或需要补充，请随时更新此文档。


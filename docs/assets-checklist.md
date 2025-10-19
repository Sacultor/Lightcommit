# LightCommit 素材进度清单

**最后更新**: 2025-01-19

使用此清单跟踪素材的准备进度。完成后在对应项目前打勾 ✅

---

## 🎨 P0 优先级 - 核心素材（立即需要）

### Logo 和品牌标识
- [ ] `logo.svg` - 主 Logo（SVG 格式）
- [ ] `logo.png` - 主 Logo（PNG 格式，2000x2000px）
- [ ] `logo-white.svg` - 白色版本 Logo
- [ ] `favicon.ico` - 网站图标
- [ ] `favicon-192.png` - PWA 图标（192x192px）
- [ ] `favicon-512.png` - PWA 图标（512x512px）

**存放位置**: `frontend/public/assets/logos/`

### NFT 示例图片
- [ ] `nft-example-1.png` - NFT 示例 1（1000x1000px）
- [ ] `nft-example-2.png` - NFT 示例 2（1000x1000px）
- [ ] `nft-example-3.png` - NFT 示例 3（1000x1000px）
- [ ] `nft-example-4.png` - NFT 示例 4（1000x1000px）
- [ ] `nft-example-5.png` - NFT 示例 5（1000x1000px）
- [ ] `nft-example-6.png` - NFT 示例 6（1000x1000px）

**存放位置**: `frontend/public/assets/nfts/`

### Hero 背景
- [x] `background.png` - Hero 区域背景图（1024x1024px）✅
- [ ] `hero-pattern.svg` - 背景图案（可选）

**存放位置**: `frontend/public/assets/backgrounds/`

---

## 🎯 P1 优先级 - 重要素材

### 功能图标
- [ ] `github-icon.svg` - GitHub 图标
- [ ] `wallet-icon.svg` - 钱包图标
- [ ] `blockchain-icon.svg` - 区块链图标
- [ ] `nft-icon.svg` - NFT 图标
- [ ] `code-icon.svg` - 代码图标
- [ ] `trophy-icon.svg` - 奖杯图标

**存放位置**: `frontend/public/assets/icons/`

### NFT 类型徽章
- [ ] `commit-badge.svg` - Commit 类型徽章
- [ ] `pr-badge.svg` - Pull Request 类型徽章
- [ ] `issue-badge.svg` - Issue 类型徽章

**存放位置**: `frontend/public/assets/nfts/`

### 社交媒体
- [ ] `twitter-icon.svg` - Twitter/X 图标
- [ ] `discord-icon.svg` - Discord 图标
- [ ] `og-image.png` - Open Graph 分享图（1200x630px）
- [ ] `twitter-card.png` - Twitter 卡片图（1200x600px）

**存放位置**: `frontend/public/assets/icons/` 和 `frontend/public/assets/images/`

---

## ⭐ P2 优先级 - 可选素材

### 功能插图
- [ ] `feature-github.png` - GitHub 集成插图（800x600px）
- [ ] `feature-blockchain.png` - 区块链插图（800x600px）
- [ ] `feature-nft.png` - NFT 铸造插图（800x600px）

**存放位置**: `frontend/public/assets/images/`

### 流程图
- [ ] `how-it-works-1.svg` - 步骤 1 插图
- [ ] `how-it-works-2.svg` - 步骤 2 插图
- [ ] `how-it-works-3.svg` - 步骤 3 插图
- [ ] `how-it-works-4.svg` - 步骤 4 插图

**存放位置**: `frontend/public/assets/images/`

### 装饰元素
- [ ] `decoration-1.svg` - 装饰元素 1
- [ ] `decoration-2.svg` - 装饰元素 2
- [ ] `sparkle.svg` - 星星装饰
- [ ] `grid-pattern.svg` - 网格背景
- [ ] `noise-texture.png` - 噪点纹理

**存放位置**: `frontend/public/assets/backgrounds/`

### NFT Collection
- [ ] `collection-preview.jpg` - 收藏预览大图（2400x1350px）

**存放位置**: `frontend/public/assets/nfts/`

---

## 📊 进度统计

- **P0 核心素材**: 1/14 (7%)
- **P1 重要素材**: 0/15 (0%)
- **P2 可选素材**: 0/13 (0%)
- **总计**: 1/42 (2%)

---

## 🛠️ 快速操作指南

### 1. 下载或创建素材
根据 `docs/assets-requirements.md` 中的规范准备素材

### 2. 放入对应文件夹
```bash
# 示例
cp your-logo.svg frontend/public/assets/logos/logo.svg
cp your-nft-1.png frontend/public/assets/nfts/nft-example-1.png
```

### 3. 在代码中使用
```tsx
import Image from 'next/image'

<Image 
  src="/assets/logos/logo.svg" 
  width={200} 
  height={60} 
  alt="Logo" 
/>
```

### 4. 更新此清单
完成后在对应项前打勾 ✅

---

## 💡 临时替代方案

在正式素材就绪前，可以使用：

1. **Logo**: CSS 文字 + 渐变背景
2. **图标**: Lucide React 图标库（已集成）
3. **NFT 示例**: 渐变背景 + 占位符
4. **背景**: CSS 渐变或 SVG 图案

---

## 🔗 相关文档

- 详细需求: `docs/assets-requirements.md`
- 设计参考: `docs/design-references.md`
- 素材说明: `frontend/public/assets/README.md`

---

**备注**:
- 完成一项后请打勾并更新进度统计
- 如有新增素材需求，请同步更新所有相关文档


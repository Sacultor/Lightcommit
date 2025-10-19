# Assets 素材文件夹

此文件夹用于存放 LightCommit 项目的所有视觉素材。

## 📁 目录结构

```
assets/
├── logos/              # Logo 和品牌标识
├── images/             # 通用图片
├── icons/              # 图标文件
├── backgrounds/        # 背景图片
└── nfts/              # NFT 示例图片
```

## 📋 完整素材清单

请参考项目根目录下的 `docs/assets-requirements.md` 文件，查看详细的素材需求清单。

## 🚀 快速开始

### 添加新素材

1. 将素材文件放入对应的文件夹
2. 遵循命名规范（小写字母，连字符分隔）
3. 在代码中引用：

```tsx
// 直接引用
<img src="/assets/logos/logo.svg" alt="Logo" />

// Next.js Image 组件（推荐）
import Image from 'next/image'
<Image 
  src="/assets/logos/logo.svg" 
  width={200} 
  height={60} 
  alt="Logo" 
/>
```

## 📐 文件格式建议

- **Logo**: SVG（优先）或 PNG（透明背景）
- **图标**: SVG
- **照片**: JPG（压缩后）
- **插图**: PNG（透明背景）或 SVG
- **背景**: JPG（大图压缩）

## 🔧 优化建议

- 使用 [TinyPNG](https://tinypng.com/) 压缩 PNG/JPG
- 使用 [SVGOMG](https://jakearchibald.github.io/svgomg/) 优化 SVG
- 提供多尺寸版本以支持响应式设计

## 📝 注意事项

- 确保素材有适当的版权许可
- 大文件（>1MB）考虑使用 CDN
- 保持命名一致性和可读性


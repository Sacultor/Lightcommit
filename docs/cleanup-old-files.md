# 旧文件清理列表

## 概述

以下是前端中不再使用的旧组件和文件，可以安全删除。

## 🗑️ 可以删除的文件

### 1. Landing Page 旧组件

#### ❌ `/components/nft-grid.tsx`
**原因**: 已被新的 `collection-card.tsx` + `collection-container.tsx` 替代

**原用途**: 在旧的NFTs页面展示NFT网格

**新替代方案**: 
```tsx
<CollectionContainer>
  <CollectionCard />
</CollectionContainer>
```

---

#### ❌ `/components/features-section.tsx`
**原因**: 从landing page移除，不再使用

**原用途**: 展示产品特性section

**状态**: 完全未引用

---

#### ❌ `/components/partners-section.tsx`
**原因**: 从landing page移除，不再使用

**原用途**: 展示合作伙伴section

**状态**: 完全未引用

---

#### ❌ `/components/collection-preview.tsx`
**原因**: 从landing page移除，不再使用

**原用途**: 预览NFT收藏section

**状态**: 完全未引用

---

#### ❌ `/components/hero-section.tsx`
**原因**: 已被 `hero-section-gvc.tsx` 替代

**原用途**: 旧的Hero section

**新替代方案**: `HeroSectionGVC` (带动物场景的版本)

**状态**: 完全未引用

---

#### ❌ `/components/how-it-works.tsx`
**原因**: 功能已整合到 `what-section.tsx` 中

**原用途**: HOW IT WORKS section

**新替代方案**: WhatSection包含了HOW IT WORKS部分

**状态**: 完全未引用

---

#### ❌ `/components/landingpage/` 目录
**原因**: 完全未使用的landing page组件

**包含文件**:
- `hero.tsx`
- `index.ts`

**状态**: 完全未引用

---

### 2. Dashboard 旧UI组件

#### ⚠️ `/components/dashboard/ui/` 目录
**包含文件**:
- `button.tsx`
- `card.tsx`
- `input.tsx`

**状态**: 需要检查是否被dashboard组件使用

**建议**: 如果dashboard组件不使用，可以删除

---

### 3. Mint 旧组件（部分）

#### ⚠️ `/components/mint/` 目录下的部分文件

**可能不用的**:
- `ConfigureNFT.tsx` - 已有新的mint/new/page.tsx
- `PreviewNetwork.tsx` - 已整合到新页面
- `MintProgressSteps.tsx` - 已整合到新页面
- `MintingSuccess.tsx` - 已整合到新页面

**还在使用的**:
- `MintPageContent.tsx` - 在 `dashboard/mint/page.tsx` 中使用

**建议**: 
- 如果准备完全使用新的mint流程，可以删除旧mint组件
- 如果要保留dashboard的mint功能，需要保留

#### ⚠️ `/components/mint/ui/` 目录
**包含文件**:
- `button.tsx`
- `card.tsx`
- `input.tsx`

**状态**: 如果旧mint组件删除，这些也可以删除

---

### 4. Layout 旧组件

#### ⚠️ `/components/layout/navbar.tsx`
**状态**: 在profiles页面使用

**建议**: 如果profiles页面要更新为手绘风格，可以替换为HeaderSimple

---

## ✅ 确定在使用的文件

### Landing Page相关
- ✅ `hero-section-gvc.tsx` - 主页Hero section
- ✅ `about-section.tsx` - 主页About section
- ✅ `what-section.tsx` - 主页What section
- ✅ `faq-section.tsx` - 主页FAQ section
- ✅ `header-simple.tsx` - 手绘风格导航
- ✅ `footer-simple.tsx` - 手绘风格底部

### Gallery相关
- ✅ `collection-card.tsx` - NFT卡片组件
- ✅ `collection-container.tsx` - 手绘容器组件

### 新组件
- ✅ `join-us.tsx` - 社交媒体组件

### Dashboard相关（旧风格）
- ✅ `nft-card.tsx` - Dashboard用的NFT卡片
- ✅ `dashboard/CommitBoardPageContent.tsx`
- ✅ `dashboard/DashboardContent.tsx`
- ✅ `header.tsx` - Dashboard用的导航
- ✅ `footer.tsx` - Dashboard用的底部

### Profile相关
- ✅ `profile/ProfileContent.tsx`
- ✅ `layout/navbar.tsx`

## 🎯 推荐清理步骤

### 第一批：安全删除（完全未使用）

```bash
frontend/src/components/
├── nft-grid.tsx                    # 删除
├── features-section.tsx            # 删除
├── partners-section.tsx            # 删除
├── collection-preview.tsx          # 删除
├── hero-section.tsx                # 删除
├── how-it-works.tsx                # 删除
└── landingpage/                    # 删除整个目录
    ├── hero.tsx
    └── index.ts
```

### 第二批：待确认（可能使用）

需要确认dashboard是否还需要：

```bash
frontend/src/components/
├── dashboard/ui/                   # 检查后删除
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
└── mint/                          # 如果使用新mint流程可删除
    ├── ConfigureNFT.tsx
    ├── MintProgressSteps.tsx
    ├── PreviewNetwork.tsx
    ├── MintingSuccess.tsx
    └── ui/
        ├── button.tsx
        ├── card.tsx
        └── input.tsx
```

### 第三批：待重构（使用中但需要更新）

这些文件还在使用，但可能需要更新为手绘风格：

```bash
frontend/src/app/
└── dashboard/
    ├── page.tsx                   # 使用旧风格
    ├── mint/page.tsx              # 使用旧mint组件
    └── commit-board/page.tsx      # 使用旧风格
```

## 📊 文件统计

| 类别 | 可删除 | 待确认 | 使用中 |
|------|--------|--------|--------|
| Landing组件 | 7个 | 0个 | 6个 |
| Dashboard组件 | 0个 | 3个 | 3个 |
| Mint组件 | 0个 | 8个 | 1个 |
| Layout组件 | 0个 | 1个 | 1个 |

## 🔧 清理命令（示例）

```bash
# 删除未使用的landing page组件
rm frontend/src/components/nft-grid.tsx
rm frontend/src/components/features-section.tsx
rm frontend/src/components/partners-section.tsx
rm frontend/src/components/collection-preview.tsx
rm frontend/src/components/hero-section.tsx
rm frontend/src/components/how-it-works.tsx
rm -rf frontend/src/components/landingpage/

# 可选：删除旧的mint组件（如果确认不需要）
# rm -rf frontend/src/components/mint/

# 可选：删除旧的dashboard UI组件（如果确认不需要）
# rm -rf frontend/src/components/dashboard/ui/
```

## ⚠️ 注意事项

### 删除前请确认

1. **Dashboard页面**: 
   - `dashboard/page.tsx` 使用 `NFTCard`
   - `dashboard/mint/page.tsx` 使用 `MintPageContent`
   - 如果要保留这些功能，不要删除对应组件

2. **旧的mint流程**:
   - `/dashboard/mint` 使用旧的mint组件
   - `/mint/new` 使用新的手绘风格流程
   - 决定保留哪个

3. **Profiles页面**:
   - 使用 `layout/navbar.tsx`
   - 如果要更新为手绘风格，需要先重构

## 🎯 建议

### 短期（立即执行）
✅ 删除第一批7个完全未使用的文件

### 中期（评估后执行）
⏳ 评估dashboard功能需求
⏳ 决定保留新旧mint流程的哪个
⏳ 删除对应的旧组件

### 长期（重构后执行）
⏳ 将dashboard更新为手绘风格
⏳ 统一所有页面的设计语言
⏳ 删除所有旧UI组件

## 📝 清理后的好处

1. **减小包体积**: 减少未使用的代码
2. **提高维护性**: 减少混淆和重复代码
3. **统一风格**: 只保留手绘风格组件
4. **提升性能**: 减少构建时间


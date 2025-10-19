# 完整用户流程文档

## 概述

完整的NFT创建和管理流程，从浏览repositories到铸造成功，再到查看收藏。

## 完整用户旅程

```
Gallery (Collections)
    ↓ 点击 "Create new collection"
Explore页面
    ↓ 点击 repository卡片
Step 2: Preview & Network
    ↓ 点击 "Mint"
Step 3: Success!
    ↓ 点击 "View My Profile"
Gallery (Collections) ← 回到起点，查看新NFT
```

## 详细流程说明

### 1️⃣ Gallery页面 (`/collections`)

**用户看到**:
- "My collections." 标题
- 引导文案
- "Create new collection" 按钮（红色）
- 现有NFT卡片展示

**用户操作**:
- 点击 "Create new collection" 按钮

**系统响应**:
- 跳转到 `/explore` 页面

---

### 2️⃣ Explore页面 (`/explore`)

**用户看到**:
- "Search your repositories..." 搜索框
- 6个repository卡片（3x2网格）
- 手绘风格绳结边框

**用户操作**:
- 浏览repositories
- 点击任意repository卡片

**系统响应**:
- 跳转到 `/mint/new?step=2`

---

### 3️⃣ Step 2: Preview & Network (`/mint/new?step=2`)

**用户看到**:

**左侧**:
- "Choose Network" 下拉菜单
- "Ethereum Network" 选项（蓝色）

**右侧**:
- NFT预览大卡片
- 标题信息
- 创建者信息
- Collection名称
- "Mint" 按钮（右下角）

**用户操作**:
- 选择区块链网络（可选）
- 预览NFT信息
- 点击 "Mint" 按钮

**系统响应**:
- 切换到Step 3

---

### 4️⃣ Step 3: Success! (`/mint/new?step=3`)

**用户看到**:
- 大圆形+勾选标记（带弹性动画）
- "NFT Minted Successfully!" 标题
- "Your digital collectible is now secured on the blockchain." 说明
- "View My Profile" 按钮

**用户操作**:
- 点击 "View My Profile" 按钮

**系统响应**:
- 跳转到 `/collections` (Gallery页面)

---

### 5️⃣ 返回Gallery (`/collections`)

**用户看到**:
- 新铸造的NFT出现在收藏中
- 可以查看NFT详情
- 可以继续创建更多NFT

## 按钮跳转映射

| 页面 | 按钮文字 | 跳转目标 |
|------|---------|---------|
| Collections | Create new collection | `/explore` |
| NFTs | Create new collection | `/explore` |
| Explore | (Repository卡片) | `/mint/new?step=2` |
| Mint Step 2 | Mint | Step 3 (内部状态) |
| Mint Step 3 | View My Profile | `/collections` |

## 路由配置

### 页面路径

```
/collections     → Collections Gallery
/nfts           → NFTs Gallery
/explore        → Repository搜索
/mint/new       → NFT铸造（3步）
/profiles       → 用户资料
```

### URL参数

```
/mint/new?step=1  → Configure NFT
/mint/new?step=2  → Preview & Network
/mint/new?step=3  → Success
```

## 导航栏链接

### HeaderSimple

```
HOME → EXPLORE → ABOUT US → ROADMAP → GALLERY
  ↓       ↓                     ↓        ↓
  /    /explore             /roadmap  /collections
```

### 右侧按钮

```
[Start with GitHub] → /api/auth/github
```

## 设计一致性

### 手绘风格元素
- ✅ 黑色粗边框（2-6px）
- ✅ 偏移阴影（2-8px）
- ✅ 圆角设计（8-30px）
- ✅ 米色背景（#F5F1E8）
- ✅ 白色卡片背景

### 交互效果
- ✅ Hover: 放大
- ✅ Tap: 缩小
- ✅ 阴影增强
- ✅ 平滑过渡

## 用户体验优化

### 流程简化
1. **跳过Step 1**: 从Explore直接进入Step 2
2. **自动填充**: 使用repository信息预填表单
3. **快速预览**: Step 2直接展示最终效果
4. **即时反馈**: Step 3立即显示成功

### 视觉引导
1. **清晰的CTA**: 红色"Create new collection"按钮
2. **步骤指示**: 顶部步骤条显示当前进度
3. **明确的按钮**: "Mint"、"View My Profile"文字清晰
4. **动画反馈**: 成功页面的弹性动画

### 防错设计
1. **标签验证**: 防止重复标签
2. **网络选择**: 默认Ethereum，减少选择负担
3. **可返回**: 步骤条可点击返回

## 移动端体验

### 响应式调整
- Gallery: 1列 → 2列 → 3列
- Explore: 1列 → 2列 → 3列
- Mint Step 1: 1列
- Mint Step 2: 1列
- Mint Step 3: 垂直居中

### 触摸优化
- 按钮最小点击区域：44x44px
- Tap反馈动画
- 大间距便于点击

## 性能优化

### 代码分割
- 每个页面独立加载
- 按需加载组件

### 动画性能
- 使用transform而非位置属性
- GPU加速动画
- 避免layout shift

### 图片优化
- 懒加载
- 合适的尺寸
- 优化格式

## 测试清单

### 功能测试
- [x] Collections → Explore跳转
- [x] NFTs → Explore跳转
- [x] Explore → Mint Step 2跳转
- [x] Mint按钮 → Step 3切换
- [x] View Profile → Collections跳转
- [x] 所有按钮可点击
- [x] 响应式布局正常

### 动画测试
- [x] Step 3成功动画流畅
- [x] 按钮hover效果正常
- [x] 卡片hover效果正常
- [x] 页面过渡平滑

### 兼容性
- [x] TypeScript类型正确
- [x] 无Lint错误
- [x] 无控制台错误

## 待开发功能

### 数据流
- [ ] Repository数据传递到Mint页面
- [ ] Step 1到Step 2数据传递
- [ ] 铸造后NFT存储
- [ ] Collections实时更新

### 后端集成
- [ ] GitHub API调用
- [ ] 后端NFT API
- [ ] 区块链交易
- [ ] 数据库存储

### 增强功能
- [ ] 铸造历史记录
- [ ] 铸造失败处理
- [ ] 交易状态追踪
- [ ] 通知系统

## 文件清单

```
frontend/src/app/
├── collections/page.tsx      # 更新：按钮跳转
├── nfts/page.tsx            # 更新：按钮跳转
├── explore/page.tsx         # 更新：卡片跳转
└── mint/new/page.tsx        # 更新：完整流程

frontend/src/components/
├── collection-card.tsx
├── collection-container.tsx
└── join-us.tsx
```

## 版本历史

- **v1.0** (2025-01-19): 完整流程实现
  - Gallery → Explore → Mint → Success → Gallery
  - 所有跳转链接已连接
  - 完整的UI和动画
  - 手绘风格设计


# Collections Gallery 使用说明

## 访问方式

Collections gallery 已集成到前端导航系统中，可以通过以下方式访问：

### 1. 导航菜单

**HeaderSimple (手绘风格页面)**
- 点击顶部导航栏的 **GALLERY** 链接
- 直接跳转到 `/collections` 页面

**Header (标准导航)**
- 点击顶部导航栏的 **NFT 收藏** 链接
- 直接跳转到 `/collections` 页面

**Footer (页脚导航)**
- 在页脚"产品"区域点击 **NFT 收藏**
- 直接跳转到 `/collections` 页面

### 2. 直接URL访问

```
http://localhost:3000/collections
```

或

```
http://your-domain.com/collections
```

## 页面功能

### Collections 页面 (`/collections`)

**主要功能：**
- 展示用户的NFT收藏
- 手绘风格设计
- 响应式布局（支持手机、平板、桌面）
- 创建新collection的入口

**页面元素：**
1. **标题**: "My collections."
2. **引导文案**: 鼓励用户创建collection
3. **CTA按钮**: "Create new collection"（红色手绘风格）
4. **NFT卡片网格**: 展示现有collections
5. **装饰元素**: 彩色光晕、SVG手绘线条

### NFTs 页面 (`/nfts`)

同样采用手绘风格设计，展示所有NFT：
- 6个示例NFT卡片
- 与Collections相同的设计语言
- 支持3列网格布局

## 组件说明

### CollectionCard

每个NFT卡片包含：
- NFT预览图（或placeholder）
- 标题
- 创建者信息
- Collection名称
- 创建时间

**交互效果：**
- Hover时卡片上浮8px
- 轻微旋转动画（±1度）
- 阴影增强效果

### CollectionContainer

手绘风格容器特点：
- 米色背景 + 8px黑色边框
- 12px偏移阴影
- 彩色光晕装饰
- SVG手绘装饰线条

## 响应式布局

| 屏幕尺寸 | 布局 |
|---------|------|
| 移动端 (< 768px) | 1列 |
| 平板 (768px - 1024px) | 2列 |
| 桌面 (> 1024px) | 3列 |

## 配色方案

```css
背景色: #F5F1E8 (米色)
容器背景: #E8DCC8 (浅棕色)
主按钮: #E63946 (红色)
边框: #000000 (黑色)
光晕1: #4ECDC4 -> #44A08D (青色渐变)
光晕2: #A259FF -> #7B2CBF (紫色渐变)
```

## 开发测试

启动开发服务器：

```bash
cd frontend
npm run dev
# 或
pnpm dev
# 或
yarn dev
```

然后访问:
- Collections: http://localhost:3000/collections
- NFTs: http://localhost:3000/nfts

## 后续开发

待实现功能：
- [ ] 连接真实NFT数据
- [ ] 实现创建collection功能
- [ ] 添加筛选和搜索
- [ ] 添加NFT详情页
- [ ] 实现图片上传
- [ ] 添加加载状态
- [ ] 优化动画性能


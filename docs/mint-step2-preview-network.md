# Mint Step 2: Preview & Network 文档

## 概述

实现了NFT铸造流程的第二步"Preview & Network"界面，用户可以选择区块链网络并预览NFT。

## 用户流程

### 从Explore进入
1. 用户在Explore页面浏览repositories
2. 点击任意repository卡片
3. 自动跳转到Preview & Network界面（Step 2）
4. 跳过Step 1（配置界面）

### URL参数
```
/mint/new?step=2
```

## 页面设计

### 布局结构

**左侧：网络选择区域**
- Choose Network下拉菜单
- Ethereum Network选项（蓝色高亮）

**右侧：NFT预览卡片**
- NFT图片预览区域
- 标题信息
- 创建者信息
- Collection名称
- Mint按钮（右下角）

## 左侧：网络选择

### Choose Network 下拉菜单

**默认状态**:
```css
background: white
border: 3px solid black
border-radius: 16px
padding: 16px 24px
box-shadow: 3px 3px 0px 0px rgba(0,0,0,0.8)
```

**下拉选项**:
- Ethereum Network
- 更多网络可扩展

### Ethereum Network 显示

**选中状态**:
```css
background: #3B82F6 (蓝色)
color: white
border: 3px solid black
border-radius: 16px
box-shadow: 3px 3px 0px 0px rgba(0,0,0,0.8)
```

**图标**:
- 圆形蓝色背景
- Ethereum logo（白色SVG）

## 右侧：NFT预览卡片

### 卡片容器

**样式**:
```css
background: white
border: 5px solid black
border-radius: 30px
padding: 24px
min-height: 600px
box-shadow: 8px 8px 0px 0px rgba(0,0,0,1)
position: relative
```

### NFT图片区域

**比例**: 3:4（纵向）

**Placeholder样式**:
- 对角线斜纹背景
- 半透明纹理
- 居中"NFT Preview"文字

### 信息区域

**头像**:
- 圆形，48px
- 蓝色背景
- "LC"文字（白色粗体）

**标题**:
- 来自Step 1的输入
- 如果为空，显示默认值
- 最多2行，超出省略
- 字体：14px，medium

**创建者**:
- 格式："Creator: 0xAbc, EFG"
- 字体：12px，灰色

**时间**:
- 格式："5m ago"
- 位置：右上角
- 字体：12px，灰色

**Collection**:
- 格式："Collection: **Astral Arcana**"
- Collection名称加粗

### Mint按钮

**位置**: 卡片右下角（绝对定位）

**样式**:
```css
background: black
color: white
padding: 12px 32px
border-radius: 9999px (rounded-full)
font-weight: bold
font-size: 16px
box-shadow: 3px 3px 0px 0px rgba(0,0,0,0.5)
```

**Hover效果**:
```css
box-shadow: 4px 4px 0px 0px rgba(0,0,0,0.5)
transform: translate(-1px, -1px)
transition: all 200ms
```

**点击行为**:
- 跳转到Step 3（Minting...）

## 技术实现

### URL参数处理

```tsx
const searchParams = useSearchParams();
const initialStep = parseInt(searchParams.get('step') || '1');
const [currentStep, setCurrentStep] = useState(initialStep);
```

### 网络选择状态

```tsx
const [selectedNetwork, setSelectedNetwork] = useState('Ethereum Network');
const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
```

### 下拉菜单交互

```tsx
<button onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}>
  Choose Network
</button>

{showNetworkDropdown && (
  <div className="dropdown">
    <button onClick={() => {
      setSelectedNetwork('Ethereum Network');
      setShowNetworkDropdown(false);
    }}>
      Ethereum Network
    </button>
  </div>
)}
```

### 标题显示

```tsx
<h3>
  {title || 'FEAT: IMPLEMENT USER AUTHENTICATION AND DARK MODE'}
</h3>
```

## 响应式设计

### 桌面端 (≥1024px)
- 左右两栏布局
- 左侧：网络选择
- 右侧：NFT预览

### 平板/移动端 (<1024px)
- 单列布局
- 网络选择在上
- NFT预览在下

## 配色方案

```css
页面背景: #F5F1E8 (米色)
卡片背景: #FFFFFF (白色)
边框: #000000 (黑色)
蓝色主题: #3B82F6 (Ethereum)
文字-主: #1F2937 (深灰)
文字-辅: #6B7280 (灰色)
按钮: #000000 (黑色)
阴影: rgba(0,0,0,0.8)
```

## Ethereum Logo SVG

```svg
<path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003z
         M12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
```

## 交互流程

### 1. 选择网络
```
点击"Choose Network"
  ↓
显示下拉菜单
  ↓
点击"Ethereum Network"
  ↓
关闭菜单，显示选中状态
```

### 2. 预览NFT
```
查看NFT图片预览
  ↓
确认标题和信息
  ↓
点击"Mint"按钮
  ↓
进入Step 3（铸造中）
```

## 待扩展功能

### 网络选项
- [ ] Polygon Network
- [ ] Optimism Network
- [ ] Arbitrum Network
- [ ] Base Network
- [ ] 自定义网络

### NFT预览
- [ ] 真实图片显示
- [ ] 动态属性预览
- [ ] 稀有度显示
- [ ] 元数据完整预览

### Gas费用
- [ ] 实时Gas估算
- [ ] 网络拥堵提示
- [ ] 费用对比

### 钱包集成
- [ ] 钱包连接状态
- [ ] 余额检查
- [ ] 网络自动切换

## 测试清单

- [x] Explore跳转正常
- [x] URL参数生效
- [x] 网络下拉菜单正常
- [x] 网络选择正常
- [x] NFT预览显示正常
- [x] Mint按钮可点击
- [x] 步骤切换正常
- [x] 响应式布局正常
- [x] 无Lint错误
- [ ] 多网络支持
- [ ] 实际铸造测试

## 文件位置

```
frontend/src/app/
├── explore/
│   └── page.tsx          # 更新：跳转到step=2
└── mint/
    └── new/
        └── page.tsx      # 更新：Step 2实现
```

## 版本历史

- **v1.0** (2025-01-19): Step 2初始实现
  - 网络选择下拉菜单
  - Ethereum Network支持
  - NFT预览卡片
  - Mint按钮
  - URL参数支持
  - 从Explore直接进入


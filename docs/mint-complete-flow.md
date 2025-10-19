# NFT Mint 完整流程文档

## 概述

实现了完整的三步NFT铸造流程，包括配置、预览选择网络、铸造成功页面。

## 完整流程

```
Explore页面
    ↓ (点击repository卡片)
Step 2: Preview & Network
    ↓ (点击Mint按钮)
Step 3: Minting Successfully!
    ↓ (点击View My Profile)
Profiles页面
```

## 三个步骤详解

### Step 1: Configure NFT

**功能**: 配置NFT元数据

**左侧表单**:
- NFT Title输入框
- Description文本框（带图标区域）
- Tags标签管理系统

**右侧预览**:
- 正方形NFT预览框
- 矩形内容预览框

**访问方式**: `/mint/new` 或 `/mint/new?step=1`

### Step 2: Preview & Network

**功能**: 选择网络并预览NFT

**左侧**:
- Choose Network下拉菜单
- Ethereum Network选项（蓝色显示）

**右侧**:
- NFT预览大卡片
- 标题和创建者信息
- Collection名称
- Mint按钮（右下角）

**访问方式**: 
- 从Explore点击卡片自动进入
- `/mint/new?step=2`

### Step 3: Minting Successfully! ✅

**功能**: 铸造成功确认页面

**设计元素**:

#### 1. 成功图标
- 大圆形（192px）
- 6px黑色边框
- 白色背景
- 8px偏移阴影
- 中心大勾选标记（Check图标）
- 弹性动画效果

#### 2. 标题
- "NFT Minted Successfully!"
- 字体：4xl-5xl，黑体
- 淡入+上移动画

#### 3. 说明文字
- "Your digital collectible is now secured on the blockchain."
- 字体：lg，灰色
- 淡入+上移动画

#### 4. 按钮
- "View My Profile"
- 白色背景
- 3px黑色边框
- 4px偏移阴影
- 点击跳转到Profiles页面

**访问方式**: `/mint/new?step=3`

## 步骤导航按钮

### 按钮状态

**当前步骤**:
```css
background: black
color: white
border: 3px solid black
box-shadow: 3px 3px 0px 0px rgba(0,0,0,1)
```

**其他步骤**:
```css
background: white
color: black
border: 3px solid black
box-shadow: 2px 2px 0px 0px rgba(0,0,0,0.3)
hover: 3px 3px 0px 0px rgba(0,0,0,0.5)
```

### 按钮文字
1. "1.Configure NFT"
2. "2.Preview & Network"
3. "3.Minting......"

## Step 3: 详细设计

### 成功图标动画

**初始状态**: scale(0)  
**最终状态**: scale(1)  
**动画类型**: spring（弹性效果）  
**持续时间**: 0.5s

```tsx
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ duration: 0.5, type: "spring" }}
>
  <Check className="w-24 h-24" strokeWidth={4} />
</motion.div>
```

### 文字动画

**标题**:
- 延迟：0.3s
- 效果：淡入 + 上移

**说明**:
- 延迟：0.5s
- 效果：淡入 + 上移

**按钮**:
- 延迟：0.7s
- 效果：淡入 + 上移

### 按钮样式

```css
padding: 16px 48px
background: white
border: 3px solid black
border-radius: 16px
font-weight: bold
font-size: 18px
box-shadow: 4px 4px 0px 0px rgba(0,0,0,0.8)
```

**Hover效果**:
```css
background: rgba(249, 250, 251, 1)
transition: colors 200ms
```

## 配色方案

### Step 3专用色彩

```css
背景: #F5F1E8 (米色)
圆形背景: #FFFFFF (白色)
圆形边框: #000000 (黑色，6px)
勾选图标: #000000 (黑色，粗线条)
标题文字: #000000 (黑色)
说明文字: #6B7280 (灰色)
按钮背景: #FFFFFF (白色)
按钮边框: #000000 (黑色)
阴影: rgba(0,0,0,0.8)
```

## 技术实现

### 路由跳转

```tsx
const router = useRouter();

// Mint按钮 (Step 2 → Step 3)
onClick={() => setCurrentStep(3)}

// View My Profile按钮 (Step 3 → Profiles)
onClick={() => router.push('/profiles')}
```

### URL参数控制

```tsx
const searchParams = useSearchParams();
const initialStep = parseInt(searchParams.get('step') || '1');
const [currentStep, setCurrentStep] = useState(initialStep);
```

### 动画序列

1. **圆形图标**: 立即开始，弹性动画
2. **标题**: 延迟0.3s，淡入上移
3. **说明**: 延迟0.5s，淡入上移
4. **按钮**: 延迟0.7s，淡入上移

## 完整用户流程

### 1. 浏览Repositories
- 访问 `/explore`
- 搜索或浏览6个repository卡片

### 2. 选择Repository
- 点击任意卡片
- 跳转到 `/mint/new?step=2`

### 3. 预览和选择网络
- 查看NFT预览
- 选择区块链网络（默认Ethereum）
- 点击"Mint"按钮

### 4. 铸造成功
- 显示成功动画
- 查看成功消息
- 点击"View My Profile"
- 跳转到个人资料页面

## 响应式设计

### Step 3响应式

| 屏幕尺寸 | 圆形尺寸 | 标题尺寸 | 按钮宽度 |
|---------|---------|---------|---------|
| 移动端 (<768px) | 192px | 4xl | 自适应 |
| 桌面端 (≥768px) | 192px | 5xl | 自适应 |

### 居中布局
- 使用flexbox垂直居中
- 最大宽度2xl
- 所有元素居中对齐

## 手绘风格特点

### Step 3特有元素
- ✅ 大圆形带勾选标记
- ✅ 粗黑色边框（6px）
- ✅ 大偏移阴影（8px）
- ✅ 弹性动画效果
- ✅ 分阶段淡入动画

### 与整体设计一致
- ✅ 黑色边框系统
- ✅ 偏移阴影效果
- ✅ 米色背景
- ✅ 圆角设计
- ✅ 简洁清晰

## 测试清单

### Step 1
- [x] 表单输入正常
- [x] 标签添加/删除正常
- [x] 预览框显示正常

### Step 2
- [x] 从Explore跳转正常
- [x] URL参数生效
- [x] 网络选择正常
- [x] NFT预览显示正常
- [x] Mint按钮跳转正常

### Step 3
- [x] 成功动画流畅
- [x] 文字依次淡入
- [x] 按钮可点击
- [x] 跳转到Profiles正常
- [x] 响应式设计正常

### 整体
- [x] 步骤切换正常
- [x] URL参数控制正常
- [x] 无Lint错误
- [x] 手绘风格一致

## 文件位置

```
frontend/src/app/
├── explore/
│   └── page.tsx           # 点击跳转到step=2
└── mint/
    └── new/
        └── page.tsx       # 完整三步流程
```

## 后续优化

### 功能增强
- [ ] Step 1数据传递到Step 2
- [ ] 实际区块链铸造
- [ ] 交易哈希显示
- [ ] 错误处理
- [ ] 加载状态

### 动画优化
- [ ] Step 2 Mint按钮加载动画
- [ ] Step 3 Confetti庆祝效果
- [ ] 进度条动画
- [ ] 骨架屏

### 数据集成
- [ ] GitHub API集成
- [ ] 后端API调用
- [ ] 钱包连接
- [ ] 交易签名
- [ ] NFT元数据上传

## 版本历史

- **v1.0** (2025-01-19): 完整三步流程实现
  - Step 1: Configure NFT
  - Step 2: Preview & Network
  - Step 3: Minting Successfully
  - URL参数支持
  - 手绘风格设计
  - 完整动画效果


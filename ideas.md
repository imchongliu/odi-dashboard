# China ODI Dashboard - 设计理念探索

## 项目背景
这是一个面向商业决策者的中国企业海外直接投资(ODI)数据展示网站，需要呈现专业、可信、数据驱动的形象。

---

<response>
## <idea> 方案一：Swiss Precision (瑞士精准主义)

### Design Movement
**International Typographic Style (国际主义排版风格)** - 源自瑞士设计学派，强调数学网格、清晰层次和信息优先。

### Core Principles
1. **Grid Dominance** - 严格的12列网格系统，所有元素对齐到网格
2. **Type as Structure** - 用字体大小和粗细建立视觉层次，而非装饰元素
3. **Negative Space as Content** - 留白是设计的一部分，不是空白
4. **Objective Clarity** - 数据可视化追求精确而非炫技

### Color Philosophy
- **Primary**: `#0A0A0A` (近黑) - 权威、专业
- **Accent**: `#2563EB` (Royal Blue) - 信任、稳定
- **Success**: `#059669` (Emerald) - 增长、正向
- **Warning**: `#DC2626` (Red) - 风险、警示
- **Surface**: `#FAFAFA` (Off-white) - 干净、现代
- **Border**: `#E5E5E5` (Light Gray) - 微妙分隔

### Layout Paradigm
- 左侧固定导航栏(240px)，右侧内容区
- 内容区采用卡片网格布局，卡片之间16px间距
- 表格采用斑马纹设计，行高48px保证可读性
- 图表区域固定高度，保持页面节奏感

### Signature Elements
1. **Monospace Numbers** - 所有数字使用等宽字体，便于对齐比较
2. **Thin Dividers** - 1px细线分隔，不使用阴影
3. **Status Pills** - 圆角药丸形状的状态标签

### Interaction Philosophy
- 悬停时背景色微变(opacity变化)，无缩放
- 点击反馈即时，无延迟动画
- 表格行悬停高亮，明确可点击区域

### Animation
- 页面切换: 无动画，即时切换
- 数据加载: 骨架屏，线性渐显
- 图表: 数据点从底部升起，duration 400ms, ease-out

### Typography System
- **Display**: Inter Bold 32px/40px
- **Heading**: Inter Semibold 24px/32px
- **Subheading**: Inter Medium 18px/28px
- **Body**: Inter Regular 14px/24px
- **Caption**: Inter Regular 12px/16px
- **Data**: JetBrains Mono 14px (数字专用)

</idea>
<probability>0.08</probability>
</response>

---

<response>
## <idea> 方案二：Data Cartography (数据制图学)

### Design Movement
**Information Design + Cartographic Aesthetics** - 结合Edward Tufte的数据可视化理论与地图制图的视觉语言。

### Core Principles
1. **Data-Ink Ratio** - 最大化数据墨水比，删除一切非必要装饰
2. **Layered Information** - 信息分层呈现，从概览到细节
3. **Contextual Density** - 高信息密度但不杂乱
4. **Geographic Narrative** - 用地理视角讲述投资故事

### Color Philosophy
- **Base**: `#1E293B` (Slate 800) - 深色背景如夜间地图
- **Surface**: `#334155` (Slate 700) - 卡片背景
- **Text**: `#F8FAFC` (Slate 50) - 高对比文字
- **Data Blue**: `#38BDF8` (Sky 400) - 数据点、连线
- **Data Green**: `#4ADE80` (Green 400) - 正向指标
- **Data Amber**: `#FBBF24` (Amber 400) - 中性/待定
- **Data Red**: `#F87171` (Red 400) - 负向/风险

### Layout Paradigm
- 顶部导航，内容区全宽
- 首页采用仪表盘布局：左侧大地图/主图表，右侧统计卡片堆叠
- 数据表格采用紧凑设计，行高36px
- 图表与表格交替布局，形成阅读节奏

### Signature Elements
1. **Contour Lines** - 等高线风格的背景纹理
2. **Coordinate Grid** - 图表背景使用经纬网格风格
3. **Legend Blocks** - 图例采用地图图例的块状设计

### Interaction Philosophy
- 悬停显示详细tooltip，带箭头指向
- 图表元素悬停时发光效果(glow)
- 表格行悬停时左侧出现蓝色指示条

### Animation
- 页面切换: 内容区淡入淡出，duration 200ms
- 数据加载: 脉冲动画(pulse)
- 图表: 数据点依次点亮，如星图显现，stagger 50ms
- 数字变化: 数字滚动动画

### Typography System
- **Display**: Space Grotesk Bold 36px/44px
- **Heading**: Space Grotesk Semibold 24px/32px
- **Subheading**: Space Grotesk Medium 16px/24px
- **Body**: Inter Regular 14px/22px
- **Caption**: Inter Regular 11px/16px
- **Data**: IBM Plex Mono 13px (数字专用)

</idea>
<probability>0.06</probability>
</response>

---

<response>
## <idea> 方案三：Executive Clarity (高管清晰度)

### Design Movement
**Corporate Modernism + Financial Terminal Aesthetics** - 融合彭博终端的信息密度与现代企业设计的优雅。

### Core Principles
1. **Scannable Hierarchy** - 高管3秒内能抓住关键数据
2. **Confidence Through Restraint** - 克制的设计传递专业信心
3. **Action-Oriented Layout** - 每个区块都有明确的行动指向
4. **Comparative Context** - 数据永远有参照系

### Color Philosophy
- **Background**: `#FFFFFF` (Pure White) - 干净、开放
- **Surface**: `#F8FAFC` (Slate 50) - 卡片背景
- **Primary**: `#0F172A` (Slate 900) - 主文字
- **Secondary**: `#64748B` (Slate 500) - 次要文字
- **Accent**: `#3B82F6` (Blue 500) - 交互元素
- **M&A Color**: `#8B5CF6` (Violet 500) - M&A类型标识
- **Greenfield Color**: `#10B981` (Emerald 500) - Greenfield类型标识
- **Border**: `#E2E8F0` (Slate 200) - 边框

### Layout Paradigm
- 顶部导航 + 面包屑，清晰的位置感知
- 首页：顶部KPI卡片带(4列)，下方双列图表，底部数据表格
- 列表页：左侧筛选面板(可折叠)，右侧数据表格
- 详情页：左右分栏，左侧基本信息，右侧交易详情

### Signature Elements
1. **KPI Cards with Trend** - 数字卡片带迷你趋势线
2. **Type Badges** - M&A紫色徽章，Greenfield绿色徽章
3. **Data Completeness Indicator** - 数据完整度进度条

### Interaction Philosophy
- 卡片悬停时微微上浮(translateY -2px)，阴影加深
- 表格行悬停时整行背景变色
- 按钮点击时有按压效果(scale 0.98)
- 筛选器选中时有勾选动画

### Animation
- 页面切换: 内容区从右侧滑入，duration 250ms, ease-out
- 数据加载: 骨架屏 + 内容淡入
- 图表: 柱状图从底部生长，折线图从左到右绘制，duration 600ms
- 数字: 计数器动画，从0增长到目标值

### Typography System
- **Display**: Plus Jakarta Sans Bold 32px/40px
- **Heading**: Plus Jakarta Sans Semibold 22px/30px
- **Subheading**: Plus Jakarta Sans Medium 16px/24px
- **Body**: Plus Jakarta Sans Regular 14px/22px
- **Caption**: Plus Jakarta Sans Regular 12px/18px
- **Data**: Tabular Nums (Plus Jakarta Sans内置)

</idea>
<probability>0.07</probability>
</response>

---

## 选定方案

**选择方案三：Executive Clarity (高管清晰度)**

### 选择理由
1. **目标用户匹配** - 面向商业决策者，需要快速获取关键信息
2. **数据类型适配** - M&A和Greenfield的颜色区分清晰直观
3. **专业可信** - 白色背景传递开放透明，符合金融数据展示惯例
4. **可扩展性** - 布局结构清晰，便于后续功能扩展
5. **技术可行性** - 动画效果适中，不影响性能

### 实施要点
- 使用Plus Jakarta Sans作为主字体
- M&A类型使用紫色(#8B5CF6)，Greenfield使用绿色(#10B981)
- 卡片采用微阴影设计，悬停时阴影加深
- 图表使用Recharts，配色与整体设计统一
- 表格行高44px，保证数据可读性

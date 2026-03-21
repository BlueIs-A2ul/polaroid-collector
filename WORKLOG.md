# 工作日志

本文档记录项目的开发进度和重要变更，供 AI 助手在每次开始工作时阅读，了解项目当前状态。

## 2026-03-21 开发记录（续六）

### 新增功能

1. **偶像个人报告**
   - 类似年度报告风格，滑动卡片展示
   - 包含 7 个页面：封面、总览、花费、拍摄习惯、常去地点、月度趋势、结尾
   - 统计数据：拍摄数量、花费、最爱拍摄日、拍摄频率等
   - 支持花费分析（平均单价、最贵记录）

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/services/idolReportService.ts` | 新增 | 偶像报告数据计算服务 |
| `src/screens/IdolReportScreen.tsx` | 新增 | 偶像报告展示页面 |
| `src/screens/DetailScreen.tsx` | 修改 | 添加偶像报告入口按钮 |
| `src/navigation/AppNavigator.tsx` | 修改 | 添加偶像报告路由 |

---

## 2026-03-21 开发记录（续五）

### 新增功能

1. **年度报告**
   - 类似网易云年度报告风格，滑动卡片展示
   - 包含 8 个页面：封面、总览、花费、最爱偶像、常去城市、常去场馆、月度分布、结尾
   - 统计数据：拍摄数量、花费、新增偶像、拍摄天数、最爱的日子等
   - 支持多年份切换查看
   - 完全基于本地数据计算

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/services/reportService.ts` | 新增 | 年度报告数据计算服务 |
| `src/screens/YearlyReportScreen.tsx` | 新增 | 年度报告展示页面 |
| `src/screens/YearlyReportEntryScreen.tsx` | 新增 | 年度报告入口页面 |
| `src/screens/StatisticsScreen.tsx` | 修改 | 添加年度报告入口卡片 |
| `src/navigation/AppNavigator.tsx` | 修改 | 添加年度报告路由 |

---

## 2026-03-21 开发记录（续四）

### 新增功能

1. **统计页面排行切换**
   - 偶像排行支持"数量排行"和"花费排行"两种模式
   - Tab 切换显示不同维度数据
   - 花费排行自动过滤无花费记录的偶像

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/screens/StatisticsScreen.tsx` | 修改 | 添加排行 Tab 切换功能 |

---

## 2026-03-21 开发记录（续三）

### 新增功能

1. **分享卡片生成**
   - 偶像详情页添加分享入口（右上角分享图标）
   - 生成精美分享卡片，包含偶像头像、统计信息、近期照片
   - 支持分享到社交媒体或保存到相册
   - 卡片设计：主题色头部、照片网格、应用水印

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/components/features/ShareCard.tsx` | 新增 | 分享卡片组件 |
| `src/services/shareService.ts` | 新增 | 分享服务（截图+分享） |
| `src/screens/DetailScreen.tsx` | 修改 | 添加分享入口和分享弹窗 |
| `package.json` | 修改 | 添加 react-native-view-shot 依赖 |

---

## 2026-03-21 开发记录（续二）

### 新增功能

1. **主题管理功能**
   - 支持 6 套预设主题：经典棕、海洋蓝、樱花粉、森林绿、薰衣草、日落橙
   - 主题设置页面，可一键切换主题
   - 主题配置持久化存储
   - 架构预留自定义主题扩展能力

2. **主题自定义调整**
   - 支持调整色相偏移（-180° ~ +180°）
   - 支持调整饱和度（-50% ~ +50%）
   - 支持调整亮度（-30% ~ +30%）
   - 实时预览调整效果
   - 一键重置为默认值

### 架构变更

1. **主题系统架构**
   - 新增 `ThemeContext` 和 `useTheme` hook 提供全局主题状态
   - 所有组件改用 `useTheme()` 获取动态主题颜色
   - 预设主题定义在 `constants/themes.ts`
   - 主题存储服务 `themeService.ts`
   - 颜色处理工具 `utils/colorUtils.ts`（HEX/HSL 转换、调整）

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/types/theme.ts` | 新增 | 主题类型定义 |
| `src/constants/themes.ts` | 新增 | 预设主题常量 |
| `src/constants/storageKeys.ts` | 修改 | 添加 THEME 存储键 |
| `src/services/themeService.ts` | 新增 | 主题存储服务 |
| `src/contexts/ThemeContext.tsx` | 新增 | 主题 Context 和 Hook |
| `src/screens/ThemeSettingsScreen.tsx` | 新增 | 主题设置页面 |
| `src/utils/colorUtils.ts` | 新增 | 颜色处理工具函数 |
| `App.tsx` | 修改 | 包装 ThemeProvider |
| `src/navigation/AppNavigator.tsx` | 修改 | 动态主题色、添加主题设置路由 |
| `src/screens/HomeScreen.tsx` | 修改 | 使用 useTheme、添加主题设置入口 |
| `src/screens/*.tsx` | 修改 | 所有 Screen 使用 useTheme |
| `src/components/**/*.tsx` | 修改 | 所有组件使用 useTheme |
| `src/constants/themeColors.ts` | 废弃 | 由 themes.ts 替代 |
| `package.json` | 修改 | 添加 @react-native-community/slider |

---

## 2026-03-21 开发记录（续）

### 新增功能

1. **花费趋势图表**
   - 统计页面新增花费趋势区块
   - 展示近 6 个月的月度花费柱状图
   - 显示总花费和月均花费统计
   - 使用纯 View 样式实现，无需额外图表库
   - 无花费记录时显示空状态提示

### 修复问题

1. **日历组件样式问题**
   - 问题：使用固定像素计算单元格宽度，在不同屏幕尺寸下布局错乱
   - 解决：改用百分比宽度（14.28%）和 aspectRatio，确保 7 列正确排列

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/types/index.ts` | 修改 | 添加 MonthlySpending 类型 |
| `src/services/recordService.ts` | 修改 | 添加 getMonthlySpending 函数 |
| `src/components/common/SpendingChart.tsx` | 新增 | 花费趋势柱状图组件 |
| `src/screens/StatisticsScreen.tsx` | 修改 | 集成花费趋势图表 |
| `src/components/features/Calendar.tsx` | 修改 | 修复单元格宽度使用百分比 |

---

## 2026-03-21 开发记录

### 新增功能

1. **同日记录批量编辑功能**
   - 在偶像详情页的每个日期分组上添加"编辑本日"按钮
   - 点击后打开批量编辑 Modal，可一次性修改该日期所有记录的团体、城市、场馆字段
   - 支持从历史记录中选择字段值（复用 FieldHistorySelector 组件）
   - 显示将更新的记录数量
   - 保存后自动刷新列表

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/screens/DetailScreen.tsx` | 修改 | 添加批量编辑 Modal UI 和相关逻辑 |

---

## 2026-03-20 开发记录（续）

### 新增功能

1. **照片备注功能**
   - 每条记录可添加备注信息（选填）
   - 上传页面：每张照片可输入备注
   - 编辑页面：支持编辑备注
   - 详情页面：全屏模式显示备注
   - 数据结构：`PolaroidRecord` 添加 `note?: string`

2. **照片缓存优化**
   - 安装 `expo-image` 包
   - 创建 `CachedImage` 组件，支持内存和磁盘缓存
   - 在 DetailScreen、IdolCard 中使用 CachedImage
   - 添加加载过渡效果，提升用户体验

3. **统计页面**
   - 创建独立的 StatisticsScreen 页面
   - 首页统计区域可点击进入统计页面
   - 展示总拍立得数、偶像数、总花费概览
   - 偶像占比排行，带进度条可视化
   - 点击偶像可跳转到详情页

4. **拍立得上传扩展字段**
   - 团体 (groupName): 小偶像所属团体
   - 城市 (city): 拍摄城市
   - 场馆 (venue): 拍摄场馆
   - 拍立得类型 (polaroidType): 无签、带签、主题、宿题或自定义
   - 拍立得人数 (memberCount): 单人、双人、团切或自定义
   - 创建 OptionsSelector 组件：支持预设选项和自定义输入

5. **扩展字段历史记录**
   - 团体、城市、场馆字段支持历史记录选择
   - 创建 fieldHistoryService 管理字段历史
   - 创建 FieldHistorySelector 组件显示历史记录
   - 自动保存用户输入，最多保留 20 条历史
   - 点击字段可快速选择历史记录或输入新值

6. **扩展字段统计概览**
   - 统计页面新增团体统计区块
   - 统计页面新增城市统计区块
   - 统计页面新增场馆统计区块
   - 按次数排序，显示百分比占比
   - 无数据时显示空状态提示

7. **日历视图**
   - 创建 Calendar 组件，支持月份切换
   - 标记有拍摄记录的日期并显示数量
   - 创建 CalendarScreen 页面，展示拍摄日历
   - 点击日期查看当天拍摄记录
   - 首页添加日历快捷入口

8. **高级筛选**
   - 创建 AdvancedFilter 组件
   - 支持按团体、城市、场馆、拍立得类型筛选
   - 多条件组合筛选
   - 筛选状态高亮显示
   - 一键清除所有筛选条件

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/types/index.ts` | 修改 | 添加 note、扩展字段、FieldStat 类型 |
| `src/constants/polaroidOptions.ts` | 新增 | 预设选项常量 |
| `src/constants/storageKeys.ts` | 修改 | 添加 FIELD_HISTORY 键 |
| `src/components/common/OptionsSelector.tsx` | 新增 | 选择器组件 |
| `src/components/features/FieldHistorySelector.tsx` | 新增 | 字段历史选择器 |
| `src/components/features/Calendar.tsx` | 新增 | 日历组件 |
| `src/components/features/AdvancedFilter.tsx` | 新增 | 高级筛选组件 |
| `src/services/fieldHistoryService.ts` | 新增 | 字段历史管理服务 |
| `src/screens/UploadScreen.tsx` | 修改 | 支持输入备注、扩展字段、历史选择 |
| `src/screens/EditScreen.tsx` | 修改 | 支持编辑备注、扩展字段、历史选择 |
| `src/screens/DetailScreen.tsx` | 修改 | 显示备注、扩展信息、使用 CachedImage |
| `src/screens/StatisticsScreen.tsx` | 新增 | 统计页面（含扩展字段统计） |
| `src/screens/CalendarScreen.tsx` | 新增 | 日历视图页面 |
| `src/screens/HomeScreen.tsx` | 修改 | 添加日历入口、高级筛选 |
| `src/navigation/AppNavigator.tsx` | 修改 | 添加 Statistics、Calendar 路由 |
| `src/components/features/IdolCard.tsx` | 修改 | 使用 CachedImage |
| `src/components/common/CachedImage.tsx` | 新增 | 缓存图片组件 |
| `src/services/recordService.ts` | 修改 | 计算扩展字段统计 |
| `package.json` | 修改 | 添加 expo-image 依赖 |

---

## 2026-03-20 开发记录

### 修复问题

1. **偶像选择器列表显示问题**
   - 问题：`listContainer` 使用 `flex: 1` 但父容器没有明确高度，导致 FlatList 高度为 0
   - 解决：改为 `maxHeight: 400` 让列表有固定高度约束

2. **首页无限刷新问题**
   - 问题：`useRecords` hook 中 `refreshAll` 函数每次渲染都会创建新引用，导致 `useFocusEffect` 无限循环
   - 解决：使用 `useCallback` 包装所有函数，稳定引用

3. **首页上传按钮样式问题**
   - 问题：按钮背景白色，图标也是白色，看起来像白色实心圆
   - 解决：移除按钮背景，保持与头部其他按钮样式一致

4. **全屏照片显示问题**
   - 问题：点击网格照片后 Modal 显示纯黑
   - 解决：添加 `statusBarTranslucent`、图片容器包装、背景色

### 新增功能

1. **背签照片功能**
   - 每张照片可选添加背签照片（偶像在拍立得背面签字/画画）
   - 上传页面：每张照片旁有"添加背签"按钮
   - 详情页面：点击照片可全屏查看，支持切换正面/背签
   - 编辑页面：支持添加/更换/删除背签
   - 数据结构：`PolaroidRecord` 添加 `backPhotoUri?: string`

2. **偶像头像功能**
   - 从相册选择偶像头像
   - 用户可选择是否裁切为正方形
   - 首页偶像卡片显示头像
   - 详情页可设置/更换/移除头像
   - 新增 `avatarService` 管理头像存储

3. **花费记录功能**
   - 每条记录可添加价格（选填）
   - 首页统计显示总花费
   - 详情页显示偶像总花费和每条记录价格
   - 数据结构：
     - `PolaroidRecord` 添加 `price?: number`
     - `RankingItem` 添加 `totalPrice: number`
     - `IdolDetail` 添加 `totalPrice: number`
     - `Statistics` 添加 `totalPrice: number`

4. **记录列表按日期分组展示**
   - 同一天的记录合并显示在同一个卡片内
   - 照片以网格布局展示（约3列）
   - 每个日期组显示总照片数和总花费
   - 照片角标：背签标识、数量标识、价格标识
   - 交互：点击照片全屏查看，长按进入编辑
   - 全屏模式添加编辑按钮

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/types/index.ts` | 修改 | 添加 backPhotoUri、price、totalPrice 字段 |
| `src/services/avatarService.ts` | 新增 | 头像管理服务 |
| `src/services/recordService.ts` | 修改 | 支持背签和价格数据 |
| `src/services/photoService.ts` | 修改 | 添加多照片选择功能 |
| `src/screens/UploadScreen.tsx` | 修改 | 支持多照片上传、背签、价格 |
| `src/screens/DetailScreen.tsx` | 修改 | 按日期分组展示、头像设置、全屏查看 |
| `src/screens/EditScreen.tsx` | 修改 | 支持编辑背签和价格 |
| `src/screens/HomeScreen.tsx` | 修改 | 显示头像、总花费统计 |
| `src/components/features/IdolCard.tsx` | 修改 | 显示头像 |
| `src/hooks/useRecords.ts` | 修改 | 使用 useCallback 修复无限刷新 |
| `src/utils/rankingUtils.ts` | 修改 | 计算 totalPrice |
| `src/constants/storageKeys.ts` | 修改 | 添加 AVATARS 存储键 |

### 当前数据结构

```typescript
// 拍立得记录
interface PolaroidRecord {
  id: string
  idolName: string
  photoCount: number
  photoDate: string
  photoUri: string
  backPhotoUri?: string      // 背签照片
  price?: number             // 花费金额
  createdAt: number
  updatedAt: number
}

// 照片项（批量上传用）
interface PhotoItem {
  uri: string
  count: number
  backPhotoUri?: string
  price?: number
}

// 统计信息
interface Statistics {
  totalRecords: number
  totalPhotos: number
  uniqueIdols: number
  totalPrice: number         // 总花费
}
```

---

## 待办事项 / 已知问题

- 暂无

---

## 更新日志格式说明

每次开发工作结束后，请在本文档顶部添加新的日期记录，包含：
- 修复的问题
- 新增的功能
- 文件变更列表
- 数据结构变更（如有）
- 待办事项/已知问题（如有）
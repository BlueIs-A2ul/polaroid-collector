# 工作日志

本文档记录项目的开发进度和重要变更，供 AI 助手在每次开始工作时阅读，了解项目当前状态。

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
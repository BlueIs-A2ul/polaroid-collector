# 工作日志

## 2026-08-30 开发记录（P0 代码结构优化）

### 背景

代码结构审查发现两个影响维护与扩展的问题：导航类型循环依赖、页面直接调用存储层（分层泄漏）。

### 改动内容

1. **导航类型解耦**：`RootStackParamList` 从 `AppNavigator.tsx` 提取到新建 `src/types/navigation.ts`，8 个消费方（7 个页面 + useHomeActions）改用 `import type`，消除 navigation ↔ screens 的运行时循环依赖
2. **分层泄漏修复**：`recordQueryService` 新增 `getAllRecords`/`getRecordById` 转发，`recordCommandService` 新增 `deleteRecordsByIdolNames`/`updateRecordsByIdolNames` 转发；6 个页面/组件（HomeScreen、DetailScreen、EditScreen、CalendarScreen、OrganizationCenterScreen、AdvancedFilter）改从服务层导入，不再直接引用 `storageService`

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/types/navigation.ts` | 新增 | 导航参数类型唯一出处 |
| `src/navigation/AppNavigator.tsx` | 修改 | 类型定义移出，改 import type |
| 8 个页面/hook | 修改 | 导航类型改 `import type` |
| `src/services/recordQueryService.ts` | 修改 | 新增查询转发函数 |
| `src/services/recordCommandService.ts` | 修改 | 新增批量命令转发函数 |
| 6 个页面/组件 | 修改 | storageService 导入切换为服务层 |
| `src/__tests__/recordServiceBoundaries.test.ts` | 修改 | 新增 2 个转发行为测试 |

### 验证

- `npm run typecheck`
- `npm test -- --runInBand`（7 套件 43 用例全部通过）

---

## 2026-08-30 开发记录（文档精简）

### 背景

整理项目文档：删除已完成的计划文档与重复/过时规范，修正版本号等过时内容，降低文档维护负担。

### 改动内容

1. 删除已完成的计划文档：`plan.md`、`docs/upload-fields-plan.md`、`docs/superpowers/` 下 3 个文件（全部条目均已实现）
2. 删除 `RULES.md`（与 `.clinerules/Rules.md` 内容重复）
3. 删除 `conventions.md`（内容被 `AGENTS.md` 覆盖，且含自相矛盾的示例、虚构规范和不存在文件的引用）
4. 修正 `AGENTS.md`：标题去掉不存在的 lint 命令、React Native 版本号 0.83.2→0.83.6、结构示例中的已删除文件
5. 修正 `README.md`：版本号、结构树补齐新页面与常量、`PolaroidRecord` 补充附加照片字段
6. 修正 `.clinerules/Rules.md`：移除已删除文件和不存在命令的引用
7. 修正 `WORKLOG.md`：删除中间插入的孤立说明段落

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `plan.md` | 删除 | 全部条目已实现 |
| `docs/upload-fields-plan.md` | 删除 | 功能已上线 |
| `docs/superpowers/plans/*.md`、`docs/superpowers/specs/*.md` | 删除 | 功能已上线 |
| `RULES.md` | 删除 | 与 `.clinerules/Rules.md` 重复 |
| `conventions.md` | 删除 | 被 AGENTS.md 覆盖且含错误内容 |
| `AGENTS.md` | 修改 | 标题、版本号、结构示例修正 |
| `README.md` | 修改 | 版本号、结构树、数据结构修正 |
| `.clinerules/Rules.md` | 修改 | 移除已删除文件和不存在命令 |
| `WORKLOG.md` | 修改 | 删除孤立段落、新增本条记录 |

纯文档变更，不涉及代码，无需运行类型检查与测试。

---

## 2026-08-30 开发记录（UI 去 AI 感：精简重复性文案）

### 背景

在上一次圆角收敛/去悬浮的基础上，进一步精简冗余文字，让信息更聚焦。

### 改动内容

1. **统计看板去图标**：首页 `StatsCard` 和统计页 summary 三卡删除相机/人物/钱包图标，保留大数字 + 标签（图标与标签重复传达语义）
2. **详情页**：删除"记录列表"标题行与"从旧到新/从新到旧"提示（排序方向已由导航栏箭头表达）
3. **日期分组卡片**：组头删除日历图标和"N 张"数量（照片角标 ×N 已表达），仅保留日期与价格
4. **日历页**：删除"共 N 条记录"副标题和底部"点击日期查看当天的拍摄记录"提示
5. **统计页**：删除年度报告副标题"回顾你的拍立得之旅"
6. **整理中心**：删除顶部 intro 说明卡（长段落介绍），保留概要卡与 tab 列表

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/components/features/StatsCard.tsx` | 修改 | 删图标，数字上移 |
| `src/screens/StatisticsScreen.tsx` | 修改 | summary 卡删图标、删年度报告副标题 |
| `src/screens/DetailScreen.tsx` | 修改 | 删记录列表标题行及样式 |
| `src/components/features/DateGroupCard.tsx` | 修改 | 组头删图标与张数，保留价格 |
| `src/screens/CalendarScreen.tsx` | 修改 | 删副标题与底部 hint 及样式 |
| `src/screens/OrganizationCenterScreen.tsx` | 修改 | 删 intro 卡及样式 |

### 保留不动

- 表单 label、placeholder、操作按钮文案（编辑本日/去补充等）
- DetailHeader 统计单位（PRIMARY 底上为语义单位）
- 报告页叙事文案、EmptyState 标题+副标题

### 验证

- `npm run typecheck`
- `npm test -- --runInBand`（6 套件 36 用例全部通过）

---

## 2026-08-30 开发记录（UI 去 AI 感：圆角刻度收敛与卡片去悬浮）

### 背景

用户反馈界面"太 AI 化"。诊断出两个典型特征：圆角值散落 17 档（2~40px，全项目 170 处），以及所有输入框/按钮都带软阴影的"悬浮 Material 风"。

### 改动内容

1. **圆角刻度收敛**
   - 新增 `src/constants/radius.ts`：`RADIUS_XS=4 / SM=6 / MD=8 / LG=12` 四档刻度
   - 全项目走查映射：输入框/小控件 8→6、卡片/按钮/弹窗 12/14/16/18/20/22→8、照片块 8→4
   - 保留语义性圆形（头像、勾选圆圈、徽标、圆点进度条）和报告页卡组（24/28/30/40，刻意设计）
   - 修正后 8 成为主刻度（约 60 处），4/6/8/12 覆盖绝大多数场景

2. **卡片去悬浮**
   - `CARD_SHADOW`：opacity 0.1→0.05、elevation 3→1；`CARD_SHADOW_SMALL` 同步减淡
   - 上传/编辑页所有输入框、日期框、照片按钮去掉阴影，改为 1px `BORDER` 描边
   - 主色填充按钮（保存/确认）仅去阴影，保留直角小圆角

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/constants/radius.ts` | 新增 | 圆角刻度常量 |
| `src/constants/themes.ts` | 修改 | 阴影减淡 |
| `src/screens/uploadScreenStyles.ts` | 修改 | 输入/按钮去阴影改描边、半径映射 |
| `src/screens/editScreenStyles.ts` | 修改 | 同上 |
| `src/components/features/IdolCardAnimated.tsx` | 修改 | 卡片 12→8 |
| `src/components/features/DateGroupCard.tsx` | 修改 | 卡片 12→8、按钮 12→6 |
| `src/components/features/PhotoGridItem.tsx` | 修改 | 照片块 8→4 |
| `src/components/features/QuickActions.tsx` | 修改 | 胶囊 20→8 |
| `src/components/features/Calendar.tsx` / `CalendarScreen.tsx` | 修改 | 容器 12→8、选中格 8→6 |
| `src/components/common/SearchBar.tsx` / `SortOptionsModal.tsx` / `OptionsSelector.tsx` | 修改 | 行/选项 12→8、搜索框 8→6 |
| `src/components/features/AdvancedFilter.tsx` | 修改 | 选项 16→8、价格输入 8→6 |
| `src/components/common/AnimatedBottomSheet.tsx` | 修改 | 顶部圆角 22→12 |
| `src/components/common/ConfirmDialog.tsx` / `ShareModal.tsx` / `DetailBatchEditModal.tsx` | 修改 | 弹窗 22→12 |
| `src/components/features/ActionSheetModal.tsx` | 修改 | 行 12→8 |
| `src/components/common/Toast.tsx` | 修改 | 14→8 |
| `src/components/features/PhotoModal.tsx` / `ShareCard.tsx` | 修改 | 药丸按钮 16→8、卡片 20→12 |
| `src/screens/StatisticsScreen.tsx` | 修改 | 卡片 12/16→8 |
| `src/screens/OrganizationCenterScreen.tsx` / `ThemeSettingsScreen.tsx` / `YearlyReportEntryScreen.tsx` | 修改 | 10/12/20→8、色板 8→6 |
| `src/components/features/IdolSelector.tsx` / `StatsCard.tsx` / `SpendingChart.tsx` | 修改 | 卡片 12→8 |

### 保留不动

- `IdolReportScreen` / `YearlyReportScreen`（报告卡组刻意设计）
- 所有圆形头像、勾选圆圈、数字徽标、进度条圆点

### 验证

- `npm run typecheck`
- `npm test -- --runInBand`（6 套件 36 用例全部通过）

---

## 2026-07-27 开发记录（首页页面拆分）

### 重构内容

1. **首页排序逻辑抽离**
   - 新增 `homeRankingUtils`，统一维护排序类型、排序选项和排序函数
   - `HomeScreen` 改为组合筛选结果后调用纯排序函数，避免页面内保留重复排序分支
   - 补充排序工具测试，覆盖日期、数量、花费排序及不修改原数组行为

2. **首页动作逻辑抽离**
   - 新增 `useHomeActions`，集中管理导入导出、备份恢复、合并同日记录和更多菜单 ActionSheet 状态
   - `HomeScreen` 只保留动作入口，降低页面组件职责

3. **首页列表头组件抽离**
   - 新增 `HomeListHeader`，承载统计卡、快捷操作、搜索框和排行榜标题栏
   - 页面保留列表数据、批量选择和弹窗组合逻辑，结构更清晰

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/utils/homeRankingUtils.ts` | 新增 | 首页排行榜排序工具和排序选项 |
| `src/__tests__/homeRankingUtils.test.ts` | 新增 | 覆盖首页排序工具行为 |
| `src/hooks/useHomeActions.ts` | 新增 | 首页导入导出、备份恢复、合并同日记录动作 hook |
| `src/components/features/HomeListHeader.tsx` | 新增 | 首页列表头展示组件 |
| `src/components/features/SortOptionsModal.tsx` | 修改 | 复用统一排序选项和类型 |
| `src/screens/HomeScreen.tsx` | 重构 | 拆出排序、动作和列表头逻辑 |

### 验证

- `npm.cmd run typecheck`
- `npm.cmd test -- src/__tests__/homeRankingUtils.test.ts --runInBand`

---

## 2026-07-25 开发记录（工程质量与备份加固）

### 修复与优化

1. **Jest 覆盖率配置修复**
   - 修复 `test:coverage` 收集 `.tsx` 文件时 JSX 无法解析的问题
   - 为 `ts-jest` 明确配置测试环境下的 JSX 转换

2. **备份/恢复数据安全加固**
   - 创建备份时补充收集 `additionalPhotoUris` 和 `additionalBackPhotoUris`
   - 恢复备份时同步重写附加正面照片和附加背签照片 URI
   - 支持无显式版本号的旧备份迁移
   - 对不支持的备份版本和错误记录结构提前拦截，避免先清空现有数据
   - 将备份记录从 `any[]` 收紧为 `PolaroidRecord[]`，补充内部 schema 归一化

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `jest.config.js` | 修改 | 为 `ts-jest` 配置 JSX 转换，修复 coverage 收集 |
| `src/services/backupService.ts` | 修改 | 加固备份数据类型、版本迁移、照片 URI 收集与恢复 |
| `src/__tests__/backupService.test.ts` | 新增 | 覆盖备份附加照片、旧备份迁移、附加照片恢复和不支持版本防护 |
| `.gitignore` | 修改 | 忽略 coverage 和 bug_pic 本地产物 |
| `WORKLOG.md` | 修改 | 记录本次工程质量与备份加固 |

### 验证

- `npm.cmd run typecheck`
- `npm.cmd test -- --runInBand`
- `npm.cmd run test:coverage -- --runInBand`

## 2026-07-13 开发记录（用户手册同步）

### 文档更新

1. **用户手册更新到当前功能状态**
   - 补充整理中心入口、总览、疑似重复和待补信息说明
   - 更新首页搜索说明，覆盖“全部/偶像/团体/城市/场馆”搜索类型
   - 更新高级筛选说明，覆盖价格区间、背签照片有无和备注有无筛选
   - 更新上传说明，覆盖拍照、单张、多张、公共信息、合并记录、历史价格推荐和裁切选项
   - 更新背签照片说明，明确上传和编辑页均可添加/更换
   - 更新常见问题和用户手册更新日志

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `docs/用户手册.md` | 修改 | 同步最新用户可见功能 |
| `WORKLOG.md` | 修改 | 记录用户手册同步 |

---

## 2026-07-13 开发记录（结构重构）

### 重构内容

1. **记录服务职责拆分**
   - 将原 `recordService.ts` 中的写操作拆分到 `recordCommandService.ts`
   - 将排行榜、详情和偶像列表查询拆分到 `recordQueryService.ts`
   - 将统计和月度花费拆分到 `recordStatsService.ts`
   - 保留 `recordService.ts` 作为兼容导出入口，避免一次性改动所有调用方

2. **上传页瘦身**
   - 将上传页样式抽离到 `uploadScreenStyles.ts`
   - 将已选照片列表抽离为 `UploadPhotoList`
   - 将公共信息、价格选择弹窗、裁切选项弹窗抽离为独立组件
   - 将照片选择/背签/照片字段更新逻辑抽离到 `useUploadPhotos`
   - 将偶像默认团体和价格推荐逻辑抽离到 `useUploadIdolDefaults`

3. **编辑页瘦身**
   - 将编辑页样式抽离到 `editScreenStyles.ts`
   - 将裁切选项弹窗抽离为 `EditCropOptionsSheet`
   - 将正面照片和背签照片区域抽离为 `EditPhotoSection`
   - 将基础字段、日期、备注和扩展信息抽离为 `EditRecordFormFields`

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/services/recordCommandService.ts` | 新增 | 记录创建、更新、删除和批量创建 |
| `src/services/recordQueryService.ts` | 新增 | 记录排行榜、详情、偶像名称和偶像数量列表查询 |
| `src/services/recordStatsService.ts` | 新增 | 统计信息和月度花费 |
| `src/services/recordService.ts` | 重构 | 改为兼容导出入口 |
| `src/__tests__/recordServiceBoundaries.test.ts` | 新增 | 覆盖拆分后服务边界导出 |
| `src/screens/uploadScreenStyles.ts` | 新增 | 上传页样式工厂 |
| `src/components/features/upload/UploadPhotoList.tsx` | 新增 | 上传页已选照片列表 |
| `src/components/features/upload/UploadCommonFields.tsx` | 新增 | 上传页公共信息区域 |
| `src/components/features/upload/UploadPriceSelectorSheet.tsx` | 新增 | 上传页价格选择弹窗 |
| `src/components/features/upload/UploadCropOptionsSheet.tsx` | 新增 | 上传页裁切选项弹窗 |
| `src/hooks/useUploadPhotos.ts` | 新增 | 上传页照片选择与照片字段状态逻辑 |
| `src/hooks/useUploadIdolDefaults.ts` | 新增 | 上传页偶像默认团体和价格推荐逻辑 |
| `src/screens/UploadScreen.tsx` | 重构 | 从 1105 行降至约 408 行 |
| `src/screens/editScreenStyles.ts` | 新增 | 编辑页样式工厂 |
| `src/components/features/edit/EditCropOptionsSheet.tsx` | 新增 | 编辑页裁切选项弹窗 |
| `src/components/features/edit/EditPhotoSection.tsx` | 新增 | 编辑页正面照片和背签照片区域 |
| `src/components/features/edit/EditRecordFormFields.tsx` | 新增 | 编辑页基础字段和扩展字段表单 |
| `src/screens/EditScreen.tsx` | 重构 | 从 946 行降至约 427 行 |

### 验证

- `npm.cmd run typecheck`
- `npm.cmd test -- --runInBand`

---

## 2026-07-08 开发记录（整理中心）

### 新增功能

1. **整理中心**
   - 新增整理中心页面，提供“疑似重复”和“待补信息”两个视图
   - 疑似重复按偶像名称和拍摄日期聚合，展示可信度、涉及记录数、总张数和判断原因
   - 待补信息检查团体、城市、场馆、价格、背签照片、备注、类型和人数
   - 首页“更多选项”新增整理中心入口，支持跳转到详情页或编辑页继续处理

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/utils/organizationUtils.ts` | 新增 | 整理中心重复检测、待补信息和汇总统计工具函数 |
| `src/__tests__/organizationUtils.test.ts` | 新增 | 覆盖重复候选、可信度、待补字段和汇总统计 |
| `src/screens/OrganizationCenterScreen.tsx` | 新增 | 整理中心页面 |
| `src/navigation/AppNavigator.tsx` | 修改 | 添加整理中心路由 |
| `src/screens/HomeScreen.tsx` | 修改 | 首页更多菜单新增整理中心入口 |
| `src/types/index.ts` | 修改 | 添加整理中心相关类型 |
| `docs/superpowers/specs/2026-07-08-organization-center-design.md` | 新增 | 整理中心设计说明 |
| `docs/superpowers/plans/2026-07-08-organization-center.md` | 新增 | 整理中心实施计划 |

---

## 2026-07-08 开发记录

### 新增功能

1. **首页搜索与筛选增强**
   - 搜索新增“全部”模式，可同时匹配偶像名、团体、城市、场馆、备注、类型和人数
   - 高级筛选新增价格区间、背签照片有无、备注有无筛选
   - 首页筛选按钮显示当前启用筛选数量，并支持一键清除筛选
   - 将搜索和筛选匹配逻辑抽取为 `filterUtils`，便于测试和维护

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/utils/filterUtils.ts` | 新增 | 首页搜索和筛选匹配工具函数 |
| `src/__tests__/filterUtils.test.ts` | 新增 | 覆盖全部搜索、价格区间、背签/备注筛选和筛选计数 |
| `src/screens/HomeScreen.tsx` | 修改 | 使用统一筛选工具，默认启用全部搜索，支持清除筛选 |
| `src/components/common/SearchBar.tsx` | 修改 | 新增“全部”搜索类型 |
| `src/components/features/AdvancedFilter.tsx` | 修改 | 新增价格区间、背签和备注筛选控件 |
| `src/components/features/QuickActions.tsx` | 修改 | 显示筛选数量并提供一键清除入口 |
| `docs/superpowers/plans/2026-07-08-enhanced-search-filter.md` | 新增 | 搜索筛选增强实现计划 |

---

## 2026-04-13 开发记录

### 修复问题

1. **价格智能推荐失效**
   - 问题：价格自动填充只在从详情页跳转上传时生效，手动输入/选择偶像时不会触发
   - 解决：将 useEffect 监听目标从 routeIdolName 改为 idolName，任何偶像名称变化都会触发价格获取
   - 文件：`src/screens/UploadScreen.tsx`

---

## 2026-04-12 开发记录

### 性能与体验优化

1. **首页列表虚拟化**
   - 将 ScrollView 改为 FlatList，支持虚拟化渲染
   - 提升大量数据时的渲染性能
   - 减少内存占用

2. **大文件拆分优化**
   - HomeScreen.tsx (1089行) 拆分为 6 个独立组件
   - DetailScreen.tsx (1097行) 拆分为 6 个独立组件
   - 提高代码可维护性和复用性

3. **页面切换动画**
   - 添加自定义过渡动画（滑入 + 透明度变化）
   - 支持手势返回操作
   - 提升导航体验流畅度

4. **列表项进入动画**
   - 每个偶像卡片添加淡入 + 上滑动画
   - 动画延迟递增，形成流畅的瀑布效果
   - 提升列表加载体验

5. **键盘遮挡问题修复**
   - UploadScreen 和 EditScreen 添加 KeyboardAvoidingView
   - 键盘弹出时自动调整界面位置
   - 解决输入框被遮挡的问题

6. **多张上传逻辑修复**
   - 修复点击"多张"按钮时实际只上传一张的问题
   - 分离处理逻辑，多张上传直接调用独立函数

### 轻量化优化

1. **清理未使用代码**
   - 移除废弃的 themeColors.ts 文件
   - 清理 StatisticsScreen 中未使用的 import
   - 移除 7 个多余的 dev packages (expo-dev-client 等)

2. **移除 blurhash 占位符**
   - CachedImage 移除 blurhash 占位符
   - 减少图片加载时的内存占用

3. **页面懒加载**
   - 移除 React.lazy 懒加载（React Native 手势兼容性问题）
   - 改为直接导入组件

4. **删除功能位置调整**
   - 移除首页滑动删除功能
   - 删除功能移至偶像详情页（右上角垃圾桶图标）
   - 简化首页卡片组件为 IdolCardAnimated
   - 删除 SwipeableIdolCard.tsx 和 IdolCard.tsx

### 新增功能

1. **偶像团体绑定**
   - 新增 idolBindingService 存储偶像绑定的团体
   - 偶像详情页可绑定/修改团体（右上角人员图标）
   - 从详情页上传时自动填充绑定的团体
   - 用户可自行修改团体字段

2. **价格统计与智能推荐**
   - 新增 priceStatsService 统计每个偶像的历史价格
   - 上传时自动填充使用最多的默认价格
   - 提供价格选择器（最多5个历史价格）
   - 用户可选择或手动输入价格

3. **多张上传公共信息优化**
   - 团体、城市、场馆改为全局字段（所有照片共用）
   - 只需填写一次，自动应用到所有照片
   - 照片列表上方显示公共信息设置区域

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/screens/HomeScreen.tsx` | 重构 | 使用 FlatList、拆分组件、减少代码量 |
| `src/screens/DetailScreen.tsx` | 重构 | 拆分组件、减少代码量 |
| `src/navigation/AppNavigator.tsx` | 修改 | 添加页面切换动画配置 |
| `src/components/features/HomeHeader.tsx` | 新增 | 首页头部组件 |
| `src/components/features/StatsCard.tsx` | 新增 | 统计卡片组件 |
| `src/components/features/QuickActions.tsx` | 新增 | 快捷操作栏组件 |
| `src/components/features/BatchActionBar.tsx` | 新增 | 批量操作栏组件 |
| `src/components/features/BatchEditModal.tsx` | 新增 | 批量编辑弹窗组件 |
| `src/components/features/SortOptionsModal.tsx` | 新增 | 排序选项弹窗组件 |
| `src/components/features/DetailHeader.tsx` | 新增 | 详情页头部组件 |
| `src/components/features/PhotoGridItem.tsx` | 新增 | 照片网格项组件 |
| `src/components/features/DateGroupCard.tsx` | 新增 | 日期分组卡片组件 |
| `src/components/features/PhotoModal.tsx` | 新增 | 全屏照片弹窗组件 |
| `src/components/features/DetailBatchEditModal.tsx` | 新增 | 详情页批量编辑弹窗 |
| `src/components/features/ShareModal.tsx` | 新增 | 分享弹窗组件 |
| `src/components/features/SwipeableIdolCard.tsx` | 删除 | 移除滑动删除功能 |
| `src/components/features/IdolCard.tsx` | 删除 | 合并为 IdolCardAnimated |
| `src/components/features/IdolCardAnimated.tsx` | 新增 | 简化的偶像卡片组件 |
| `src/components/common/FadeIn.tsx` | 删除 | 未使用组件 |
| `src/constants/themeColors.ts` | 删除 | 废弃文件 |
| `src/screens/StatisticsScreen.tsx` | 修改 | 清理未使用 import |
| `src/components/common/CachedImage.tsx` | 修改 | 移除 blurhash 占位符 |
| `package.json` | 修改 | 移除 7 个多余 dev packages |
| `src/services/idolBindingService.ts` | 新增 | 偶像团体绑定服务 |
| `src/services/priceStatsService.ts` | 新增 | 偶像价格统计服务 |
| `src/screens/DetailScreen.tsx` | 修改 | 添加团体绑定功能、上传按钮 |
| `src/screens/UploadScreen.tsx` | 修改 | 接收偶像参数、全局字段设置、价格智能推荐、键盘遮挡修复 |
| `src/screens/EditScreen.tsx` | 修改 | 键盘遮挡修复 |
| `src/navigation/AppNavigator.tsx` | 修改 | Upload 页面支持偶像参数 |

---

## 2026-03-24 开发记录

### 新增功能

1. **完善 CSV 导出字段**
   - 原 CSV 只包含基础字段（ID、名称、数量、日期、路径等）
   - 现包含完整字段：偶像名称、拍立得数量、拍摄日期、价格、备注、团体、城市、场馆、拍立得类型、人数
   - 移除照片路径字段（本地路径导入后无法使用）

2. **CSV 导入功能**
   - 首页"数据导入导出"菜单新增"从 CSV 导入"选项
   - 支持解析 CSV 并创建记录
   - 自动识别 CSV 表头字段
   - 导入后自动刷新列表

3. **骨架屏加载优化**
   - 创建通用 Skeleton 和 SkeletonCircle 组件
   - 新增 HomeSkeleton、DetailSkeleton、StatisticsSkeleton 专用骨架屏
   - 替换首页、详情页、统计页的 LoadingSpinner
   - 带闪烁动画效果，提升用户体验

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/services/exportService.ts` | 修改 | 完善 CSV 导出字段，添加 importFromCSV 函数 |
| `src/screens/HomeScreen.tsx` | 修改 | 添加 CSV 导入入口、使用骨架屏 |
| `src/screens/DetailScreen.tsx` | 修改 | 使用骨架屏 |
| `src/screens/StatisticsScreen.tsx` | 修改 | 使用骨架屏 |
| `src/components/common/Skeleton.tsx` | 新增 | 骨架屏组件 |

---

## 2026-03-21 开发记录（续七）

### 新增功能

1. **自动读取照片拍摄日期**
   - 选择照片时自动读取 EXIF 数据中的拍摄时间
   - 若 EXIF 无数据则尝试从媒体库获取创建时间
   - 自动填充日期字段，无需手动选择

### 修复问题

1. **统计页面返回后滚动位置重置**
   - 问题：`useFocusEffect` 每次返回都重新加载数据导致滚动位置丢失
   - 解决：只在首次挂载时加载，已有数据时跳过

2. **日历数量标签遮挡日期**
   - 问题：绝对定位的标签遮挡日期数字
   - 解决：改用垂直布局，日期在上、标签在下，增加行间距

3. **上传页面 Hooks 顺序错误**
   - 问题：`useMemo` 定义在条件返回之后，违反 React Hooks 规则
   - 解决：将 `useMemo` 移到条件返回之前

4. **创建记录时遗漏字段**
   - 问题：`createRecord` 函数未保存 groupName、city、venue 等字段
   - 解决：补充所有扩展字段的赋值

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/services/photoService.ts` | 修改 | 添加 EXIF 日期读取、PhotoWithDate 类型 |
| `src/screens/UploadScreen.tsx` | 修改 | 自动填充日期、修复 hooks 顺序 |
| `src/screens/StatisticsScreen.tsx` | 修改 | 修复滚动位置问题 |
| `src/components/features/Calendar.tsx` | 修改 | 修复数量标签布局 |
| `src/services/recordService.ts` | 修改 | 补充遗漏字段 |
| `package.json` | 修改 | 添加 expo-media-library |

---

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

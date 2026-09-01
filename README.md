# 电子切盒

基于 React Native + Expo 的拍立得收藏管理应用，帮助记录和管理偶像拍立得收藏，支持 iOS、Android 与 Web 平台。

## 功能特性

### 记录管理
- 拍立得记录的上传、编辑、删除
- 单张/多张照片批量上传（可合并为一条记录或保持独立）
- 背签照片、照片备注、EXIF 自动读取拍摄日期
- 价格记录与历史价格智能推荐

### 拍立得属性
- 团体、城市、场馆、拍立得类型（无签/带签/主题/宿题）、人数（单人/双人/团切）
- 扩展字段历史记录快速选择、偶像团体绑定

### 查找与整理
- 首页搜索（全部/偶像/团体/城市/场馆）与高级筛选（价格区间、背签、备注等）
- 排行榜排序（日期/数量/花费）、批量删除与批量编辑
- 整理中心：疑似重复检测、待补信息提醒

### 统计与报告
- 偶像排行（数量/花费）、团体/城市/场馆统计、月度花费趋势、拍摄日历
- 年度报告与偶像个人报告（滑动卡片风格）、分享卡片生成

### 数据管理
- JSON/CSV 导出、CSV 导入
- 完整备份与恢复（含照片）、合并同日记录

### 个性化
- 6 套预设主题 + 自定义调整（色相/饱和度/亮度）
- 暗色模式、偶像头像设置

## 技术栈

| 类别 | 依赖 |
|------|------|
| 框架 | React Native 0.83.6、React 19.2.0、Expo SDK 55、TypeScript 5.9.3 |
| 导航 | React Navigation 7（native + stack） |
| 存储 | AsyncStorage、expo-file-system |
| 媒体 | expo-image-picker、expo-image、expo-image-manipulator、expo-media-library、expo-sharing、react-native-view-shot |
| 交互 | expo-haptics、@react-native-community/datetimepicker、@react-native-community/slider |
| 测试 | Jest + ts-jest |

## 快速开始

### 环境要求

- Node.js
- npm
- Expo Go 应用（推荐，手机应用商店下载）

### 安装与运行

```bash
npm install        # 安装依赖
npm start          # 启动 Expo 开发服务器，用 Expo Go 扫描二维码预览
npm run android    # 启动 Android 开发
npm run ios        # 启动 iOS 开发
npm run web        # 启动 Web 开发
```

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm start` | 启动 Expo 开发服务器 |
| `npm run android` / `ios` / `web` | 启动对应平台开发 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm test` | 运行所有测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── common/          # 通用组件（CachedImage、Skeleton、Toast、ConfirmDialog、EmptyState 等）
│   ├── features/        # 功能组件（IdolCardAnimated、Calendar、AdvancedFilter、PhotoModal 等）
│   │   ├── edit/        # 编辑页子组件
│   │   └── upload/      # 上传页子组件
├── screens/             # 页面组件（Home/Upload/Detail/Edit/Statistics/Calendar/ThemeSettings/年度报告/偶像报告/整理中心）
├── services/            # 业务逻辑（记录按 command/query/stats 拆分；存储、照片、备份、导出、合并、分享等）
├── hooks/               # 自定义 Hooks（useRecords、useHomeActions、useUploadPhotos 等）
├── utils/               # 工具函数（排序、筛选、整理算法、颜色、触觉反馈）
├── constants/           # 常量（存储键、预设选项、主题、圆角刻度）
├── contexts/            # React Context（ThemeContext）
├── navigation/          # 导航配置（AppNavigator）
└── types/               # 类型定义（领域类型、主题、导航参数、报告）
```

完整结构说明见 [AGENTS.md](./AGENTS.md)。

## 数据结构

```typescript
interface PolaroidRecord {
  id: string
  idolName: string
  photoCount: number
  photoDate: string
  photoUri: string
  backPhotoUri?: string
  additionalPhotoUris?: string[]
  additionalBackPhotoUris?: string[]
  price?: number
  note?: string
  groupName?: string
  city?: string
  venue?: string
  polaroidType?: string
  memberCount?: string
  createdAt: number
  updatedAt: number
}
```

## 文档导航

| 文档 | 说明 |
|------|------|
| [AGENTS.md](./AGENTS.md) | 开发规范：命令、代码风格、Git 提交约定 |
| [WORKLOG.md](./WORKLOG.md) | 工作日志：开发进度与重要变更 |
| [docs/用户手册.md](./docs/用户手册.md) | 用户手册：功能使用说明 |

## 许可证

私有项目

# 电子切盒

一个基于 React Native 和 Expo 开发的拍立得收藏管理应用，专注于记录和管理偶像拍立得收藏。

## 项目简介

电子切盒是一个现代化的移动应用，帮助用户记录和管理偶像拍立得收藏。支持多照片上传、花费记录、统计分析、年度报告等功能，使用 Expo 框架构建，支持 iOS、Android 和 Web 平台。

## 技术栈

- React Native 0.83.2
- React 19.2.0
- Expo SDK 55
- TypeScript 5.9.3
- React Navigation 7.x
- AsyncStorage (本地存储)
- expo-image-picker (图片选择)
- expo-image (图片缓存)
- Jest (测试)

## 功能特性

### 核心功能
- 偶像拍立得记录管理（上传、编辑、删除）
- 多照片批量上传
- 照片备注、背签照片支持
- 花费记录与统计

### 拍立得属性
- 团体、城市、场馆信息
- 拍立得类型（无签、带签、主题、宿题）
- 拍立得人数（单人、双人、团切）
- 价格记录与智能推荐

### 统计分析
- 偶像排行（数量/花费）
- 团体、城市、场馆统计
- 月度花费趋势图表
- 拍摄日历视图

### 特色功能
- 年度报告（类似网易云年度报告风格）
- 偶像个人报告
- 分享卡片生成
- CSV 数据导入导出
- 数据备份与恢复（含照片）

### 个性化
- 6 套预设主题（经典棕、海洋蓝、樱花粉、森林绿、薰衣草、日落橙）
- 主题自定义调整（色相、饱和度、亮度）
- 偶像头像设置
- 偶像团体绑定

### 高级功能
- 高级筛选（团体、城市、场馆、类型）
- 批量操作（批量删除、批量编辑）
- 偶像列表排序（日期、数量、花费）
- 字段历史记录快速选择

## 安装和运行

### 环境要求

- Node.js
- npm 或 yarn
- Expo Go 应用（推荐）

### 安装依赖

```bash
npm install
```

### 运行项目

```bash
npm start              # 启动 Expo 开发服务器
npm run android        # 启动 Android 开发
npm run ios            # 启动 iOS 开发
npm run web            # 启动 Web 开发
```

### 使用 Expo Go

1. 在手机上下载 Expo Go 应用
2. 运行 `npm start`
3. 使用 Expo Go 扫描终端显示的 QR 码

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── common/          # 通用组件
│   │   ├── CachedImage.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Skeleton.tsx
│   │   └── OptionsSelector.tsx
│   └── features/        # 功能组件
│       ├── IdolSelector.tsx
│       ├── FieldHistorySelector.tsx
│       ├── Calendar.tsx
│       ├── AdvancedFilter.tsx
│       └── ...
├── screens/             # 页面组件
│   ├── HomeScreen.tsx
│   ├── UploadScreen.tsx
│   ├── DetailScreen.tsx
│   ├── EditScreen.tsx
│   ├── StatisticsScreen.tsx
│   ├── CalendarScreen.tsx
│   ├── ThemeSettingsScreen.tsx
│   ├── YearlyReportScreen.tsx
│   └── IdolReportScreen.tsx
├── services/            # 业务逻辑服务
│   ├── storageService.ts
│   ├── recordService.ts
│   ├── photoService.ts
│   ├── exportService.ts
│   ├── themeService.ts
│   ├── idolBindingService.ts
│   ├── priceStatsService.ts
│   └── ...
├── hooks/               # 自定义 Hooks
│   └── useRecords.ts
├── contexts/            # React Context
│   └ ThemeContext.tsx
├── utils/               # 工具函数
│   ├── rankingUtils.ts
│   └ colorUtils.ts
├── constants/           # 常量定义
│   ├── storageKeys.ts
│   ├── polaroidOptions.ts
│   └ themes.ts
├── navigation/          # 导航配置
│   └ AppNavigator.tsx
└── types/               # TypeScript 类型定义
    └ index.ts
    └ theme.ts
```

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm start` | 启动 Expo 开发服务器 |
| `npm run android` | 在 Android 上运行 |
| `npm run ios` | 在 iOS 上运行 |
| `npm run web` | 在 Web 浏览器中运行 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm test` | 运行所有测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |

## 数据结构

```typescript
interface PolaroidRecord {
  id: string
  idolName: string
  photoCount: number
  photoDate: string
  photoUri: string
  backPhotoUri?: string
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

## 开发指南

详见 [AGENTS.md](./AGENTS.md)，包含：
- Build/Lint/Test 命令
- 代码风格指南
- 项目结构详解
- Git Commit 规范
- Pre-commit 检查清单

## 工作日志

详见 [WORKLOG.md](./WORKLOG.md)，记录项目开发进度和重要变更。

## 许可证

私有项目
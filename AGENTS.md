# AGENTS.md

Polaroid App - 拍立得记录管理应用，基于 React Native + Expo 开发的跨平台移动应用。

> **重要提示**: 每次开始工作时，请先阅读 `WORKLOG.md` 了解项目当前状态和最近的开发进度。

## Build/Lint/Test Commands

```bash
# Development
npm start              # 启动 Expo 开发服务器
npm run android        # 启动 Android 开发
npm run ios            # 启动 iOS 开发
npm run web            # 启动 Web 开发

# Type Checking
npm run typecheck      # TypeScript 类型检查

# Testing
npm test               # 运行所有测试
npm run test:coverage  # 运行测试并生成覆盖率报告
npx jest path/to/test.test.ts  # 运行单个测试文件
npx jest -t "test name pattern"  # 按名称匹配运行测试
```

## Code Style Guidelines

### Formatting
- **单引号**: 使用单引号而非双引号
- **无分号**: 不使用分号
- **2 空格缩进**: 使用 2 空格缩进
- **无调试代码**: 提交前移除 `console.log` 和 `debugger`（`console.error` 在服务层可保留用于错误日志）

### Naming Conventions
- **组件**: PascalCase（如 `IdolCard.tsx`）
- **函数/变量**: camelCase（如 `saveRecord`）
- **常量**: UPPER_SNAKE_CASE（如 `STORAGE_KEY`）
- **类型/接口**: PascalCase（如 `PolaroidRecord`）
- **文件名**: 与导出的组件/函数名称一致

### TypeScript
- 所有新代码必须使用 TypeScript
- 启用 TypeScript 严格模式
- 所有函数必须有明确的类型定义
- 类型定义统一放在 `src/types/index.ts`

### Imports
```typescript
// 顺序：React -> 第三方库 -> 本地模块 -> 类型
import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../constants/themeColors'
import { PolaroidRecord } from '../types'
```

### Error Handling
- 所有异步操作必须使用 try-catch
- 服务层返回统一的 `ServiceResult<T>` 类型
- 用户界面使用 `Alert.alert()` 显示错误提示

```typescript
interface ServiceResult<T> {
  success: boolean
  data: T | null
  error: string | null
}
```

### Components
- 使用函数组件 + Hooks
- 组件文件使用 `.tsx` 扩展名
- Props 必须定义接口类型
- 样式使用 `StyleSheet.create()`

```typescript
interface ComponentProps {
  visible: boolean
  onClose: () => void
}

const Component: React.FC<ComponentProps> = ({ visible, onClose }) => {
  // ...
}
```

## Project Structure

```
src/
├── components/       # 可复用组件
│   ├── common/       # 通用组件 (LoadingSpinner, EmptyState)
│   └── features/     # 功能组件 (IdolCard, IdolSelector)
├── screens/          # 页面组件 (HomeScreen, UploadScreen, DetailScreen, EditScreen)
├── services/         # 业务逻辑 (storageService, photoService, recordService)
├── hooks/            # 自定义 Hooks (useRecords)
├── utils/            # 工具函数 (rankingUtils)
├── constants/        # 常量 (storageKeys, themeColors)
├── navigation/       # 导航配置 (AppNavigator)
└── types/            # TypeScript 类型定义
```

## Git Commit Convention

格式: `<类型>: <描述>`

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 代码重构 |
| `style` | 代码格式 |
| `docs` | 文档更新 |
| `chore` | 构建/工具链 |

示例:
- `feat: 添加偶像选择器功能`
- `fix: 修复日期选择器不显示的问题`
- `refactor: 优化存储服务结构`

## Pre-commit Checklist

- [ ] TypeScript 编译通过 (`npm run typecheck`)
- [ ] 测试通过 (`npm test`)
- [ ] 无调试代码 (`console.log`, `debugger`)
- [ ] 提交信息符合规范

## Tech Stack

- React Native 0.83.2
- React 19.2.0
- Expo SDK 55
- TypeScript 5.9.3
- React Navigation 7.x
- AsyncStorage (本地存储)
- expo-image-picker (图片选择)
- Jest (测试)
# Polaroid App 项目规则

## 📖 项目概述

### 项目名称

Polaroid App - 拍立得记录管理应用

### 项目目标

为偶像粉丝提供一个便捷的拍立得记录工具，帮助他们：

- 记录每次购买的拍立得数量和日期
- 追踪偶像的拍立得收集进度
- 生成排行榜，了解收藏最多的偶像
- 随时查看详细的收藏记录

### 核心功能

1. 📸 上传拍立得记录（拍照或从相册选择）
2. ✏️ 编辑和删除记录
3. 🏆 查看排行榜（按拍立得总数排序）
4. 👤 查看每个偶像的详细记录
5. 📊 统计总数据

---

## 🛠️ 技术栈

### 前端框架

- **React Native 0.83.2** - 跨平台移动应用开发
- **React 19.2.0** - UI 库
- **TypeScript 5.9.3** - 类型安全的 JavaScript 超集

### 开发平台

- **Expo SDK 55** - React Native 开发工具链
- **Expo Go** - 快速预览应用

### 导航

- **React Navigation 7.x** - 应用导航
  - `@react-navigation/native` - 基础导航
  - `@react-navigation/stack` - 堆栈导航

### 本地存储

- **@react-native-async-storage/async-storage** - 持久化存储
- **expo-file-system** - 文件系统操作

### 图片处理

- **expo-image-picker** - 图片选择（相机/相册）
- **expo-file-system** - 图片存储和管理

### UI 组件

- **@expo/vector-icons** - 图标库

### 日历选择

- **@react-native-community/datetimepicker** - 日历选择器

### 开发工具

- **TypeScript** - 类型检查
- **VS Code** - 代码编辑器
- **Git** - 版本控制

---

## 📁 项目结构

```
polaroid-app/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── common/          # 通用组件
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── EmptyState.tsx
│   │   └── features/        # 功能组件
│   │       ├── IdolCard.tsx
│   │       └── IdolSelector.tsx
│   ├── screens/             # 页面组件
│   │   ├── HomeScreen.tsx   # 首页（排行榜）
│   │   ├── UploadScreen.tsx # 上传页面
│   │   ├── DetailScreen.tsx # 详情页面
│   │   └── EditScreen.tsx   # 编辑页面
│   ├── services/            # 业务逻辑
│   │   ├── storageService.ts    # 存储服务
│   │   ├── photoService.ts      # 照片服务
│   │   └── recordService.ts     # 记录服务
│   ├── utils/               # 工具函数
│   │   └── rankingUtils.ts  # 排行榜相关工具
│   ├── constants/           # 常量
│   │   ├── storageKeys.ts   # 存储键
│   │   └── themeColors.ts   # 主题颜色
│   ├── hooks/               # 自定义 Hooks
│   │   └── useRecords.ts    # 记录管理 Hook
│   ├── navigation/          # 导航配置
│   │   └── AppNavigator.tsx
│   └── types/               # TypeScript 类型
│       └── index.ts
├── assets/                  # 静态资源
├── App.tsx                  # 应用入口
├── index.js                 # Expo 注册入口
├── app.json                 # Expo 配置
├── package.json             # 依赖管理
└── tsconfig.json            # TypeScript 配置
```

---

## 🎯 开发规则

### 代码风格

- **TypeScript 优先**：所有新代码必须使用 TypeScript
- **严格模式**：启用 TypeScript 严格模式
- **类型安全**：所有函数必须有明确的类型定义
- **单引号**：使用单引号而非双引号
- **无分号**：不使用分号（遵循项目风格）
- **2 空格缩进**：使用 2 空格缩进

### 命名规范

- **组件**：PascalCase（如 `IdolCard.tsx`）
- **函数/变量**：camelCase（如 `saveRecord`）
- **常量**：UPPER_SNAKE_CASE（如 `STORAGE_KEY`）
- **类型/接口**：PascalCase（如 `PolaroidRecord`）
- **文件名**：与导出的组件/函数名称一致

### 文件组织

- **组件文件**：`.tsx`（包含 JSX）
- **工具文件**：`.ts`（纯逻辑）
- **类型定义**：统一放在 `src/types/index.ts`
- **服务层**：按功能划分（storageService, photoService, recordService）

---

## 🔄 Git 提交规范

### 提交原则

每次完成一个**独立功能**或**修复一个 bug**后，必须提交代码。

### 提交时机

- ✅ 完成一个功能后立即提交
- ✅ 修复一个 bug 后立即提交
- ✅ 重构完成后立即提交
- ❌ 不要堆积多个改动在一次提交
- ❌ 不要提交未完成的代码

### 提交格式

```bash
<类型>: <简短描述>

<详细描述（可选）>

<影响范围（可选）>
```

### 提交类型

| 类型       | 说明         | 示例                              |
| ---------- | ------------ | --------------------------------- |
| `feat`     | 新功能       | `feat: 添加偶像选择器功能`        |
| `fix`      | 修复 bug     | `fix: 修复日期选择器不显示的问题` |
| `refactor` | 重构代码     | `refactor: 优化存储服务结构`      |
| `style`    | 代码格式调整 | `style: 统一代码缩进格式`         |
| `docs`     | 文档更新     | `docs: 更新 README 文档`          |
| `chore`    | 构建/工具链  | `chore: 更新依赖包`               |

### 提交示例

#### 新功能

```bash
feat: 为上传界面添加偶像选择器

- 安装 @react-native-community/datetimepicker 组件库
- 创建 IdolSelector 组件用于选择已有偶像
- 添加获取所有偶像名称的服务函数
- 修改 UploadScreen 支持选择或输入偶像名称
- 优化用户体验：减少重复输入

影响范围: UploadScreen.tsx, recordService.ts, IdolSelector.tsx
```

#### 修复 bug

```bash
fix: 修复照片上传后不显示的问题

- 检查照片 URI 格式
- 修复 FileSystem 路径问题
- 添加错误提示

影响范围: UploadScreen.tsx, photoService.ts
```

#### 重构

```bash
refactor: 统一导航参数类型定义

- 将所有导航参数类型移到 AppNavigator.tsx
- 定义 RootStackParamList 接口
- 更新所有屏幕使用统一类型

影响范围: AppNavigator.tsx, 所有屏幕组件
```

### 提交命令

```bash
# 添加所有更改
git add -A

# 提交（使用 -m 参数添加提交信息）
git commit -m "feat: 添加新功能"

# 或使用多行提交信息
git commit -m "feat: 添加新功能

详细描述

影响范围"
```

### 提交信息规范

- ✅ 使用中文描述（便于团队理解）
- ✅ 信息简洁明了，不超过 50 字符（标题）
- ✅ 详细描述说明做了什么改动
- ✅ 列出受影响的文件
- ❌ 不要写"更新"、"修复"等模糊信息
- ❌ 不要写多行标题

---

## 🧪 测试流程

### 开发前

1. 拉取最新代码：`git pull`
2. 安装依赖：`npm install`
3. 启动开发服务器：`npm start`

### 开发中

1. 实现功能
2. TypeScript 类型检查：`npm run typecheck`
3. 测试功能（在 Expo Go 中预览）

### 提交前

1. ✅ 代码符合项目规范
2. ✅ TypeScript 编译通过（无错误）
3. ✅ 功能测试通过
4. ✅ 没有调试代码（console.log、debugger）
5. ✅ 提交信息规范

### 提交后

1. 推送到远程：`git push`
2. 检查 CI/CD（如有）

---

## 📋 功能开发流程

### 1. 分析需求

- 明确功能目标
- 确定涉及的服务和组件
- 评估影响范围

### 2. 设计方案

- 设计数据结构（如需要）
- 确定组件拆分
- 规划实现步骤

### 3. 编写代码

- 遵循代码风格规范
- 使用 TypeScript 类型
- 添加必要注释

### 4. 测试验证

- 功能测试
- 边界情况测试
- 错误处理测试

### 5. 提交代码

- 格式化代码
- 类型检查
- 规范提交

---

## 🎨 UI/UX 原则

### 设计风格

- **复古风格**：模拟拍立得照片效果
- **简洁界面**：避免复杂操作
- **清晰层次**：信息展示清晰
- **友好交互**：提供即时反馈

### 颜色方案

- 主色调：棕色系（#8B4513）
- 背景色：米色系（#F5F5DC）
- 成功：绿色
- 错误：红色

### 交互设计

- 点击区域至少 44x44
- 加载状态显示 Spinner
- 错误提示使用 Alert
- 确认操作使用 Alert 弹窗

---

## 🚀 部署流程

### 开发环境

```bash
npm start
# 扫描二维码，在 Expo Go 中预览
```

### 生产构建

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

---

## 📝 常用命令

### 开发

```bash
npm start              # 启动开发服务器
npm run android        # 运行 Android
npm run ios            # 运行 iOS
npm run web            # 运行 Web
```

### 代码检查

```bash
npm run typecheck      # TypeScript 类型检查
npm run tsc            # TypeScript 编译检查
```

### Git

```bash
git add -A             # 添加所有更改
git commit -m "..."    # 提交
git push               # 推送
git pull               # 拉取
git status             # 查看状态
```

---

## ⚠️ 注意事项

### 必须遵守

1. **类型安全**：所有代码必须有类型定义
2. **错误处理**：所有异步操作必须有 try-catch
3. **代码规范**：遵循项目的代码风格
4. **提交规范**：每次提交信息清晰规范
5. **测试验证**：提交前必须测试

### 禁止事项

1. ❌ 不要提交未完成的代码
2. ❌ 不要忽略 TypeScript 错误
3. ❌ 不要硬编码魔法数字
4. ❌ 不要在代码中留下调试信息
5. ❌ 不要破坏现有功能

---

## 📞 问题反馈

遇到问题时：

1. 查看控制台错误信息
2. 检查 TypeScript 类型错误
3. 参考本文档
4. 查阅官方文档

---

**最后更新**: 2026-03-19

**版本**: 1.0.0

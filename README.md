# Polaroid App 📸

一个基于 React Native 和 Expo 开发的移动应用，专注于拍立得风格的拍照和照片处理体验。

## 🚀 项目简介

Polaroid App 是一个现代化的移动应用项目，旨在为用户提供类似拍立得相机的拍照体验。该项目使用 Expo 框架构建，支持 iOS、Android 和 Web 平台，具有跨平台兼容性。

## 🛠️ 技术栈

- **React Native**: 0.83.2 - 移动应用开发框架
- **React**: 19.2.0 - UI 组件库
- **Expo**: ~55.0.8 - React Native 开发工具链
- **expo-status-bar**: ~55.0.4 - 状态栏组件

## ✨ 功能特性

- 📱 跨平台支持（iOS、Android、Web）
- 🎨 现代化的用户界面设计
- 📸 拍立得风格的拍照体验
- 🌓 浅色主题界面
- 🖼️ 自定义图标和启动屏幕

## 📦 安装和运行

### 环境要求

- Node.js
- npm 或 yarn
- Expo CLI（可选，推荐使用 Expo Go 应用）

### 安装依赖

```bash
npm install
```

### 运行项目

#### 启动开发服务器

```bash
npm start
```

#### 在特定平台运行

**Android:**

```bash
npm run android
```

**iOS:**

```bash
npm run ios
```

**Web:**

```bash
npm run web
```

### 使用 Expo Go（推荐）

1. 在手机上下载 Expo Go 应用（Android 或 iOS）
2. 运行 `npm start`
3. 使用 Expo Go 扫描终端显示的 QR 码

## 📁 项目结构

```
polaroid-app/
├── assets/              # 应用资源文件
│   ├── android-icon-background.png
│   ├── android-icon-foreground.png
│   ├── android-icon-monochrome.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── App.js               # 主应用组件
├── app.json             # Expo 应用配置
├── package.json         # 项目依赖和脚本
├── index.js             # 应用入口文件
├── .gitignore           # Git 忽略文件配置
└── README.md            # 项目文档
```

## 🎯 开发指南

### 主要文件说明

- **App.js**: 应用的主组件，包含核心 UI 和业务逻辑
- **app.json**: Expo 应用配置文件，包含应用名称、图标、启动屏幕等设置
- **package.json**: 定义项目依赖和可用的 npm 脚本

### 添加新功能

当前项目处于初始阶段，你可以根据需要添加以下功能：

- 相机拍照功能
- 照片滤镜效果
- 照片库管理
- 照片分享功能
- 用户设置界面

## 🔧 配置说明

### 应用图标和启动屏幕

- 应用图标位于 `assets/icon.png`
- 启动屏幕图片位于 `assets/splash-icon.png`
- Android 自适应图标支持背景、前景和单色版本

### 平台特定配置

**iOS:**

- 支持平板设备

**Android:**

- 支持自适应图标
- 背景颜色：#E6F4FE

**Web:**

- 自定义 favicon

## 📝 脚本命令

| 命令              | 说明                          |
| ----------------- | ----------------------------- |
| `npm start`       | 启动 Expo 开发服务器          |
| `npm run android` | 在 Android 模拟器或设备上运行 |
| `npm run ios`     | 在 iOS 模拟器或设备上运行     |
| `npm run web`     | 在 Web 浏览器中运行           |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目！

## 📄 许可证

此项目为私有项目（在 package.json 中标记为 `"private": true`）。

## 📞 联系方式

如有问题或建议，请通过项目 Issue 联系。

---

**注意**: 这是一个初始项目模板，目前 App.js 只包含示例代码。请根据实际需求开发具体功能。

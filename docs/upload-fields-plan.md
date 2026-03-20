# 拍立得上传扩展字段规划

## 需求概述

在上传拍立得时添加以下可选字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| 团体 | 可选文本 | 小偶像所属团体 |
| 城市 | 可选文本 | 拍摄城市 |
| 场馆 | 可选文本 | 拍摄场馆 |
| 类型 | 预设选项 + 自定义 | 无签、带签、主题、宿题 |
| 人数 | 预设选项 + 自定义 | 单人、双人、团切 |

## 数据结构变更

### PolaroidRecord 类型

```typescript
export interface PolaroidRecord {
  id: string
  idolName: string
  photoCount: number
  photoDate: string
  photoUri: string
  backPhotoUri?: string
  price?: number
  note?: string
  // 新增字段
  groupName?: string      // 团体
  city?: string           // 城市
  venue?: string          // 场馆
  polaroidType?: string   // 类型：无签、带签、主题、宿题 或自定义
  memberCount?: string    // 人数：单人、双人、团切 或自定义
  createdAt: number
  updatedAt: number
}
```

### PhotoItem 类型

```typescript
export interface PhotoItem {
  uri: string
  count: number
  backPhotoUri?: string
  price?: number
  note?: string
  // 新增字段
  groupName?: string
  city?: string
  venue?: string
  polaroidType?: string
  memberCount?: string
}
```

## 预设选项

### 拍立得类型

```typescript
export const POLAROID_TYPES = [
  '无签',
  '带签',
  '主题',
  '宿题',
] as const
```

### 拍立得人数

```typescript
export const MEMBER_COUNTS = [
  '单人',
  '双人',
  '团切',
] as const
```

## UI 设计

### 上传页面

每个照片项下方添加：

```
┌─────────────────────────────┐
│ [照片缩略图]  照片 1         │
│                              │
│ 团体: [    输入或选择    ]  │
│ 城市: [    输入或选择    ]  │
│ 场馆: [    输入或选择    ]  │
│ 类型: [无签 ▼] 或 [自定义] │
│ 人数: [单人 ▼] 或 [自定义] │
│ 价格: [    选填    ]        │
│ 备注: [    选填    ]        │
└─────────────────────────────┘
```

### 选择器组件

创建可复用的 `OptionsSelector` 组件：
- 支持预设选项快速选择
- 支持用户自定义输入
- 下拉选择 + 输入框组合

## 实现步骤

### 阶段一：类型定义和常量

1. 修改 `src/types/index.ts` 添加新字段
2. 创建 `src/constants/polaroidOptions.ts` 定义预设选项

### 阶段二：UI 组件

1. 创建 `src/components/common/OptionsSelector.tsx` 选择器组件
2. 创建 `src/components/features/PhotoFields.tsx` 照片字段组件（整合所有输入）

### 阶段三：页面修改

1. 修改 `UploadScreen.tsx` 添加新字段输入
2. 修改 `EditScreen.tsx` 支持编辑新字段
3. 修改 `DetailScreen.tsx` 显示新字段

### 阶段四：数据处理

1. 修改 `recordService.ts` 支持新字段保存
2. 考虑是否需要在统计页面展示新字段

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/types/index.ts` | 修改 | 添加新字段类型 |
| `src/constants/polaroidOptions.ts` | 新建 | 预设选项常量 |
| `src/components/common/OptionsSelector.tsx` | 新建 | 选择器组件 |
| `src/components/features/PhotoFields.tsx` | 新建 | 照片字段组件 |
| `src/screens/UploadScreen.tsx` | 修改 | 集成新字段 |
| `src/screens/EditScreen.tsx` | 修改 | 支持编辑新字段 |
| `src/screens/DetailScreen.tsx` | 修改 | 显示新字段 |

## 注意事项

1. 所有新字段均为可选，不影响现有数据
2. 预设选项存储为字符串，便于用户自定义
3. 考虑后续可能需要根据这些字段进行筛选/统计
4. UI 需要保持简洁，避免表单过于冗长
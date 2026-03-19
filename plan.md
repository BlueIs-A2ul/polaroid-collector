# Polaroid App 改进计划

## 概述

本文档记录项目当前存在的问题和待改进的功能点，供后续开发参考。

---

## 一、需要修复的问题

### 1. IdolCard 组件图片未显示

**问题描述**

`IdolCard` 组件接收 `latestPhoto` 参数，但未实际显示图片，只显示了一个图标。

**当前代码位置**

`src/components/features/IdolCard.tsx:43-49`

**当前实现**

```tsx
{latestPhoto ? (
  <View style={styles.photoPreview}>
    <Ionicons name='image' size={20} color={COLORS.PRIMARY} />
  </View>
) : (
  <Ionicons name='chevron-forward' size={20} color={COLORS.GRAY[400]} />
)}
```

**改进方案**

使用 `Image` 组件显示实际的缩略图：

```tsx
{latestPhoto ? (
  <Image source={{ uri: latestPhoto }} style={styles.thumbnail} />
) : (
  <Ionicons name='chevron-forward' size={20} color={COLORS.GRAY[400]} />
)}
```

**样式添加**

```tsx
thumbnail: {
  width: 48,
  height: 48,
  borderRadius: 8,
  resizeMode: 'cover',
}
```

**影响范围**

- `src/components/features/IdolCard.tsx`

**优先级**

高 - 直接影响用户体验

---

### 2. EditScreen 删除照片后无法恢复原图

**问题描述**

在编辑页面，如果用户删除了照片但未保存就返回，原图无法恢复。

**问题原因**

`photoUri` 状态被设置为 `null`，但 `originalPhotoUri` 未被用于恢复。

**改进方案**

方案 A：添加取消按钮，点击后恢复原始数据

```tsx
const handleCancel = () => {
  Alert.alert('放弃修改', '确定要放弃所有修改吗？', [
    { text: '继续编辑', style: 'cancel' },
    { text: '放弃', style: 'destructive', onPress: () => navigation.goBack() },
  ])
}
```

方案 B：照片删除时显示确认提示

```tsx
const handleRemovePhoto = () => {
  Alert.alert('删除照片', '确定要删除当前照片吗？', [
    { text: '取消', style: 'cancel' },
    {
      text: '删除',
      style: 'destructive',
      onPress: () => setPhotoUri(null),
    },
  ])
}
```

**影响范围**

- `src/screens/EditScreen.tsx`

**优先级**

中 - 影响用户体验但不影响功能

---

## 二、功能增强建议

### 3. 添加单元测试

**问题描述**

项目目前缺少测试文件，无法保证代码质量和回归测试。

**建议添加的测试**

| 测试文件 | 测试内容 |
|---------|---------|
| `src/__tests__/rankingUtils.test.ts` | 排行榜计算、日期排序、ID生成 |
| `src/__tests__/recordService.test.ts` | 记录 CRUD 操作 |
| `src/__tests__/storageService.test.ts` | AsyncStorage 操作 |

**测试框架选择**

- Jest + React Native Testing Library

**配置步骤**

1. 安装依赖

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

2. 添加测试脚本到 `package.json`

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

**示例测试代码**

```tsx
import { calculateRanking, sortRecordsByDate, generateId } from '../utils/rankingUtils'

describe('rankingUtils', () => {
  describe('calculateRanking', () => {
    it('should calculate total count per idol', () => {
      const records = [
        { id: '1', idolName: '偶像A', photoCount: 3, photoDate: '2026-01-01', photoUri: 'uri1', createdAt: 1, updatedAt: 1 },
        { id: '2', idolName: '偶像A', photoCount: 2, photoDate: '2026-01-02', photoUri: 'uri2', createdAt: 2, updatedAt: 2 },
        { id: '3', idolName: '偶像B', photoCount: 5, photoDate: '2026-01-01', photoUri: 'uri3', createdAt: 3, updatedAt: 3 },
      ]
      
      const ranking = calculateRanking(records)
      
      expect(ranking).toHaveLength(2)
      expect(ranking[0].idolName).toBe('偶像A')
      expect(ranking[0].totalCount).toBe(5)
      expect(ranking[1].totalCount).toBe(5)
    })
  })

  describe('sortRecordsByDate', () => {
    it('should sort records by date ascending', () => {
      const records = [
        { photoDate: '2026-03-01' },
        { photoDate: '2026-01-01' },
        { photoDate: '2026-02-01' },
      ]
      
      const sorted = sortRecordsByDate(records, true)
      
      expect(sorted[0].photoDate).toBe('2026-01-01')
      expect(sorted[2].photoDate).toBe('2026-03-01')
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^\d+-[a-z0-9]+$/)
    })
  })
})
```

**影响范围**

- 新增 `src/__tests__/` 目录
- 更新 `package.json`
- 新增 `jest.config.js`

**优先级**

中 - 提高代码质量，但非紧急

---

### 4. 照片压缩功能

**问题描述**

AsyncStorage 有大小限制（约 6MB），大量高清照片可能导致存储问题。

**当前实现**

```tsx
const result = await ImagePicker.launchCameraAsync({
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.8,  // 已有压缩，但可能不够
})
```

**改进方案**

1. 降低默认质量到 0.6

2. 添加图片尺寸限制

```tsx
const result = await ImagePicker.launchCameraAsync({
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.6,
})
```

3. 添加手动压缩服务

```tsx
import * as ImageManipulator from 'expo-image-manipulator'

export const compressPhoto = async (
  uri: string,
  maxWidth = 1024,
  quality = 0.6,
): Promise<ServiceResult<string>> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    )
    
    return {
      success: true,
      data: result.uri,
      error: null,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
```

4. 存储空间检查

```tsx
export const checkStorageSpace = async (): Promise<boolean> => {
  const { success, data: records } = await getAllRecords()
  if (!success || !records) return true
  
  const totalPhotos = records.length
  const estimatedSize = totalPhotos * 500 * 1024 // 假设每张 500KB
  const warningThreshold = 5 * 1024 * 1024 // 5MB
  
  return estimatedSize < warningThreshold
}
```

**需要安装的依赖**

```bash
npx expo install expo-image-manipulator
```

**影响范围**

- `src/services/photoService.ts` - 添加压缩函数
- `src/screens/UploadScreen.tsx` - 使用压缩
- `src/screens/EditScreen.tsx` - 使用压缩

**优先级**

中 - 对于长期使用重要，但不影响基本功能

---

## 三、体验优化建议

### 5. 添加加载骨架屏

**问题描述**

目前使用 `LoadingSpinner` 显示加载状态，用户体验可以更好。

**改进方案**

使用骨架屏替代简单的加载动画。

**示例实现**

```tsx
const IdolCardSkeleton: React.FC = () => (
  <View style={styles.container}>
    <View style={styles.avatarSkeleton} />
    <View style={styles.textSkeleton} />
  </View>
)
```

**优先级**

低 - 体验优化，非必要

---

### 6. 添加下拉刷新

**问题描述**

首页只能通过点击刷新按钮刷新数据，缺少下拉刷新手势。

**改进方案**

使用 `RefreshControl` 添加下拉刷新：

```tsx
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[COLORS.PRIMARY]}
    />
  }
>
```

**影响范围**

- `src/screens/HomeScreen.tsx`
- `src/screens/DetailScreen.tsx`

**优先级**

低 - 体验优化

---

### 7. 添加照片全屏预览

**问题描述**

点击照片无法放大查看，只能在小卡片中预览。

**改进方案**

添加照片全屏预览模态框，支持缩放手势。

可使用 `react-native-image-zoom-viewer` 或自定义实现。

**优先级**

低 - 体验优化

---

## 四、实施优先级

| 优先级 | 问题 | 预计工时 |
|--------|------|----------|
| 高 | IdolCard 图片显示 | 0.5 小时 |
| 中 | EditScreen 照片恢复 | 1 小时 |
| 中 | 照片压缩功能 | 2 小时 |
| 中 | 单元测试 | 4 小时 |
| 低 | 骨架屏 | 2 小时 |
| 低 | 下拉刷新 | 1 小时 |
| 低 | 全屏预览 | 3 小时 |

---

## 五、下一步行动

1. **立即修复**：IdolCard 图片显示问题
2. **短期改进**：EditScreen 照片恢复、照片压缩
3. **中期规划**：添加单元测试
4. **长期优化**：骨架屏、下拉刷新、全屏预览

---

**文档创建日期**: 2026-03-19  
**最后更新**: 2026-03-19
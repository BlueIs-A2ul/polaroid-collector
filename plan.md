# Polaroid App 开发计划

## 📋 项目概述

一个用于收集、分类和管理偶像拍立得的移动应用，支持本地存储，无需服务器费用。

## 🎯 核心需求

### 1. 数据存储

- **本地存储**：使用 AsyncStorage 存储所有数据
- **无需服务器**：完全本地化，节省成本

### 2. 拍立得上传

- **多种照片来源**：
  - 直接使用相机拍照
  - 从手机相册选择已有照片
- **上传信息记录**：
  - 合影的偶像名称
  - 拍立得数量
  - 拍摄日期

### 3. 数据管理

- **完整的 CRUD 操作**：
  - 创建：上传新的拍立得记录
  - 读取：查看拍立得记录和统计数据
  - 更新：编辑已有的拍立得记录
  - 删除：删除拍立得记录

### 4. 首页功能

- **偶像排行榜**：直接在首页展示
- **排序规则**：按偶像的拍立得总数进行降序排列
- **交互方式**：点击偶像卡片查看详细信息

### 5. 详情页面

- **卡片展示**：每个偶像显示为一个卡片
- **卡片内容**：
  - 偶像名称
  - 总拍立得数量
  - 缩略图展示（最近的一张或代表性照片）
  - 拍摄日期记录
- **排序功能**：
  - 按拍摄日期正序排序
  - 按拍摄日期逆序排序
- **详情查看**：点击卡片展开查看该偶像的所有拍立得记录

### 6. 数据规则

- **单次上传**：用户一次只上传同一天的合影记录
- **合并统计**：排行榜按偶像名称合并统计所有拍立得总数
- **多记录支持**：同一个偶像可以有多次不同日期的合影记录

## 🏗️ 技术架构

### 技术栈

- **React Native**: 0.83.2
- **Expo**: ~55.0.8
- **AsyncStorage**: 本地数据存储
- **expo-image-picker**: 图片选择（相机/相册）
- **expo-file-system**: 文件系统操作
- **@expo/vector-icons**: 图标库

### 数据结构设计

```javascript
// 拍立得记录结构
{
  id: string,                    // 唯一标识
  idolName: string,              // 偶像名称
  photoCount: number,            // 拍立得数量
  photoDate: string,             // 拍摄日期 (YYYY-MM-DD)
  photoUri: string,              // 照片存储路径
  createdAt: timestamp,          // 创建时间
  updatedAt: timestamp           // 更新时间
}

// 排行榜数据结构（计算生成）
{
  idolName: string,              // 偶像名称
  totalCount: number,            // 总拍立得数量
  records: array,                // 该偶像的所有记录
  latestPhoto: string,           // 最新照片URI（用于缩略图）
  dates: array                   // 所有拍摄日期
}
```

### 数据管理策略

- **存储方案**：将照片转为 Base64 或使用本地文件系统
- **数据持久化**：AsyncStorage 存储记录元数据，本地文件系统存储照片
- **性能优化**：排行榜样数据在内存中计算，异步加载照片

## 📱 页面结构

### 1. 首页 (Home)

**功能**：

- 顶部标题和导航
- 偶像排行榜展示
- 拍立得统计概览
- 快捷操作按钮（上传、相册等）

**组件**：

- Header：应用标题
- IdolRankingList：偶像排行榜样表
- QuickActions：快捷操作按钮
- StatsOverview：统计概览卡片

### 2. 上传页面 (Upload)

**功能**：

- 选择照片来源（相机/相册）
- 拍照或选择照片
- 填写上传表单：
  - 偶像名称（输入框）
  - 拍立得数量（数字输入）
  - 拍摄日期（日期选择器）
- 预览照片
- 保存记录

**组件**：

- PhotoSelector：照片选择组件
- UploadForm：上传表单
- PhotoPreview：照片预览
- SaveButton：保存按钮

### 3. 详情页面 (Detail)

**功能**：

- 显示偶像的详细信息
- 拍立得记录列表
- 排序切换（正序/逆序）
- 查看具体拍立得照片
- 编辑和删除功能

**组件**：

- IdolInfoCard：偶像信息卡片
- RecordList：记录列表
- SortToggle：排序切换按钮
- RecordItem：单条记录卡片
- ActionButtons：编辑/删除按钮

### 4. 编辑页面 (Edit)

**功能**：

- 编辑已有记录
- 修改照片
- 更新信息
- 保存更改

**组件**：

- EditForm：编辑表单
- PhotoEditor：照片编辑
- UpdateButton：更新按钮

## 🎨 UI/UX 设计

### 设计风格

- **主题色**：拍立得棕色 (#8B4513) 和米色 (#F5F5DC)
- **卡片设计**：白色卡片带阴影，模仿拍立得照片效果
- **图标**：使用 Ionicons 图标库
- **字体**：清晰易读，标题加粗

### 交互设计

- **按钮**：圆角按钮，带图标
- **列表**：可点击的卡片，带点击反馈
- **表单**：清晰的标签和输入提示
- **加载状态**：数据加载时显示加载指示器

## 📝 开发步骤

### Phase 1: 数据层开发

- [ ] 安装必要的依赖包
  - `@react-native-async-storage/async-storage`
  - `expo-image-picker`
  - `expo-file-system`
  - `expo-constants`
- [ ] 设计数据结构
- [ ] 实现数据存储服务
  - 存储拍立得记录
  - 读取拍立得记录
  - 更新拍立得记录
  - 删除拍立得记录
- [ ] 实现照片存储服务
  - 照片转为 Base64
  - 照片本地存储
  - 照片读取和删除

### Phase 2: 核心功能开发

- [ ] 实现拍立得上传功能
  - 照片选择（相机/相册）
  - 表单输入
  - 数据验证
  - 保存记录
- [ ] 实现数据查询功能
  - 按偶像名称查询
  - 按日期查询
  - 排行榜计算
- [ ] 实现数据管理功能
  - 编辑记录
  - 删除记录

### Phase 3: UI 开发

- [ ] 重构首页
  - 添加偶像排行榜样表
  - 添加统计概览
  - 优化布局
- [ ] 开发上传页面
  - 照片选择界面
  - 表单界面
  - 预览界面
- [ ] 开发详情页面
  - 偶像信息展示
  - 记录列表展示
  - 排序功能
- [ ] 开发编辑页面
  - 编辑表单
  - 照片修改
  - 数据更新

### Phase 4: 优化和完善

- [ ] 添加错误处理
- [ ] 添加空状态提示
- [ ] 优化性能
- [ ] 添加加载状态
- [ ] 完善用户体验
- [ ] 测试所有功能

### Phase 5: 测试和修复

- [ ] 功能测试
- [ ] 边界情况测试
- [ ] 性能测试
- [ ] 修复bug

## 🔧 关键技术点

### 1. 照片存储

```javascript
// 方案1：Base64 存储（适合小照片）
const savePhotoBase64 = async uri => {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  })
  return base64
}

// 方案2：本地文件存储（适合大照片）
const savePhotoToLocal = async uri => {
  const filename = `${Date.now()}.jpg`
  const fileUri = `${FileSystem.documentDirectory}${filename}`
  await FileSystem.copyAsync({ from: uri, to: fileUri })
  return fileUri
}
```

### 2. 排行榜计算

```javascript
const calculateRanking = records => {
  const idolStats = {}

  records.forEach(record => {
    if (!idolStats[record.idolName]) {
      idolStats[record.idolName] = {
        idolName: record.idolName,
        totalCount: 0,
        records: [],
        latestPhoto: null,
        dates: [],
      }
    }
    idolStats[record.idolName].totalCount += record.photoCount
    idolStats[record.idolName].records.push(record)
    idolStats[record.idolName].dates.push(record.photoDate)

    if (
      !idolStats[record.idolName].latestPhoto ||
      record.photoDate > idolStats[record.idolName].latestDate
    ) {
      idolStats[record.idolName].latestPhoto = record.photoUri
      idolStats[record.idolName].latestDate = record.photoDate
    }
  })

  return Object.values(idolStats).sort((a, b) => b.totalCount - a.totalCount)
}
```

### 3. 日期排序

```javascript
const sortRecordsByDate = (records, ascending = true) => {
  return [...records].sort((a, b) => {
    const dateA = new Date(a.photoDate)
    const dateB = new Date(b.photoDate)
    return ascending ? dateA - dateB : dateB - dateA
  })
}
```

## ⚠️ 注意事项

### 存储限制

- AsyncStorage 有大小限制（约 6MB）
- 大量照片使用文件系统存储
- 考虑添加照片压缩功能

### 用户体验

- 上传大照片时需要进度提示
- 列表加载时需要懒加载
- 照片预览需要缓存机制

### 数据备份

- 考虑添加导出功能（JSON格式）
- 提供数据恢复选项
- 定期提醒用户备份数据

## 📅 时间估算

- Phase 1: 数据层开发 - 1-2天
- Phase 2: 核心功能开发 - 2-3天
- Phase 3: UI 开发 - 3-4天
- Phase 4: 优化和完善 - 1-2天
- Phase 5: 测试和修复 - 1天

**总计**: 8-12天

## 🎉 完成标准

1. 用户可以成功上传拍立得记录（相机/相册）
2. 首页正确显示偶像排行榜（按拍立得总数降序）
3. 点击偶像可以查看详细信息
4. 详情页面支持按日期正序/逆序排序
5. 所有 CRUD 功能正常工作
6. 数据正确存储在本地
7. UI 美观，用户体验良好
8. 无严重 bug

---

**下一步**: 确认计划后，开始 Phase 1 的开发工作。

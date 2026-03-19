# Polaroid App 开发规范

## 📚 文档概述

本文档定义了 Polaroid App 项目的开发规范和最佳实践，确保代码风格统一、可维护性高，便于团队协作和后期维护。

---

## 🎯 代码风格规范

### JavaScript/React Native 代码风格

#### 基本规范

- 使用 **单引号** 而非双引号
- **不使用分号**（遵循项目现有风格）
- 使用 **2 空格缩进**
- 使用 **箭头函数**（ES6+）
- 使用 **const/let**，禁止使用 **var**

```javascript
// ✅ 正确
const fetchData = async () => {
  const result = await apiCall()
  return result
}

// ❌ 错误
function fetchData() {
  var result = apiCall()
  return result
}
```

#### 对象和数组

- 对象属性最后一项**不加尾随逗号**
- 数组项最后一项**不加尾随逗号**

```javascript
// ✅ 正确
const user = {
  name: 'John',
  age: 25,
}

const items = ['apple', 'banana', 'orange']

// ❌ 错误
const user = {
  name: 'John',
  age: 25,
}

const items = ['apple', 'banana', 'orange']
```

#### 函数参数

- 多行参数时，每个参数独占一行

```javascript
// ✅ 正确
const createRecord = (idolName, photoCount, photoDate) => {
  // ...
}

// ❌ 错误
const createRecord = (idolName, photoCount, photoDate) => {
  // ...
}
```

---

## 📁 文件组织结构

### 项目目录结构

```
polaroid-app/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── common/          # 通用组件
│   │   └── features/        # 功能特定组件
│   ├── screens/             # 页面组件
│   ├── services/            # 业务逻辑服务
│   ├── utils/               # 工具函数
│   ├── constants/           # 常量定义
│   ├── hooks/               # 自定义 Hooks
│   ├── contexts/            # React Context
│   ├── navigation/          # 导航配置
│   └── types/               # TypeScript 类型定义（如使用）
├── assets/                  # 静态资源
├── App.js                   # 应用入口
└── index.js                 # 注册入口
```

### 文件命名规范

- **组件文件**：PascalCase（如 `IdolCard.js`）
- **工具函数**：camelCase（如 `dateUtils.js`）
- **常量文件**：camelCase（如 `themeColors.js`）
- **页面文件**：PascalCase（如 `HomeScreen.js`）
- **服务文件**：camelCase（如 `storageService.js`）

---

## 🏷️ 命名规范

### 变量命名

- 使用 **camelCase**
- 变量名要有语义，能清楚表达用途

```javascript
// ✅ 正确
const idolName = 'Taylor Swift'
const photoCount = 5
const uploadDate = new Date()

// ❌ 错误
const id = 'Taylor Swift'
const n = 5
const d = new Date()
```

### 常量命名

- 使用 **UPPER_SNAKE_CASE**
- 常量定义在单独的文件中

```javascript
// ✅ 正确
const STORAGE_KEY = 'polaroid_records'
const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5MB

// ❌ 错误
const storageKey = 'polaroid_records'
const maxPhotoSize = 5 * 1024 * 1024
```

### 函数命名

- 使用 **camelCase**
- 函数名以动词开头，表达动作

```javascript
// ✅ 正确
const saveRecord = async record => {}
const getRecords = async () => {}
const deleteRecord = async id => {}
const formatDate = date => {}

// ❌ 错误
const record = async record => {}
const records = async () => {}
const recordDelete = async id => {}
```

### 组件命名

- 使用 **PascalCase**
- 组件名要描述性强

```javascript
// ✅ 正确
const IdolCard = () => {}
const UploadForm = () => {}
const RankingList = () => {}

// ❌ 错误
const idolCard = () => {}
const Form = () => {}
const List = () => {}
```

### React Hooks 命名

- 自定义 Hooks 以 **use** 开头，使用 **camelCase**

```javascript
// ✅ 正确
const useRecords = () => {}
const usePhotoUpload = () => {}

// ❌ 错误
const getRecords = () => {}
const uploadPhoto = () => {}
```

---

## 🧩 组件开发规范

### 组件结构

```javascript
// 1. 导入语句
import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// 2. 类型定义（如使用 TypeScript）
// interface Props { ... }

// 3. 常量定义
const COLORS = {
  PRIMARY: '#8B4513',
  SECONDARY: '#F5F5DC',
}

// 4. 组件定义
const MyComponent = ({ prop1, prop2 }) => {
  // 5. Hooks
  const [state, setState] = useState(null)

  // 6. 副作用
  useEffect(() => {
    // ...
  }, [])

  // 7. 处理函数
  const handlePress = () => {
    // ...
  }

  // 8. 渲染
  return (
    <View>
      <Text>Hello</Text>
    </View>
  )
}

// 9. 样式定义
const styles = StyleSheet.create({
  container: {
    // ...
  },
})

// 10. 导出
export default MyComponent
```

### 组件 Props 规范

- Props 使用解构
- 必需参数放在前面，可选参数放在后面
- 为 Props 添加注释说明

```javascript
// ✅ 正确
const IdolCard = ({
  idolName,
  totalCount,
  thumbnailUrl,
  onPress
}) => {
  return (
    // ...
  )
}

// ✅ 带注释
const IdolCard = ({
  /** 偶像名称 */
  idolName,
  /** 拍立得总数 */
  totalCount,
  /** 缩略图URL */
  thumbnailUrl,
  /** 点击事件处理函数 */
  onPress
}) => {
  return (
    // ...
  )
}
```

### 组件拆分原则

- 单一职责：每个组件只负责一个功能
- 组件不超过 300 行
- 复杂逻辑拆分为自定义 Hook
- 重复 UI 抽取为独立组件

---

## 💾 数据处理规范

### 数据结构定义

```javascript
// 在 constants/dataStructures.js 中定义

// 拍立得记录结构
export const RECORD_STRUCTURE = {
  id: 'string',
  idolName: 'string',
  photoCount: 'number',
  photoDate: 'string', // YYYY-MM-DD
  photoUri: 'string',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
}

// 排行榜数据结构
export const RANKING_STRUCTURE = {
  idolName: 'string',
  totalCount: 'number',
  records: 'array',
  latestPhoto: 'string',
  dates: 'array',
}
```

### 异步函数规范

- 所有异步函数都要有错误处理
- 使用 try-catch 包装异步操作
- 返回统一的数据格式：`{ success: boolean, data: any, error: string }`

```javascript
// ✅ 正确
const saveRecord = async record => {
  try {
    const savedRecord = await storageService.save(record)
    return {
      success: true,
      data: savedRecord,
      error: null,
    }
  } catch (error) {
    console.error('保存记录失败:', error)
    return {
      success: false,
      data: null,
      error: error.message,
    }
  }
}

// ❌ 错误（缺少错误处理）
const saveRecord = async record => {
  const savedRecord = await storageService.save(record)
  return savedRecord
}
```

### 数据验证

```javascript
// 在 utils/validators.js 中定义

export const validateRecord = record => {
  const errors = []

  if (!record.idolName || record.idolName.trim() === '') {
    errors.push('偶像名称不能为空')
  }

  if (!record.photoCount || record.photoCount <= 0) {
    errors.push('拍立得数量必须大于0')
  }

  if (!record.photoDate) {
    errors.push('拍摄日期不能为空')
  }

  if (!record.photoUri) {
    errors.push('照片不能为空')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
```

---

## ⚠️ 错误处理规范

### 错误处理策略

1. **用户友好提示**：向用户显示易懂的错误信息
2. **日志记录**：在控制台记录详细的错误信息
3. **优雅降级**：错误发生时提供替代方案
4. **错误边界**：使用 Error Boundary 捕获组件错误

```javascript
// ✅ 正确的错误处理
const handleUpload = async () => {
  try {
    const result = await uploadPhoto()
    if (result.success) {
      Alert.alert('成功', '照片上传成功')
    } else {
      Alert.alert('失败', result.error || '上传失败，请重试')
    }
  } catch (error) {
    console.error('上传异常:', error)
    Alert.alert('错误', '发生未知错误，请联系开发者')
  }
}
```

### Alert 使用规范

- 成功操作：绿色提示
- 错误操作：红色提示
- 警告信息：黄色提示
- 信息提示：蓝色提示

```javascript
// ✅ 正确
Alert.alert('确认删除', '确定要删除这条记录吗？', [
  { text: '取消', style: 'cancel' },
  { text: '删除', style: 'destructive', onPress: () => deleteRecord() },
])
```

---

## 📝 注释规范

### 单行注释

- 使用 `//` 注释
- 注释在代码上方，与代码对齐
- 注释内容简洁明了

```javascript
// 计算排行榜数据
const calculateRanking = records => {
  // ...
}
```

### 多行注释

- 使用 `/* */` 或多行 `//`
- 用于复杂逻辑的说明

```javascript
// 这个函数计算每个偶像的拍立得总数
// 并按总数降序排列，返回排行榜数据
const calculateRanking = records => {
  // ...
}
```

### JSDoc 注释

- 为公共函数添加 JSDoc 注释
- 说明参数、返回值、异常

```javascript
/**
 * 保存拍立得记录到本地存储
 * @param {Object} record - 要保存的记录
 * @param {string} record.id - 记录唯一标识
 * @param {string} record.idolName - 偶像名称
 * @param {number} record.photoCount - 拍立得数量
 * @param {string} record.photoDate - 拍摄日期
 * @param {string} record.photoUri - 照片URI
 * @returns {Promise<Object>} 保存结果
 * @throws {Error} 保存失败时抛出异常
 */
const saveRecord = async record => {
  // ...
}
```

### TODO 注释

- 使用 `// TODO:` 标记待完成事项
- 标记负责人和截止日期（可选）

```javascript
// TODO: 添加照片压缩功能以减少存储空间
// TODO: [John] 2024-03-20 - 添加数据导出功能
```

---

## 🎨 样式规范

### StyleSheet 使用

- 使用 `StyleSheet.create` 定义样式
- 样式名称使用 **camelCase**
- 相关样式按逻辑分组

```javascript
const styles = StyleSheet.create({
  // 容器样式
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },

  // 文本样式
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },

  // 按钮样式
  button: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
})
```

### 颜色常量

- 在 `constants/themeColors.js` 中定义颜色常量
- 使用语义化的颜色名称

```javascript
// constants/themeColors.js
export const COLORS = {
  PRIMARY: '#8B4513',
  SECONDARY: '#F5F5DC',
  SUCCESS: '#4CAF50',
  ERROR: '#F44336',
  WARNING: '#FF9800',
  INFO: '#2196F3',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: {
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
}
```

### 间距规范

- 使用统一的间距单位（4的倍数）
- 在 `constants/spacings.js` 中定义

```javascript
// constants/spacings.js
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
  XXXL: 32,
}
```

---

## 🔀 Git 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响代码逻辑）
- `refactor`: 重构（不是新功能，也不是修复 bug）
- `test`: 测试相关
- `chore`: 构建/工具链相关

### 提交示例

```bash
# ✅ 正确
feat(storage): 添加照片本地存储功能
fix(upload): 修复照片上传失败的问题
docs(readme): 更新 README 文档
style(app): 调整代码格式

# ❌ 错误
添加存储功能
修复bug
update
```

### 分支命名

- `feature/<功能名称>`: 新功能开发
- `fix/<问题描述>`: bug 修复
- `hotfix/<紧急修复>`: 紧急修复
- `refactor/<重构内容>`: 重构

---

## 🧪 测试规范

### 测试文件命名

- 测试文件名与源文件相同，添加 `.test.js` 后缀
- 例如：`storageService.test.js`

### 测试覆盖

- 核心业务逻辑测试覆盖率 ≥ 80%
- 关键功能必须有单元测试
- 集成测试覆盖主要用户流程

---

## 📚 最佳实践

### 性能优化

1. 使用 `React.memo` 避免不必要的重新渲染
2. 使用 `useCallback` 和 `useMemo` 缓存函数和计算结果
3. 长列表使用 `FlatList` 而非 `ScrollView`
4. 图片使用缓存和懒加载
5. 避免在 render 中创建新对象和函数

### 可访问性

1. 为所有交互元素添加 `accessibilityLabel`
2. 使用语义化组件
3. 确保足够的点击区域（至少 44x44）
4. 支持屏幕阅读器

### 安全性

1. 敏感数据不存储在 AsyncStorage 中
2. 用户输入要进行验证和清理
3. 避免在客户端存储密码等敏感信息
4. 使用 HTTPS 进行网络请求

---

## ✅ 代码审查检查清单

在提交代码前，确保：

- [ ] 代码符合本规范的所有要求
- [ ] 没有调试代码（console.log、debugger）
- [ ] 没有注释掉的代码
- [ ] 所有函数都有适当的错误处理
- [ ] 复杂逻辑有注释说明
- [ ] 组件和函数命名清晰
- [ ] 没有重复代码
- [ ] 样式使用常量而非魔法数字
- [ ] 异步函数都有 await
- [ ] Git 提交信息清晰规范

---

## 🔧 开发工具配置

### 推荐的 VS Code 扩展

- ESLint: 代码检查
- Prettier: 代码格式化
- React Native Tools: React Native 开发支持
- Auto Rename Tag: 自动重命名标签
- Bracket Pair Colorizer: 括号颜色高亮

### ESLint 配置建议

```javascript
// .eslintrc.js
module.exports = {
  extends: ['react-native'],
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    indent: ['error', 2],
    'no-trailing-spaces': 'error',
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'comma-dangle': ['error', 'never'],
  },
}
```

---

## 📖 参考资料

- [React Native 官方文档](https://reactnative.dev/)
- [Expo 官方文档](https://docs.expo.dev/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

**最后更新**: 2026-03-19

**维护者**: Cline

如有问题或建议，请及时更新本文档以保持开发规范的有效性。

# P1/P2 代码结构优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成 P0 之外的代码结构优化：报告类型与运行时解耦、hooks 错误处理统一、移除 recordService 兼容层、ServiceResult 去 any 默认、导航动画抽常量、latestPhoto 类型口径统一。

**Architecture:** 全部为类型/结构重构，无行为变化（Task 2 的 useRecords 错误处理除外——统计失败不再静默吞错，改为与排行一致地写入 error state）。

**Tech Stack:** React Native, TypeScript 5.9, Jest。

**前置事实（已核实）：**
- `ServiceResult` 全部 75 处使用均带类型参数，仅定义处有 `= any` 默认 → 去默认零风险
- `recordService.ts` re-export 的 `getTodayDateString`/`formatDate` 无任何消费者（各页面均直接从 `utils/rankingUtils` 导入）
- `IdolDetail.latestPhoto`（`string`）无实际消费者（页面用 `RankingItem.latestPhoto` 或 avatar），统一为 `string | null` 零风险
- `recordServiceBoundaries.test.ts` 直接测试分拆服务，不依赖 `recordService.ts` 聚合层

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `src/types/report.ts` | 新建 | `YearlyReport` / `IdolReport` 类型定义 |
| `src/services/reportService.ts` | 修改 | 删除接口定义，`import type` |
| `src/services/idolReportService.ts` | 修改 | 删除接口定义，`import type` |
| `src/screens/YearlyReportEntryScreen.tsx` | 修改 | 类型改从 `types/report` 导入 |
| `src/screens/YearlyReportScreen.tsx` | 修改 | 同上 |
| `src/screens/IdolReportScreen.tsx` | 修改 | 同上 |
| `src/hooks/useRecords.ts` | 修改 | 错误处理统一 |
| `src/services/recordService.ts` | 删除 | 兼容层移除 |
| `src/screens/DetailScreen.tsx` | 修改 | 改从 `recordCommandService` 导入 |
| `src/screens/EditScreen.tsx` | 修改 | 同上 |
| `src/screens/StatisticsScreen.tsx` | 修改 | 改从 `recordQueryService`/`recordStatsService` 导入 |
| `src/screens/UploadScreen.tsx` | 修改 | 改从 `recordCommandService` 导入 |
| `src/components/features/IdolSelector.tsx` | 修改 | 改从 `recordQueryService` 导入 |
| `src/types/index.ts` | 修改 | `ServiceResult<T>` 去 any；`IdolDetail.latestPhoto` 统一为 `string \| null` |
| `src/navigation/AppNavigator.tsx` | 修改 | 转场动画抽为模块常量 |

---

## Task 1: 报告类型解耦（挪到 src/types/report.ts）

**Files:**
- Create: `src/types/report.ts`
- Modify: `src/services/reportService.ts` / `src/services/idolReportService.ts`
- Modify: `src/screens/YearlyReportEntryScreen.tsx` / `YearlyReportScreen.tsx` / `IdolReportScreen.tsx`

- [ ] **Step 1: 新建 `src/types/report.ts`**

```ts
export interface YearlyReport {
  year: number
  totalRecords: number
  totalPhotos: number
  totalPrice: number
  newIdols: string[]
  topIdols: Array<{ name: string; count: number; price: number }>
  topCities: Array<{ name: string; count: number }>
  topVenues: Array<{ name: string; count: number }>
  monthlyData: Array<{ month: number; records: number; photos: number; price: number }>
  firstRecord: { idolName: string; date: string } | null
  mostExpensiveRecord: { idolName: string; price: number; date: string } | null
  averagePrice: number
  totalDays: number
  favoriteDayOfWeek: { day: string; count: number }
}

export interface IdolReport {
  idolName: string
  totalRecords: number
  totalPhotos: number
  totalPrice: number
  averagePrice: number
  firstRecord: { date: string; price?: number } | null
  latestRecord: { date: string } | null
  mostExpensiveRecord: { date: string; price: number; photoCount: number } | null
  cheapestRecord: { date: string; price: number; photoCount: number } | null
  topCities: Array<{ name: string; count: number }>
  topVenues: Array<{ name: string; count: number }>
  topGroups: Array<{ name: string; count: number }>
  monthlyData: Array<{ month: string; photos: number; price: number }>
  favoriteDayOfWeek: { day: string; count: number }
  favoriteMonth: { month: string; count: number }
  polaroidTypes: Array<{ type: string; count: number }>
  daysSinceFirst: number
  daysSinceLast: number
  averageDaysBetween: number
  totalDaysWithRecords: number
}
```

- [ ] **Step 2: 修改 `src/services/reportService.ts`**

删除第 4-44 行的 `export interface YearlyReport {...}`，import 区改为：

```ts
import { getAllRecords } from './storageService'
import { PolaroidRecord, ServiceResult } from '../types'
import type { YearlyReport } from '../types/report'
```

其余代码不变（`getYearlyReport`/`getAvailableYears` 签名保持 `ServiceResult<YearlyReport>`）。

- [ ] **Step 3: 修改 `src/services/idolReportService.ts`**

删除第 4-60 行的 `export interface IdolReport {...}`，import 区改为：

```ts
import { getRecordsByIdolName } from './storageService'
import { PolaroidRecord, ServiceResult } from '../types'
import type { IdolReport } from '../types/report'
```

- [ ] **Step 4: 修改 3 个报告页面**

`src/screens/YearlyReportEntryScreen.tsx` 第 12 行：

```ts
import { getYearlyReport, getAvailableYears } from '../services/reportService'
import type { YearlyReport } from '../types/report'
```

`src/screens/YearlyReportScreen.tsx` 第 16 行：

```ts
import type { YearlyReport } from '../types/report'
```

`src/screens/IdolReportScreen.tsx` 第 17 行：

```ts
import { getIdolReport } from '../services/idolReportService'
import type { IdolReport } from '../types/report'
```

- [ ] **Step 5: 验证并提交**

Run: `npm run typecheck` → Expected: PASS
Run: `npm test -- --runInBand` → Expected: PASS（43 用例）

```bash
git add src/types/report.ts src/services/reportService.ts src/services/idolReportService.ts src/screens/YearlyReportEntryScreen.tsx src/screens/YearlyReportScreen.tsx src/screens/IdolReportScreen.tsx
git commit -m "refactor: 报告类型移至 src/types/report 与运行时解耦"
```

---

## Task 2: useRecords 错误处理统一

**Files:**
- Modify: `src/hooks/useRecords.ts`

- [ ] **Step 1: 修改 `refreshStatistics`**

```ts
  const refreshStatistics = useCallback(async () => {
    try {
      const { success, data, error: err } = await getStatistics()

      if (success) {
        setStatistics(data)
      } else {
        setError(err)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [])
```

（原实现：失败分支与 catch 只 `console.error`，不写入 `error` state。改为与 `refreshRanking` 一致地写入 `setError`。`HomeScreen` 第 258 行已有 `if (error)` 错误展示，统计失败将同样显示。）

- [ ] **Step 2: 验证并提交**

Run: `npm run typecheck` → Expected: PASS
Run: `npm test -- --runInBand` → Expected: PASS（43 用例）

```bash
git add src/hooks/useRecords.ts
git commit -m "fix: useRecords 统计加载失败不再静默，统一写入 error"
```

---

## Task 3: 删除 recordService 兼容层

**Files:**
- Modify: `src/screens/DetailScreen.tsx` / `EditScreen.tsx` / `StatisticsScreen.tsx` / `UploadScreen.tsx` / `src/components/features/IdolSelector.tsx` / `src/hooks/useRecords.ts`
- Delete: `src/services/recordService.ts`

- [ ] **Step 1: 迁移 6 个消费方的导入**

| 文件 | 原导入 | 改为 |
|------|--------|------|
| `src/screens/DetailScreen.tsx` | `import { updateRecordData } from '../services/recordService'` | `import { updateRecordData } from '../services/recordCommandService'` |
| `src/screens/EditScreen.tsx` | `import { updateRecordData, deleteRecordData } from '../services/recordService'` | `import { updateRecordData, deleteRecordData } from '../services/recordCommandService'` |
| `src/screens/StatisticsScreen.tsx` | `import { getRanking, getStatistics, getMonthlySpending } from '../services/recordService'` | `import { getRanking } from '../services/recordQueryService'` + `import { getStatistics, getMonthlySpending } from '../services/recordStatsService'` |
| `src/screens/UploadScreen.tsx` | `import { createRecord, createMultipleRecords } from '../services/recordService'` | `import { createRecord, createMultipleRecords } from '../services/recordCommandService'` |
| `src/components/features/IdolSelector.tsx` | `import { getIdolListWithCount } from '../../services/recordService'` | `import { getIdolListWithCount } from '../../services/recordQueryService'` |
| `src/hooks/useRecords.ts` | `import { getRanking, getIdolDetail, getStatistics } from '../services/recordService'` | `import { getRanking, getIdolDetail } from '../services/recordQueryService'` + `import { getStatistics } from '../services/recordStatsService'` |

- [ ] **Step 2: 删除 `src/services/recordService.ts`**

```bash
git rm src/services/recordService.ts
```

- [ ] **Step 3: 确认无残留引用**

Run: `Select-String -Path (Get-ChildItem -Recurse -File src -Include *.ts,*.tsx).FullName -Pattern "services/recordService'" | Select-Object Path, LineNumber`
Expected: 无输出（仅 `recordServiceBoundaries.test.ts` 的测试名不含该引用）

- [ ] **Step 4: 验证并提交**

Run: `npm run typecheck` → Expected: PASS
Run: `npm test -- --runInBand` → Expected: PASS（43 用例）

```bash
git add src/screens src/components/features/IdolSelector.tsx src/hooks/useRecords.ts
git commit -m "refactor: 移除 recordService 兼容层，消费方直连分拆服务"
```

---

## Task 4: ServiceResult 去 any 默认

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: 修改定义**

```ts
export interface ServiceResult<T> {
  success: boolean
  data: T | null
  error: string | null
}
```

（已核实全部 75 处使用均显式传类型参数。）

- [ ] **Step 2: 验证并提交**

Run: `npm run typecheck` → Expected: PASS

```bash
git add src/types/index.ts
git commit -m "refactor: ServiceResult 移除 any 默认类型参数"
```

---

## Task 5: 导航动画抽常量 + latestPhoto 类型统一

**Files:**
- Modify: `src/navigation/AppNavigator.tsx`
- Modify: `src/types/index.ts`

- [ ] **Step 1: `AppNavigator.tsx` 抽出转场动画常量**

import 区添加：

```ts
import type { StackCardStyleInterpolator } from '@react-navigation/stack'
```

`const Stack = createStackNavigator<RootStackParamList>()` 之后添加模块级常量：

```ts
const slideFadeInterpolator: StackCardStyleInterpolator = ({ current, layouts }) => ({
  cardStyle: {
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width, 0],
        }),
      },
    ],
    opacity: current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    }),
  },
})
```

`screenOptions` 中 `cardStyleInterpolator: ({ current, layouts }) => ({...})` 整块替换为：

```ts
cardStyleInterpolator: slideFadeInterpolator,
```

- [ ] **Step 2: `types/index.ts` 统一 latestPhoto 口径**

```ts
export interface IdolDetail {
  idolName: string
  totalCount: number
  totalPrice: number
  records: PolaroidRecord[]
  latestPhoto: string | null
  totalRecords: number
}
```

（`RankingItem.latestPhoto` 已是 `string | null`；`IdolDetail.latestPhoto` 已核实无消费者，`recordQueryService` 第 89 行 `string` 赋值兼容。）

- [ ] **Step 3: 验证并提交**

Run: `npm run typecheck` → Expected: PASS
Run: `npm test -- --runInBand` → Expected: PASS（43 用例）

```bash
git add src/navigation/AppNavigator.tsx src/types/index.ts
git commit -m "refactor: 导航转场动画抽为常量并统一 latestPhoto 类型口径"
```

---

## 完成标准

- [ ] `npm run typecheck` 通过
- [ ] `npm test -- --runInBand` 通过（43 用例）
- [ ] `src/services/recordService.ts` 已删除且无引用
- [ ] 报告类型只存在于 `src/types/report.ts` 单一出处
- [ ] 无任何 `ServiceResult` 使用不带类型参数

## 明确不做

- 抽取通用 `useAsyncData` hook：各页面已有 Skeleton + 局部状态模式，抽象收益低、重构面大，暂缓。

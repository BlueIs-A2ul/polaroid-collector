# 整理中心 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增整理中心，帮助用户发现疑似重复记录和待补信息，并提供跳转整理入口。

**Architecture:** 将整理算法放在 `src/utils/organizationUtils.ts`，页面只负责展示和导航。首页更多菜单新增入口，导航栈新增 `OrganizationCenter` 路由。

**Tech Stack:** React Native, Expo, TypeScript, Jest, React Navigation.

---

### Task 1: 整理算法与测试

**Files:**
- Create: `src/__tests__/organizationUtils.test.ts`
- Create: `src/utils/organizationUtils.ts`

- [ ] **Step 1: Write the failing test**

覆盖四类行为：同偶像同日期识别为疑似重复；匹配价格和地点会提高可信度；缺少字段会生成待补项；概览统计会汇总重复组和待补数量。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/__tests__/organizationUtils.test.ts --runInBand`
Expected: FAIL because `../utils/organizationUtils` does not exist.

- [ ] **Step 3: Write minimal implementation**

实现 `getDuplicateCandidates(records)`, `getIncompleteRecords(records)`, `getOrganizationSummary(records)`。

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- src/__tests__/organizationUtils.test.ts --runInBand`
Expected: PASS.

### Task 2: 整理中心页面

**Files:**
- Create: `src/screens/OrganizationCenterScreen.tsx`
- Modify: `src/navigation/AppNavigator.tsx`

- [ ] **Step 1: Add navigation type**

在 `RootStackParamList` 中添加 `OrganizationCenter: undefined`。

- [ ] **Step 2: Create screen**

页面加载 `getAllRecords()`，调用整理工具函数，展示概览、两个标签页和空状态。重复候选点击进入 `Detail`，待补记录点击进入 `Edit`。

- [ ] **Step 3: Register route**

在 Stack 中注册 `OrganizationCenterScreen`，标题为 `整理中心`。

### Task 3: 首页入口与日志

**Files:**
- Modify: `src/screens/HomeScreen.tsx`
- Modify: `WORKLOG.md`

- [ ] **Step 1: Add action sheet entry**

在首页“更多选项”里加入“整理中心”，图标使用 `albums-outline`。

- [ ] **Step 2: Update worklog**

在 `WORKLOG.md` 顶部补充整理中心开发记录。

### Task 4: Verification

- [ ] **Step 1: Typecheck**

Run: `npm.cmd run typecheck`
Expected: PASS.

- [ ] **Step 2: Test**

Run: `npm.cmd test -- --runInBand`
Expected: PASS.

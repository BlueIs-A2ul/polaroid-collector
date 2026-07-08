# Enhanced Search And Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the home screen search and filter experience with all-field search, price range filtering, back-photo filtering, note filtering, active filter count, and one-tap filter clearing.

**Architecture:** Extract ranking search/filter behavior into `src/utils/filterUtils.ts` so it can be tested independently from React Native UI. Keep UI state in `HomeScreen.tsx`, expand `SearchBar`, `AdvancedFilter`, and `QuickActions` to expose the new controls without adding storage or navigation changes.

**Tech Stack:** React Native, Expo, TypeScript, Jest.

---

### Task 1: Search And Filter Utilities

**Files:**
- Create: `src/utils/filterUtils.ts`
- Create: `src/__tests__/filterUtils.test.ts`

- [ ] **Step 1: Write failing tests**

Cover all-field search, note search, price range filtering, back-photo filtering, note filtering, active filter counting, and filter clearing defaults.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/__tests__/filterUtils.test.ts --runInBand`

- [ ] **Step 3: Implement utility functions**

Implement `DEFAULT_FILTER_OPTIONS`, `getActiveFilterCount`, `recordHasBackPhoto`, `recordHasNote`, `matchesSearch`, `matchesFilters`, and `filterRankingItems`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- src/__tests__/filterUtils.test.ts --runInBand`

### Task 2: Wire Home Screen

**Files:**
- Modify: `src/screens/HomeScreen.tsx`

- [ ] **Step 1: Replace inline search/filter logic**

Import and use `DEFAULT_FILTER_OPTIONS`, `filterRankingItems`, and `getActiveFilterCount`.

- [ ] **Step 2: Add clear filters action**

Add a `clearFilters` callback and pass the active filter count to `QuickActions`.

### Task 3: Expand UI Controls

**Files:**
- Modify: `src/components/common/SearchBar.tsx`
- Modify: `src/components/features/AdvancedFilter.tsx`
- Modify: `src/components/features/QuickActions.tsx`

- [ ] **Step 1: Add all-field search type**

Add `all` to `SearchType` and make it the default on the home screen.

- [ ] **Step 2: Add advanced filter controls**

Add numeric price inputs and tri-state buttons for back-photo and note filters.

- [ ] **Step 3: Show active count and clear action**

Render a badge on the filter button when filters are active and a compact clear button beside it.

### Task 4: Verification

**Files:**
- Modify: `WORKLOG.md`

- [ ] **Step 1: Run checks**

Run `npm.cmd run typecheck` and `npm.cmd test -- --runInBand`.

- [ ] **Step 2: Update worklog**

Add a top entry describing enhanced search and filter functionality.

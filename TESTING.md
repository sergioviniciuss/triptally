# Testing Documentation

This document outlines the test coverage for TripTally, specifically focusing on preventing the bugs related to data persistence and totals calculation.

## Overview

The test suite ensures that:
1. **Data persists correctly** after saving in all tabs
2. **Items are auto-selected** when they're the first one added
3. **Totals calculations** only include selected items
4. **Empty strings are handled properly** in optional fields

## Test Files

### 1. Flight Actions Tests (`features/flights/actions.test.ts`)

**Purpose:** Ensures flight options are created, updated, and selected correctly.

**Key Test Cases:**
- ✅ **Auto-selection of first flight**: When creating the first flight option for a trip, it should be automatically selected
- ✅ **No auto-selection when one exists**: When a selected flight already exists, new flights should NOT be auto-selected
- ✅ **Empty string handling**: Optional fields (comments, link) with empty strings should be converted to `undefined`
- ✅ **Validation errors**: Returns proper error messages when required fields are missing
- ✅ **Database errors**: Handles database failures gracefully
- ✅ **Update operations**: Can update existing flight options
- ✅ **Delete operations**: Can delete flight options and revalidates the cache
- ✅ **Selection logic**: When selecting a flight, all others are unselected (radio button behavior)

**Bug Prevention:**
- Prevents flights from being ignored in totals due to missing `isSelected` flag
- Ensures data persists correctly after creation

---

### 2. Transport Actions Tests (`features/transport/actions.test.ts`)

**Purpose:** Ensures transport items are created, updated, and selected correctly.

**Key Test Cases:**
- ✅ **Auto-selection of first item**: When creating the first transport item for a trip, it should be automatically selected
- ✅ **No auto-selection when one exists**: When a selected item already exists, new items should NOT be auto-selected
- ✅ **Empty string handling**: Optional fields (link, notes) with empty strings should be converted to `undefined`
- ✅ **Validation errors**: Returns proper error messages when required fields are missing
- ✅ **Update operations**: Can update existing transport items
- ✅ **Delete operations**: Can delete transport items and revalidates the cache
- ✅ **Selection logic**: When selecting an item, all others are unselected (radio button behavior)

**Bug Prevention:**
- Prevents transport items from being ignored in totals due to missing `isSelected` flag
- Ensures data persists correctly after creation

---

### 3. Lodging Actions Tests (`features/lodging/actions.test.ts`)

**Purpose:** Ensures lodging stays are created, updated, and deleted correctly.

**Key Test Cases:**
- ✅ **Creation with all fields**: Can create lodging stays with all required fields
- ✅ **Empty string handling**: Optional fields (link, notes) with empty strings should be converted to `undefined`
- ✅ **Validation errors**: Returns proper error messages when required fields are missing
- ✅ **Database errors**: Handles database failures gracefully
- ✅ **Update operations**: Can update existing lodging stays
- ✅ **Delete operations**: Can delete lodging stays and revalidates the cache

**Bug Prevention:**
- Ensures data persists correctly after creation
- Prevents validation errors from empty optional fields

---

### 4. Totals Calculation Tests (`lib/totals.test.ts`)

**Purpose:** Ensures trip totals are calculated correctly based on selected items.

**Key Test Cases:**
- ✅ **Only selected flights counted**: Unselected flight options are excluded from totals
- ✅ **Only selected transport counted**: Unselected transport items are excluded from totals
- ✅ **All lodging included**: All lodging stays are included (no selection needed)
- ✅ **Correct grand total**: Sum of all selected flights, transport, and all lodging
- ✅ **Days calculation from flights**: Uses flight dates when available
- ✅ **Days calculation from lodging**: Uses check-in/check-out dates when flights not available
- ✅ **Empty trip handling**: Returns zeros for trips with no expenses
- ✅ **Non-existent trip handling**: Returns zeros for trips that don't exist
- ✅ **Unselected items ignored**: Large amounts don't affect totals if not selected

**Bug Prevention:**
- **CRITICAL**: Prevents the bug where flights and transport were showing €0.00 in totals because items weren't selected
- Ensures only selected items are counted in totals
- Validates that the database query filters correctly by `isSelected`

---

### 5. FlightsTab Component Tests (`features/flights/FlightsTab.test.tsx`)

**Purpose:** Ensures date field constraints work correctly for departure/return dates.

**Key Test Cases:**
- ✅ **Date fields render**: Both departure and return date fields are present
- ✅ **No min when empty**: Return date has no min attribute when departure is empty
- ✅ **Min equals departure**: Return date min attribute equals departure date value
- ✅ **Min updates dynamically**: Return date min updates when departure date changes
- ✅ **Min clears**: Return date min attribute clears when departure is cleared

**Bug Prevention:**
- Prevents users from selecting return dates before departure dates
- Improves UX by constraining date picker to valid ranges

---

### 6. LodgingTab Component Tests (`features/lodging/LodgingTab.test.tsx`)

**Purpose:** Ensures date field constraints work correctly for check-in/check-out dates.

**Key Test Cases:**
- ✅ **Date fields render**: Both check-in and check-out date fields are present
- ✅ **No min when empty**: Check-out date has no min attribute when check-in is empty
- ✅ **Min equals check-in**: Check-out date min attribute equals check-in date value
- ✅ **Min updates dynamically**: Check-out date min updates when check-in date changes
- ✅ **Min clears**: Check-out date min attribute clears when check-in is cleared

**Bug Prevention:**
- Prevents users from selecting check-out dates before check-in dates
- Improves UX by constraining date picker to valid ranges

---

### 7. Trip Form Component Tests (`app/trips/new/page.test.tsx`)

**Purpose:** Ensures date field constraints work correctly for trip start/end dates.

**Key Test Cases:**
- ✅ **Date fields render**: Both start and end date fields are present
- ✅ **No min when empty**: End date has no min attribute when start date is empty
- ✅ **Min equals start**: End date min attribute equals start date value
- ✅ **Min updates dynamically**: End date min updates when start date changes
- ✅ **Min clears**: End date min attribute clears when start date is cleared

**Bug Prevention:**
- Prevents users from selecting end dates before start dates
- Improves UX by constraining date picker to valid ranges

---

## Running Tests

### Run All Tests
```bash
yarn test
```

### Run Specific Test File
```bash
yarn test features/flights/actions.test.ts
yarn test features/transport/actions.test.ts
yarn test features/lodging/actions.test.ts
yarn test lib/totals.test.ts
```

### Run Tests in Watch Mode
```bash
yarn test:watch
```

---

## Test Coverage Summary

| Feature | Test File | Tests | Status |
|---------|-----------|-------|--------|
| Flights Actions | `features/flights/actions.test.ts` | 9 | ✅ Passing |
| Flights UI | `features/flights/FlightsTab.test.tsx` | 5 | ✅ Passing |
| Transport | `features/transport/actions.test.ts` | 8 | ✅ Passing |
| Lodging Actions | `features/lodging/actions.test.ts` | 6 | ✅ Passing |
| Lodging UI | `features/lodging/LodgingTab.test.tsx` | 5 | ✅ Passing |
| Trip Form | `app/trips/new/page.test.tsx` | 5 | ✅ Passing |
| Totals | `lib/totals.test.ts` | 7 | ✅ Passing |
| **Total** | **7 files** | **45** | ✅ **All Passing** |

---

## Bugs Prevented

### Bug #1: Data Not Persisting After Tab Switch
**Problem:** Data would appear to save but disappear when switching tabs and returning.

**Root Cause:** Components weren't calling `router.refresh()` after creating items, so the page data wasn't refetched from the server.

**Prevention:**
- All action tests verify that data is created successfully
- Integration with `router.refresh()` in components ensures data persists
- Tests verify the action returns the created data correctly

### Bug #2: Totals Not Including Flights and Transport
**Problem:** The Total tab showed €0.00 for flights and transport even though data existed.

**Root Cause:** Flights and transport items weren't automatically marked as `isSelected = true`, and the totals calculation only counts selected items.

**Prevention:**
- **Flights tests** verify auto-selection logic for first flight
- **Transport tests** verify auto-selection logic for first item
- **Totals tests** verify only selected items are counted
- Tests ensure the database query correctly filters by `isSelected`

### Bug #3: Empty String Validation Errors
**Problem:** Optional fields with empty strings caused validation to fail.

**Root Cause:** Zod schemas expected `undefined` for optional fields, but forms were sending empty strings.

**Prevention:**
- All action tests include cases for empty string handling
- Tests verify that empty strings are converted to `undefined`
- Schema transformations are validated

---

## Future Test Additions

As the application grows, consider adding:

1. **Integration Tests**: Test the full flow from UI to database
2. **E2E Tests**: Test user workflows with a real browser
3. **Component Tests**: Test React components with React Testing Library
4. **API Route Tests**: Test Next.js API routes directly
5. **Database Tests**: Test Prisma queries with a test database

---

## Continuous Integration

These tests should be run:
- ✅ Before every commit (pre-commit hook)
- ✅ On every pull request (CI/CD pipeline)
- ✅ Before every deployment
- ✅ During local development (watch mode)

---

## Maintenance

When adding new features:
1. Write tests FIRST (TDD approach)
2. Ensure tests cover happy paths and error cases
3. Update this documentation with new test coverage
4. Run the full test suite before committing

---

*Last Updated: February 6, 2026*

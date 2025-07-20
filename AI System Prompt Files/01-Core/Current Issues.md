# Current Issues

Last updated: 2025-01-12

## High Priority Issues

### 1. Page Creation Bugs in Empty Workspaces

**Problem**: Bugs present when creating a page in workspaces that have the default page. The page creation process has issues with the UI and state management.

**Issues Observed**:

- Naming field behavior is inconsistent
- State updates may not properly reflect in the UI
- Default page interaction with new page creation needs refinement

## Medium Priority Issues

### 2. Auto-Save Robustness

**Improvements Needed**:

- Add offline queue for failed saves
- Implement conflict resolution UI
- Optimize save payload (send only changed blocks)
- Add toast notifications for save errors

## Recently Completed

✅ Text formatting persistence - Bold, italic, underline, and links now save correctly
✅ Default page creation for empty workspaces
✅ Fixed page creation input disappearing on API errors
✅ Added visual save status indicator (Saving.../Saved/Error)
✅ Implemented manual save with Ctrl/Cmd+S
✅ Fixed API validation error for page creation (null vs undefined)
✅ Added better error logging and user feedback

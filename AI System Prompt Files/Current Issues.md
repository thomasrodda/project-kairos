# Current Issues

Last updated: 2025-07-11

## High Priority Issues

### 1. Page Creation UX

**Problem**: After naming a new page and pressing Enter, the naming field remains displayed below the newly created page until refresh.

**Proposed Solution**:

- Pressing the create page button should immediately create a new page with default name "New Page"
- Load the new page in the editor
- Focus the page title field in the editor so users can rename it
- Remove the separate naming field from the page tree

### 2. Block Deletion Not Persisting

**Problem**: Deleted blocks reappear on page refresh. Most other changes persist correctly (text edits, block reordering, etc.), but block deletions are not being saved.

**Investigation Needed**:

- Check if `deletedBlockIds` are being sent in the auto-save payload
- Verify the backend is processing the `deletedBlockIds` array
- Check if soft-deleted blocks are being filtered out when loading pages

## Medium Priority Issues

### 3. Text Formatting Not Persisting

**Status**: Known issue documented in Current State.md
**Problem**: Bold, italic, underline, and link formatting is not saved/loaded
**Note**: The formatting data is included in the save payload but not properly stored/retrieved

### 4. Auto-Save Robustness

**Improvements Needed**:

- Add offline queue for failed saves
- Implement conflict resolution UI
- Optimize save payload (send only changed blocks)
- Add toast notifications for save errors

## Completed in This Session

✅ Fixed page creation input disappearing on API errors
✅ Added visual save status indicator (Saving.../Saved/Error)
✅ Implemented manual save with Ctrl/Cmd+S
✅ Fixed API validation error for page creation (null vs undefined)
✅ Added better error logging and user feedback

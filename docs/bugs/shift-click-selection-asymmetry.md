# Bug: Asymmetric Shift+Click Selection Behavior [RESOLVED]

## Issue Description

The block selection behavior when using Shift+click is inconsistent and doesn't follow modern UX standards.

### Current Behavior (Incorrect)

- **Shift+click from top to bottom**: Overrides/replaces the previous selection
- **Shift+click from bottom to top**: Extends/adds to the previous selection

### Expected Behavior (Following Modern Standards)

- **Shift+click in ANY direction**: Should select a continuous range from the anchor point (first selected block) to the clicked block
- The behavior should be consistent regardless of whether you're selecting upward or downward

### Examples of Correct Implementation

- **Google Docs**: Shift+click always creates a range from anchor to target
- **Notion**: Consistent range selection in both directions
- **VS Code**: File selection works symmetrically
- **Windows/Mac OS file explorers**: Same behavior up or down

## Impact

- Confuses users who expect standard selection behavior
- Makes it difficult to predict what will be selected
- Violates principle of least surprise

## Test Status

- The Block component test verifies that it correctly dispatches the SELECT_BLOCK_RANGE action
- The Block component is working correctly - the bug is in EditorContext
- A proper test for this bug should be written in EditorContext.test.tsx

## Root Cause

The bug is NOT in the Block component. The Block component correctly dispatches the `SELECT_BLOCK_RANGE` action with the appropriate parameters. The issue is in the EditorContext's reducer where the `SELECT_BLOCK_RANGE` action is handled.

## Related Files

- `/apps/web/src/contexts/EditorContext.tsx` - WHERE THE BUG IS: SELECT_BLOCK_RANGE handler
- `/apps/web/src/components/Editor/Block/Block.tsx` - Correctly dispatches the action
- `/apps/web/src/components/Editor/Block/Block.test.tsx` - Documents the issue in a comment

## Priority

Medium - This is a UX inconsistency that affects daily usage but has a workaround (Ctrl+click for precise selection)

## Resolution

**Fixed on**: July 23, 2025

### Solution Implemented

Added a `selectionAnchorId` field to the EditorState to track the anchor point for shift+click range selections. This ensures that:

1. The first selected block becomes the anchor point
2. Subsequent shift+clicks always create a range from the anchor to the target
3. The behavior is now symmetric and matches standard applications

### Changes Made

1. **EditorContext.tsx**:
   - Added `selectionAnchorId: string | null` to EditorState interface
   - Updated `SET_SELECTED_BLOCKS` to set anchor to first selected block
   - Modified `SELECT_BLOCK_RANGE` to use anchor instead of startBlockId
   - Updated `TOGGLE_BLOCK_SELECTION` to maintain anchor appropriately
   - Updated `CLEAR_SELECTION` to clear the anchor
   - Added anchor to initial state and SET_PAGE action

### Test Coverage

Comprehensive tests were added to verify:

- Anchor-based selection in both directions
- Anchor persistence across multiple shift+clicks
- Proper anchor management with Ctrl+click
- Anchor reset on new single selection
- Anchor clearing when selection is cleared

All existing tests continue to pass, confirming no regressions were introduced.

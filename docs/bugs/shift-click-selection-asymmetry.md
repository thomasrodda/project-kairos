# Bug: Asymmetric Shift+Click Selection Behavior

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

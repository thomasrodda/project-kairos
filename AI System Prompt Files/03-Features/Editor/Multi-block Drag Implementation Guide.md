# Multi-block Drag Implementation Guide

## Overview

This guide documents the implementation of multi-block drag functionality in the Kairos editor, allowing users to select and drag multiple blocks together.

**Last Updated**: July 24, 2025  
**Status**: Work in Progress (WIP) - UI improvements added, drop position bug remains

## Implementation Details

### Core Components

1. **EditorContent.tsx**

   - Manages drag state with `activeId`
   - Tracks when multiple blocks are being dragged
   - Handles drag start/end events
   - Provides DragOverlay for visual feedback

2. **DraggableBlock.tsx**

   - Wrapper component for individual blocks
   - Receives selection state and active drag ID
   - Applies opacity: 0 to hide blocks during drag (shown in overlay instead)
   - Adds visual classes for multi-block drag state

3. **EditorContent.scss**
   - `.editor-content--dragging-multiple`: Applied during multi-block drag
   - `.dragging-multiple-blocks`: Styles the drag overlay container
   - Compresses gaps between selected blocks during drag

### How It Works

1. **Selection**: Users can select multiple blocks using:

   - Shift+click for range selection
   - Ctrl/Cmd+click for individual toggle
   - Click and drag for visual selection

2. **Drag Initiation**: When dragging starts on any selected block:

   - All selected blocks are included in the drag operation
   - The `activeId` is set to the clicked block's ID
   - Selected blocks become invisible (opacity: 0)

3. **Visual Feedback**:

   - DragOverlay shows all selected blocks moving together
   - Blocks are displayed with minimal gap (var(--spacing-4))
   - No extra styling applied to maintain consistent appearance

4. **Drop Logic**:
   - Multi-block reordering preserves block order
   - Blocks are inserted as a group at the drop position

### Current Implementation (July 24, 2025)

```tsx
// EditorContent.tsx - DragOverlay implementation with reduced opacity
<DragOverlay dropAnimation={null}>
  {activeId ? (
    <div style={{ opacity: 0.7 }}>  // Reduced opacity for dragged blocks
      {selectedBlockIds.length > 1 && selectedBlockIds.includes(activeId) ? (
        // Multi-block drag: show all selected blocks
        <div className="dragging-multiple-blocks">
          {blocks
            .filter((block) => selectedBlockIds.includes(block.id))
            .map((block) => (
              <Block key={block.id} block={block} isFocused={false} />
            ))}
        </div>
      ) : (
        // Single block drag
        blocks.find((b) => b.id === activeId) && <Block block={blocks.find((b) => b.id === activeId)!} isFocused={false} />
      )}
    </div>
  ) : null}
</DragOverlay>
```

### UI Improvements (July 24, 2025)

1. **Drop Indicator Line**:
   - Purple horizontal line (3px height) shows drop position
   - Appears between blocks during drag operations
   - Uses `--color-primary-500` for consistency
   - Smooth slide-in animation

2. **Dragged Block Opacity**:
   - Reduced opacity to 0.7 (70%) for better visual feedback
   - Applied to DragOverlay for both single and multi-block drag

3. **Animation Improvements**:
   - Custom cubic-bezier easing for smoother transitions
   - Disabled default dnd-kit animations for better control
   - Consistent 200ms transition timing

## Known Issues

### 1. Drop Position Bug (WIP)

- **Issue**: When dropping selected blocks below the position of one of the selected blocks, they jump to the top of the page
- **Status**: Under investigation
- **Impact**: Makes multi-block drag unreliable for certain movements

### 2. Drop Gap Size Issue

- **Issue**: Drop gap only matches the height of the single block being dragged, not all selected blocks
- **Status**: Identified, needs fix
- **Impact**: Visual feedback doesn't accurately represent space needed for multi-block drop

### 3. UI/UX Refinements Completed (July 24, 2025)

- ✅ Smooth transition animations (cubic-bezier easing)
- ✅ Better visual feedback during drag (70% opacity)
- ✅ Drop indicators for precise placement (purple line)

## Design Decisions

1. **Why Use DragOverlay?**

   - dnd-kit only applies transform to the actively dragged element
   - Impossible to synchronize transforms across multiple elements
   - DragOverlay provides unified visual feedback for all selected blocks

2. **Why Hide Original Blocks?**

   - Prevents dual visualization (ghost + original)
   - Creates cleaner drag experience
   - Allows overlay to be the single source of truth during drag

3. **Minimal Styling Approach**
   - Removed background, border-radius, and shadow from drag overlay
   - Maintains consistency with single block drag
   - Prevents visual artifacts and extra padding

## Future Improvements

1. **Fix Drop Position Bug**: Investigate and resolve the jump-to-top issue
2. **Enhanced Visual Feedback**: Add drop indicators between blocks
3. **Performance Optimization**: Consider virtualizing large block selections
4. **Animation Polish**: Smooth transitions for hide/show states
5. **Alternative Approach**: Research if blocks can be grouped as single draggable unit

## Related Documentation

- [User Stories - Editor](./User Stories - Editor.md)
- [Enhanced Custom Editor Plan](./Enhanced Custom Editor Plan.md)
- Current State.md - See Editor section for overall status

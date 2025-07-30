# Copy/Paste Test Instructions

## Block-Level Copy/Paste Test

### Test 1: Single Block Copy/Paste

1. Click on a block's drag handle to select it
2. Press Ctrl+C (or Cmd+C on Mac) to copy
3. Press Ctrl+V (or Cmd+V on Mac) to paste
4. Expected: Block should be duplicated after the selected block

### Test 2: Multiple Block Copy/Paste

1. Select multiple blocks using:
   - Shift+click on drag handles for range selection
   - Ctrl+click on drag handles for individual selection
   - Or click and drag across multiple blocks
2. Press Ctrl+C to copy
3. Press Ctrl+V to paste
4. Expected: All selected blocks should be pasted after the last selected block

### Test 3: Cut and Paste

1. Select one or more blocks
2. Press Ctrl+X to cut
3. Press Ctrl+V to paste
4. Expected: Blocks should be removed from original position and pasted at new location

### Test 4: Formatting Preservation

1. Create a block with formatted text (bold, italic, links)
2. Select and copy the block
3. Paste it
4. Expected: All formatting should be preserved in the pasted block

### Test 5: Cross-Application Paste

1. Copy text from another application
2. Click in empty space (no block focused)
3. Press Ctrl+V
4. Expected: Text should be pasted as new blocks (one per line)

## Text-Level Copy/Paste Test

### Test 6: Text Selection Within Block

1. Select text within a block
2. Press Ctrl+C to copy
3. Click elsewhere and press Ctrl+V
4. Expected: Only the selected text should be pasted

### Test 7: Cross-Block Text Selection

1. Click and drag to select text across multiple blocks
2. Press Ctrl+C to copy
3. Click in another block and press Ctrl+V
4. Expected: Selected text should be pasted, preserving block boundaries

## What's Implemented

✅ Block-level copy (Ctrl+C) for selected blocks
✅ Block-level cut (Ctrl+X) for selected blocks  
✅ Block-level paste (Ctrl+V) when no block is focused
✅ Formatting preservation in custom clipboard format
✅ Plain text and markdown export formats
✅ Multi-block selection support
✅ Screen reader announcements

## Technical Details

The implementation uses three clipboard formats:

1. `text/plain` - Plain text representation
2. `text/markdown` - Markdown representation with block types
3. `application/x-kairos-blocks` - Custom format preserving block types and formatting

When pasting:

- If Kairos block format is available, it preserves block types and formatting
- Otherwise, plain text is split by newlines into paragraph blocks
- Paste location is after the last selected block, or at document end if nothing selected

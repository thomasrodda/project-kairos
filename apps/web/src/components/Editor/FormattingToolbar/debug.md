# FormattingToolbar Debug Guide

## To Test if FormattingToolbar is Working:

1. Open the app in the browser
2. Open browser DevTools (F12)
3. Select some text in the editor (drag across text)
4. In the Console, run:

   ```javascript
   // Check if toolbar is in DOM
   document.querySelector('.formatting-toolbar')

   // Check editor state
   window.__EDITOR_STATE__ = document.querySelector('[data-testid="editor-provider"]')?.__reactInternalInstance

   // Check selection
   window.getSelection().toString()
   ```

## Common Issues:

1. **Toolbar not appearing**:

   - Check if `crossBlockSelection` is being set in EditorContext
   - Verify text selection is detected by `useCrossBlockSelection` hook

2. **Toolbar positioned incorrectly**:
   - Check if `containerRef` is properly set
   - Verify `.editor-content__blocks` has `position: relative`

## Quick Fixes to Try:

1. Force show toolbar (for testing):
   - In FormattingToolbar.tsx, temporarily change line 113:
   - From: `if (!isVisible) return null`
   - To: `// if (!isVisible) return null`
2. Check if selection detection is working:
   - Add temporary console.log in useCrossBlockSelection hook
   - See if selection changes are being detected

# Slash Command Feature Development

> Last Updated: January 11, 2025
> This document tracks the development progress of the slash command feature for block type conversion in Project Kairos.

## 📋 Feature Overview

The slash command feature allows users to quickly change block types by typing "/" which opens a searchable menu. This is a core editor feature that enhances writing speed and discoverability.

## ✅ Completed Items

### Core Implementation

- [x] Created `SlashCommandMenu` component with search and keyboard navigation
- [x] Integrated slash detection in `ContentEditableContainer`
- [x] Added block type conversion functionality
- [x] Implemented menu positioning above the current block (prevents viewport overflow)
- [x] Added auto-dismiss when typing non-slash characters
- [x] Created comprehensive test suites (31 tests total)
- [x] Added focus restoration when cancelling with ESC
- [x] Updated documentation (Current State.md, Editor Testing Plan.md, Development Plan.md)

### Basic Functionality

- [x] Menu appears when typing "/" at start of block
- [x] Menu appears when typing "/" after a space
- [x] Menu does NOT appear when typing "/" in middle of word
- [x] Search input auto-focuses when menu opens
- [x] Real-time filtering by block type name, shortcut, or label
- [x] Keyboard navigation (arrow keys, Enter, Escape)
- [x] Mouse interaction (click to select, hover to highlight)
- [x] Click outside or Escape to close menu
- [x] Slash character is removed when block type is changed
- [x] Cursor position restored after ESC cancellation

## 🔄 In Progress / Needs Improvement

### Visual Design & Polish

- [ ] Add icons for each block type in the menu
- [ ] Improve menu styling to match Project Kairos design system
- [ ] Add subtle animation for menu appearance/disappearance
- [ ] Ensure proper dark mode support (when implemented)
- [ ] Add visual indicator showing current block type
- [ ] Improve hover and selection states

### Enhanced Functionality

- [x] Keep menu open while typing to filter options (e.g., "/hea" filters to headings)
- [ ] Add more block types (code block, quote, divider, callout)
- [ ] Support markdown shortcuts (e.g., "# " converts to H1 without menu)
- [ ] Add recently used block types at the top
- [ ] Support for "/" in empty blocks to show full menu
- [ ] Handle edge case: typing "/" at the very end of a block
- [ ] Add option to insert new block of selected type (not just convert)

### Keyboard Shortcuts

- [ ] Add number shortcuts (1-9) for quick selection
- [ ] Support Tab key for navigation (in addition to arrows)
- [ ] Add Cmd/Ctrl+/ as alternative trigger
- [ ] Support typing block name directly (e.g., "/h1" + Enter)

### Performance & UX

- [ ] Debounce search input for better performance
- [ ] Preload menu component for instant appearance
- [ ] Add loading state if menu takes time to render
- [ ] Memoize filtered options to prevent unnecessary recalculations
- [ ] Test performance with 50+ block types (future scalability)

### Accessibility

- [ ] Add proper ARIA labels for screen readers
- [ ] Announce menu open/close states
- [ ] Ensure keyboard navigation is fully accessible
- [ ] Add high contrast mode support
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)

### Mobile Support

- [ ] Design touch-friendly menu for mobile devices
- [ ] Handle virtual keyboard appearance
- [ ] Ensure menu doesn't go off-screen on small devices
- [ ] Add swipe gestures for navigation
- [ ] Test on iOS and Android devices

### Integration Improvements

- [ ] Preserve text after slash when converting (e.g., "/heading" → keep "heading")
- [ ] Support slash commands in middle of text (not just start/after space)
- [ ] Add undo support for block type changes
- [ ] Integrate with future command palette system
- [ ] Support custom slash commands from plugins

### Testing Gaps

- [ ] Add E2E tests for slash command workflows
- [ ] Test with different languages and IME input
- [ ] Add visual regression tests for menu appearance
- [ ] Test memory leaks with repeated menu open/close
- [ ] Add performance benchmarks for menu filtering

### Documentation

- [ ] Create user-facing documentation with GIFs/videos
- [ ] Add slash command guide to onboarding flow
- [ ] Document all available shortcuts and commands
- [ ] Create developer guide for adding new block types
- [ ] Add troubleshooting section for common issues

## 🚀 Future Enhancements

### Advanced Features

- [ ] AI-powered block suggestions based on context
- [ ] Custom user-defined slash commands
- [ ] Block templates (e.g., "/meeting" creates meeting notes template)
- [ ] Contextual commands (different options based on current block type)
- [ ] Multi-block operations (e.g., "/convert-all-to-bullets")

### Integration with Other Features

- [ ] Combine with @ mentions for people/page references
- [ ] Integrate with [[wiki-links]] for page creation
- [ ] Support for embedding content (e.g., "/embed-tweet")
- [ ] Quick actions (e.g., "/todo" creates a task)
- [ ] Formatting commands (e.g., "/bold" for inline formatting)

## 🐛 Known Issues

1. **Menu Position**: Menu might appear off-screen near bottom of viewport
2. **Focus Management**: Focus doesn't always return to editor after menu closes
3. **Selection State**: Cross-block selection might interfere with slash command
4. **Performance**: No debouncing on search input could impact performance
5. **Mobile**: Not tested or optimized for touch devices

## 📊 Success Metrics

- [ ] Time to change block type reduced by 50%
- [ ] 80% of users discover slash commands without documentation
- [ ] Menu appears within 100ms of typing "/"
- [ ] Search filters results within 50ms
- [ ] Zero accessibility violations in automated testing

## 🔗 Related Documents

- [# 2. User Stories.md](./# 2. User Stories.md) - See "Changing block type via slash command"
- [Component Structure Guide.md](./Component Structure Guide.md) - Component patterns
- [Testing Guide.md](./Testing Guide.md) - Testing best practices
- [Editor Testing Plan.md](./Editor Testing Plan.md) - Full test coverage

## 📝 Notes

- The current implementation is a solid MVP but needs polish for production
- Consider user research to validate the "/" trigger (some apps use different triggers)
- Performance optimization should be done before adding more block types
- Mobile experience is critical since many users write on phones/tablets

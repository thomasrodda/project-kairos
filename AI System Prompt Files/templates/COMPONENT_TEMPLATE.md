# [ComponentName] Component

> [Brief one-line description of what this component does and its primary purpose]

---

## Overview

[Detailed description of the component, including:]

- What problem it solves
- Where it's used in the application
- Key features or capabilities
- Any important integrations or dependencies

## Component API

### Props

```typescript
interface [ComponentName]Props {
  // Required props
  propName: string // Description of what this prop does

  // Optional props
  optionalProp?: boolean // Description and default value
  onEvent?: (param: Type) => void // Event handler description
  className?: string // Additional CSS classes
  children?: React.ReactNode // Child elements (if applicable)
}
```

### Usage Example

```tsx
import { [ComponentName] } from '@/components/[ComponentName]'

// Basic usage
<[ComponentName] propName="value" />

// With all props
<[ComponentName]
  propName="value"
  optionalProp={true}
  onEvent={handleEvent}
  className="custom-class"
>
  {children}
</[ComponentName]>
```

## Component Structure

```
[ComponentName]/
├── [ComponentName].tsx      # Main component file
├── [ComponentName].scss     # Component styles (if applicable)
├── [ComponentName].test.tsx # Component tests
├── index.ts                 # Re-exports
└── [SubComponent].tsx       # Sub-components (if any)
```

## Implementation Details

### State Management

[Describe any internal state, hooks used, or context consumption]

```typescript
// Example of key state or hooks
const [state, setState] = useState<Type>(initialValue)
const { contextValue } = useContext(SomeContext)
```

### Key Functions

[Document any important internal functions or methods]

```typescript
// handleSomething - Description of what it does
const handleSomething = (param: Type) => {
  // Key logic explanation
}
```

### Styling

[Describe styling approach, CSS classes, design tokens used]

- Uses BEM methodology: `.[component-name]__element--modifier`
- Key design tokens: `--spacing-16`, `--color-primary`
- Responsive breakpoints: [if applicable]

## Testing

### Test Coverage

- [ ] Component renders correctly
- [ ] Props are handled properly
- [ ] User interactions work as expected
- [ ] Edge cases are covered
- [ ] Accessibility requirements met

### Example Tests

```typescript
describe('[ComponentName]', () => {
  it('should render with required props', () => {
    // Test implementation
  })

  it('should handle user interaction', () => {
    // Test implementation
  })
})
```

## Accessibility

- **ARIA labels**: [List any ARIA attributes used]
- **Keyboard navigation**: [Describe keyboard support]
- **Screen reader**: [Any special considerations]
- **Focus management**: [How focus is handled]

## Performance Considerations

- [Any memoization used]
- [Lazy loading or code splitting]
- [Render optimization techniques]
- [Large data handling]

## Dependencies

### External Dependencies

- `react`: Core React functionality
- [Other npm packages used]

### Internal Dependencies

- `@/contexts/[Context]`: [What it provides]
- `@/hooks/[hook]`: [What it does]
- `@/utils/[utility]`: [What functions are used]

## Related Components

- **[RelatedComponent]**: [How they work together]
- **[ParentComponent]**: [If this is commonly used as a child]
- **[ChildComponent]**: [Common children or composed components]

## Known Issues & Limitations

- [Any current bugs or limitations]
- [Browser compatibility issues]
- [Performance constraints]

## Future Enhancements

- [Planned improvements]
- [Feature requests]
- [Refactoring needs]

## Examples in Codebase

- Used in `[Page/Feature]` at `apps/web/src/[path]`
- Example implementation: `[specific file:line]`

## Migration Notes

[If this replaces an older component or has breaking changes between versions]

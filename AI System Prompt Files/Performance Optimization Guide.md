# Performance & Optimization Guide

> Implementation guide for the Assistant: How to write performant code that loads fast and stays responsive. Follow these patterns for all features.

---

## Overview

Build features that respond instantly to user input and load quickly. Use code splitting, React performance patterns, API optimization, and proper database queries to maintain speed as the app scales.

---

## Code Splitting & Lazy Loading

Lazy load non-critical components:

- Settings and profile pages
- AI features and heavy third-party libraries
- Modal dialogs and popups

Don't lazy load core editor components, sidebar, navigation, or error boundaries. Use Suspense with loading indicators.

---

## React Performance

Use performance patterns for frequently re-rendering components:

- **React.memo**: Prevent unnecessary re-renders of block components
- **useMemo**: Cache expensive calculations (filtering, sorting large lists)
- **useCallback**: Prevent child re-renders from event handler changes

Focus optimization on components that render many times or with large datasets.

---

## API Performance

Optimize API calls to reduce server load:

- **Debounce autosave**: Wait 2 seconds after user stops typing
- **Batch operations**: Save multiple blocks in single request
- **Cache responses**: Store frequently accessed data (workspaces, user preferences)
- **Limit results**: Never fetch unlimited records

Track and log API response times. Alert if requests take >2 seconds.

---

## Database Optimization

Write efficient database queries:

- **Add indexes** for all common query fields (workspace_id, page_id, user_id)
- **Avoid N+1 queries**: Use joins/includes to fetch related data
- **Limit results**: Always use take/limit on queries
- **Log slow queries**: Monitor queries taking >1 second

Design schema to support common access patterns efficiently.

---

## Bundle Optimization

Keep bundle sizes manageable:

- Split vendor libraries from app code
- Monitor bundle size in CI pipeline
- Fail builds if bundles exceed size limits
- Use bundle analyzer to identify large dependencies

Target <500KB for main bundle, <200KB for vendor bundle.

---

## Asset Performance

Optimize images and static assets:

- Use appropriate formats (WebP with fallbacks)
- Implement lazy loading for images below the fold
- Compress and resize images appropriately
- Serve static assets from CDN

---

## Performance Monitoring

Measure and track performance metrics:

- **Core Web Vitals**: LCP, FID, CLS
- **API response times** and error rates
- **Database query performance**
- **Bundle size** and load times

Set up alerts for performance regressions and monitor after each release.

---

## Implementation Requirements

**Every React component should**:

- Use performance hooks when rendering frequently
- Lazy load if not immediately needed
- Handle loading states gracefully

**Every API endpoint should**:

- Include proper database indexes
- Limit query results
- Log slow operations
- Use efficient query patterns

**Every feature should**:

- Debounce user input that triggers API calls
- Cache appropriate data
- Measure performance impact
- Test with large datasets before release

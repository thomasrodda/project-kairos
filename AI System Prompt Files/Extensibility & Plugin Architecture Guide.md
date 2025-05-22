# Extensibility & Plugin Architecture Guide

## 1. Plugin-Friendly Block System

- Register block types in a central config (e.g. `blockRegistry.ts`)
- Each block defines:
  - Type (e.g. `heading`, `paragraph`, `image`)
  - Render function/component
  - Optional toolbar or slash-menu metadata
- Use dynamic rendering via a factory pattern

## 2. Internal Event System (Optional but Recommended)

- Create a simple event bus (`eventBus.ts`) to decouple features
- Example events:
  - `block:created`, `page:saved`, `editor:loaded`
- Enables analytics, autosave, or plugin hooks without tight coupling

## 3. AI Abstraction Layer

- Define an interface for AI tools (e.g. `aiClient.ts`)
- Keep grammar check, lore check, etc., behind this interface
- Allows switching providers or adding new tools easily

## 4. Shared Utility & Type Packages

- `packages/types/` – Central TypeScript types
- `packages/utils/` – Pure functions for formatting, ordering, ID generation

## 5. Metadata Support

- Pages and blocks may include an optional `metadata` field
- Can support:
  - Custom tags
  - AI flags
  - User-defined filters or labels


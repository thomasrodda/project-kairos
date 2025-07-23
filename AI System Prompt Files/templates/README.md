# Documentation Templates

This directory contains standardized templates for Project Kairos documentation. Use these templates to ensure consistency across all documentation.

## Available Templates

### 1. [FEATURE_TEMPLATE.md](./FEATURE_TEMPLATE.md)

**Purpose**: Document user stories and requirements for features

**When to use**:

- Creating new feature documentation in `/03-Features/[FeatureName]/`
- Documenting user requirements and acceptance criteria
- Tracking implementation status of features

**Key sections**:

- User stories with acceptance criteria
- Component mappings
- Dependencies and technical considerations
- Status tracking

### 2. [COMPONENT_TEMPLATE.md](./COMPONENT_TEMPLATE.md)

**Purpose**: Document React components in detail

**When to use**:

- Documenting new components in `/03-Features/[Feature]/`
- Creating component library documentation
- Explaining complex component behavior

**Key sections**:

- Props interface and usage examples
- Component structure and implementation
- Testing and accessibility
- Performance considerations

### 3. [API_ENDPOINT_TEMPLATE.md](./API_ENDPOINT_TEMPLATE.md)

**Purpose**: Document backend API endpoints

**When to use**:

- Adding new endpoints to `/02-Architecture/`
- Documenting API changes
- Creating API reference guides

**Key sections**:

- Request/response formats
- Authentication requirements
- Error handling
- Frontend usage examples

### 4. [DOCUMENTATION_STANDARDS.md](./DOCUMENTATION_STANDARDS.md)

**Purpose**: Guidelines for consistent documentation

**When to use**:

- Reference when writing any documentation
- Training new contributors
- Documentation reviews

**Key sections**:

- Formatting standards
- Cross-referencing guidelines
- Quality checklist
- Maintenance procedures

## How to Use Templates

1. **Copy the template** to your target location
2. **Replace placeholders** marked with `[brackets]`
3. **Remove optional sections** that don't apply
4. **Fill in all required sections** completely
5. **Cross-reference** related documentation
6. **Verify accuracy** against actual implementation

## Quick Start Examples

### Creating Feature Documentation

```bash
# Copy template to new feature folder
cp "AI System Prompt Files/templates/FEATURE_TEMPLATE.md" \
   "AI System Prompt Files/03-Features/NewFeature/User Stories - New Feature.md"

# Edit the file and replace placeholders
```

### Documenting a Component

```bash
# Copy template to feature folder
cp "AI System Prompt Files/templates/COMPONENT_TEMPLATE.md" \
   "AI System Prompt Files/03-Features/Editor/BlockEditor Component.md"

# Fill in component details
```

### Adding API Documentation

```bash
# Copy template to architecture folder
cp "AI System Prompt Files/templates/API_ENDPOINT_TEMPLATE.md" \
   "AI System Prompt Files/02-Architecture/API - Workspaces.md"

# Document the endpoint
```

## Best Practices

1. **Always use real examples** from the codebase
2. **Keep templates updated** as patterns evolve
3. **Remove placeholder text** - don't leave `[brackets]`
4. **Link liberally** to related documentation
5. **Update regularly** as implementation changes

## Template Maintenance

These templates should be reviewed and updated:

- When documentation patterns change
- When new sections become common
- Quarterly for general improvements

Last template review: **2025-01-23**

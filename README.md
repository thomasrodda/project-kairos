# Project Kairos

A creative writing and worldbuilding web application designed for novelists, writers, and D&D campaign planners. It combines block-based editing with AI-driven tools for consistency checking and writing assistance.

## Technology Stack

- **Frontend**: React with TypeScript, Custom SCSS styling
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Firebase Authentication (Google OAuth)
- **AI/Vector Search**: Pinecone or Weaviate
- **Hosting**: Vercel
- **Testing**: Jest (unit), Cypress (e2e)

## Quick Start

### Automated Setup (Recommended)

```bash
# Clone the repository
git clone [your-repo-url]
cd project-kairos

# Run the setup script
yarn setup
```

The setup script will:

- Install all dependencies
- Configure Git hooks
- Set up environment variables
- Initialize the database
- Run initial checks

### Manual Setup

If you prefer to set up manually:

```bash
# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up Git hooks
yarn husky

# Generate database client
yarn db:generate

# Run initial checks
yarn typecheck
yarn test
```

## Prerequisites

- **Node.js** 22+
- **Yarn** 1.22+
- **PostgreSQL** database
- **Git**
- **Firebase project** (for authentication)

## Environment Setup

1. **Database**: Set up a PostgreSQL database and update `DATABASE_URL` in `.env.local`
2. **Firebase**: Create a Firebase project and add your credentials to `.env.local`
3. **Run migrations**: `yarn db:migrate` to create database tables
4. **Seed data**: `yarn db:seed` to add sample data (optional)

## Development

```bash
# Start both frontend and backend development servers
yarn dev

# Frontend only (http://localhost:3000)
yarn workspace @kairos/web dev

# Backend only (http://localhost:3001)
yarn workspace @kairos/api dev

# Database studio (visual database browser)
yarn db:studio
```

## Project Structure

```
project-root/
├── apps/
│   ├── web/              # React frontend
│   └── api/              # Vercel serverless functions
├── packages/
│   ├── database/         # Prisma schema and database utilities
│   ├── ui/               # Shared UI components
│   ├── utils/            # Shared utilities & env validation
│   └── types/            # TypeScript type definitions
├── prisma/
│   └── schema.prisma     # Database schema
└── AI System Prompt Files/  # Development documentation
```

## Available Scripts

### Development

- `yarn dev` - Start development servers
- `yarn build` - Build all packages
- `yarn setup` - Run complete project setup

### Code Quality

- `yarn lint` - Run ESLint with auto-fix
- `yarn lint:check` - Check linting without fixing
- `yarn typecheck` - Run TypeScript type checking
- `yarn format` - Format code with Prettier

### Testing

- `yarn test` - Run unit tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run tests with coverage report
- `yarn test:e2e` - Run end-to-end tests (Cypress)
- `yarn test:e2e:open` - Open Cypress test runner

### Database

- `yarn db:migrate` - Run database migrations
- `yarn db:seed` - Seed database with sample data
- `yarn db:studio` - Open Prisma Studio
- `yarn db:reset` - Reset database (⚠️ destructive)

### Utilities

- `yarn update-tree` - Update FILE_TREE.md with current structure

## Git Workflow

This project uses automated Git hooks for code quality:

- **Pre-commit**: Runs linting, type checking, and tests
- **Pre-push**: Runs full test suite and builds

### Branch Structure

- `main` - Production-ready code
- `dev` - Active development branch
- `feature/*` - Individual features

## Testing

### Unit Tests (Jest)

```bash
yarn test                    # Run all unit tests
yarn workspace @kairos/web test    # Run frontend tests only
yarn workspace @kairos/api test    # Run backend tests only
```

### End-to-End Tests (Cypress)

```bash
yarn test:e2e:open         # Open Cypress test runner
yarn test:e2e              # Run e2e tests headlessly
```

### Coverage Reports

```bash
yarn test:coverage         # Generate coverage report
open coverage/lcov-report/index.html  # View coverage report
```

## Database Management

### Schema Changes

```bash
# After modifying prisma/schema.prisma
yarn db:migrate            # Create and apply migration
yarn db:generate           # Regenerate Prisma client
```

### Database Operations

```bash
yarn db:studio             # Visual database browser
yarn db:seed               # Add sample data
yarn db:reset              # Reset database (careful!)
```

## Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/kairos_dev"

# Firebase (Frontend)
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_PROJECT_ID="your-project-id"

# Firebase (Backend)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="your-private-key"
```

## Deployment

### Production Build

```bash
yarn build                 # Build all packages
yarn test                  # Run tests
```

### Vercel Deployment

The project is configured for Vercel deployment with automatic deployments from the `main` branch.

## Documentation

Comprehensive development documentation is available in the `AI System Prompt Files/` directory:

- **Architecture patterns** and component structure
- **Testing strategies** and best practices
- **API design** and data model documentation
- **Deployment** and production guidelines
- **Security** and performance optimization

## Troubleshooting

### Common Issues

**Dependencies not installing:**

```bash
rm -rf node_modules yarn.lock
yarn install
```

**Database connection issues:**

- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env.local`
- Run `yarn db:migrate` to ensure schema is up to date

**TypeScript errors:**

```bash
yarn typecheck          # Check for type errors
yarn db:generate        # Regenerate database types
```

**Git hooks not working:**

```bash
yarn husky              # Reinstall git hooks
chmod +x .husky/*       # Fix permissions
```

## Contributing

1. Create a feature branch from `dev`
2. Make your changes with tests
3. Ensure all checks pass: `yarn lint && yarn typecheck && yarn test`
4. Open a pull request to `dev`

## License

Private - All rights reserved

# Environment Setup Guide

> Complete setup instructions for Project Kairos development environment.

## Prerequisites

### Required Software

- **Node.js**: v22.0.0 or higher
  - Check: `node --version`
  - Install: [nodejs.org](https://nodejs.org/) or use nvm
- **Yarn**: v4.0.0 or higher (project uses Yarn 4.9.2)
  - Check: `yarn --version`
  - Install: The project uses Yarn via Corepack (included with Node.js 16.10+)
  - Enable Corepack: `corepack enable`
  - The correct Yarn version will be automatically used from `.yarnrc.yml`
- **Git**: v2.25.0 or higher
  - Check: `git --version`
- **PostgreSQL**: v13.0 or higher
  - Local or cloud instance (e.g., Supabase, Neon)

### Recommended Tools

- **VS Code**: With recommended extensions (see `.vscode/extensions.json`)
- **PostgreSQL client**: pgAdmin, TablePlus, or DBeaver
- **Chrome/Firefox**: Latest version for development

## Initial Setup

### 1. Clone Repository

```bash
git clone [your-repo-url]
cd project-kairos
```

### 2. Install Dependencies

```bash
yarn install
```

This will:

- Install all package dependencies
- Set up yarn workspaces
- Configure git hooks with Husky

### 3. Environment Configuration

#### Create Environment File

```bash
cp .env.example .env.local
```

#### Configure Database

Edit `.env.local` and set your PostgreSQL connection:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/kairos_dev"
```

**Local PostgreSQL**:

```bash
# Create database
createdb kairos_dev

# Or using psql
psql -U postgres -c "CREATE DATABASE kairos_dev;"
```

**Cloud PostgreSQL** (Recommended for beginners):

- [Supabase](https://supabase.com/) - Free tier available
- [Neon](https://neon.tech/) - Serverless Postgres
- [Railway](https://railway.app/) - Simple deployment

#### Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable Authentication and select Google as sign-in provider
3. Create a web app and copy the configuration
4. Update `.env.local` with your Firebase config:

```bash
# Frontend Firebase Config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

5. For backend, create a service account:
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Add to `.env.local`:

```bash
# Backend Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Database Setup

```bash
# Generate Prisma client
yarn db:generate

# Run migrations
yarn db:migrate

# (Optional) Seed with sample data
yarn db:seed
```

### 5. Verify Setup

```bash
# Check types compile
yarn typecheck

# Run tests
yarn test

# Start development servers
yarn dev
```

You should see:

- Web app at http://localhost:3000
- API at http://localhost:3001

## Common Setup Issues

### Windows Users

- Use WSL2 for best compatibility
- Or use PowerShell/Git Bash (not Command Prompt)

### Port Conflicts

```bash
# If ports are already in use
yarn kill-ports
```

### Permission Errors

```bash
# On Unix systems
chmod +x .husky/*
chmod +x *.sh
```

### Database Connection Failed

1. Ensure PostgreSQL is running
2. Check connection string format
3. Verify user has necessary permissions
4. Check firewall/security group settings for cloud databases

## VS Code Setup

### Recommended Settings

Already configured in `.vscode/settings.json`

### Install Extensions

```bash
# Opens VS Code with recommended extensions
code . --install-extension dbaeumer.vscode-eslint
code . --install-extension esbenp.prettier-vscode
code . --install-extension bradlc.vscode-tailwindcss
```

## Verifying Everything Works

### Run Full Check

```bash
# Format code
yarn format

# Lint check
yarn lint

# Type check
yarn typecheck

# Run all tests
yarn test

# Build project
yarn build
```

All commands should pass without errors.

## Next Steps

1. Review [Current State.md](../01-Core/Current State.md) to understand what's built
2. Check [Development Plan.md](../01-Core/Development Plan.md) for roadmap
3. Read [Component Structure Guide.md](../03-Features/Component Structure Guide.md) before adding features
4. Run `yarn dev` and start coding!

## Getting Help

- Check [Troubleshooting Guide.md](./Troubleshooting Guide.md) for common issues
- Review error messages carefully - they often indicate the solution
- Database issues: Check connection string and PostgreSQL logs
- Build issues: Try `rm -rf node_modules && yarn install`

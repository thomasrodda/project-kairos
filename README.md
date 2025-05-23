# Project Kairos

A creative writing and worldbuilding web application designed for novelists, writers, and D&D campaign planners. It combines block-based editing with AI-driven tools for consistency checking and writing assistance.

## Technology Stack

- **Frontend**: React with TypeScript, Custom SCSS styling
- **Backend**: Vercel Serverless Functions (Node.js)
- **Authentication**: Firebase Authentication (Google OAuth)
- **Database**: PostgreSQL or MongoDB (TBD)
- **AI/Vector Search**: Pinecone or Weaviate
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 1.22+
- Git

### Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd project-kairos

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase and other API keys
```

### Development

```bash
# Start both frontend and backend development servers
yarn dev

# Frontend only (http://localhost:3000)
yarn workspace @kairos/web dev

# Backend only (http://localhost:3001)
yarn workspace @kairos/api dev
```

### Project Structure

```
project-root/
├── apps/
│   ├── web/          # React frontend
│   └── api/          # Vercel serverless functions
├── packages/
│   ├── ui/           # Shared UI components
│   ├── utils/        # Shared utilities
│   └── types/        # TypeScript type definitions
└── AI System Prompt Files/  # Development documentation
```

## Available Scripts

- `yarn dev` - Start development servers
- `yarn build` - Build all packages
- `yarn lint` - Run ESLint
- `yarn typecheck` - Run TypeScript type checking
- `yarn test` - Run tests
- `yarn format` - Format code with Prettier

## Documentation

See the `AI System Prompt Files/` directory for comprehensive development documentation including:

- Architecture patterns
- Component structure guidelines
- Testing and deployment guides
- API and data model documentation

## License

Private - All rights reserved

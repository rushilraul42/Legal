# BetterCall AI Suite

A modern full-stack application with separate frontend and backend architecture.

## Project Structure

```
BetterCallAISuite/
├── frontend/          # React + Vite frontend application
│   ├── src/          # Source code
│   ├── package.json  # Frontend dependencies
│   ├── vite.config.ts
│   └── ...
├── backend/          # Node.js + Express backend (for future development)
│   ├── src/          # Server source code
│   ├── shared/       # Shared schemas and types
│   ├── package.json  # Backend dependencies
│   └── ...
├── shared/           # Shared types/schemas (symlinked)
├── docs/            # Documentation
└── package.json     # Root workspace configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

Install dependencies for the entire project:
```bash
npm run install:all
```

Or install individually:
```bash
# Frontend only
npm run install:frontend

# Backend only  
npm run install:backend
```

### Development

Run the frontend development server:
```bash
npm run dev
# or specifically
npm run dev:frontend
```

Run the backend development server (when ready):
```bash
npm run dev:backend
```

### Building

Build the frontend for production:
```bash
npm run build
# or specifically
npm run build:frontend
```

Build the backend for production:
```bash
npm run build:backend
```

## Frontend

The frontend is built with:
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- React Query for state management
- Wouter for routing

## Backend

The backend will be built with:
- Node.js + Express
- TypeScript
- Drizzle ORM
- PostgreSQL
- Authentication with Passport.js

## Development Notes

- The frontend runs independently and can be developed without the backend
- The backend is prepared for future development with all necessary configurations
- Shared types and schemas are located in the `/shared` directory
- Documentation is organized in the `/docs` directory
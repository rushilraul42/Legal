# BetterCall AI - Legal Research Platform

## Project Overview

BetterCall AI is a comprehensive AI-powered legal assistant platform specifically designed for lawyers and legal professionals. It combines modern web technologies, AI integration, and a sophisticated legal database system to revolutionize legal research and document analysis.

## Core Features

### Implemented (MVP)

1. **Landing Page** - Professional marketing page with:
   - Hero section with clear value proposition
   - Feature showcase grid
   - Statistics display
   - Responsive footer
   - Firebase authentication integration
   - Dark/Light theme toggle

2. **Firebase Authentication**
   - Google Sign-In integration
   - Protected routes for authenticated users
   - User profile display in sidebar
   - Automatic redirect handling

3. **Dashboard** - Main application hub with:
   - Quick search functionality
   - Activity statistics (cases searched, analyses run, time saved)
   - Quick action cards for main features
   - Recent searches display
   - Research insights

4. **Case Search** - Advanced legal case search with:
   - Semantic search through 130K+ legal documents (mock data)
   - Advanced filtering (court, jurisdiction, document type)
   - Pagination support
   - Case result cards with key metadata
   - Integration-ready for India Kanoon API

5. **AI Judgment Analysis** - Document analysis page with:
   - Drag-and-drop file upload
   - AI-powered analysis results:
     - Summary and key points extraction
     - Precedent matching with citations
     - Legal issues identification
     - AI recommendations
   - Export and copy functionality

6. **Vector Database Search** - Semantic law search with:
   - Search through 45+ Indian laws (mock data)
   - Relevance scoring display
   - Popular laws quick access
   - Integration-ready for Pinecone

7. **Case Details** - Comprehensive case view with:
   - Full case metadata and information
   - Tabbed interface (Overview, Full Text, Citations, Related Cases)
   - Judges, petitioner, respondent information
   - Bookmark and share functionality
   - Related cases navigation

### Architecture

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Wouter for routing
- TanStack Query for data fetching
- Shadcn UI components with Tailwind CSS
- Firebase SDK for authentication
- Dark/Light theme support

**Backend:**
- Express.js server
- In-memory storage (MemStorage)
- RESTful API endpoints
- Mock data for all features (ready for integration)
- CORS-enabled for future API integration

**Design System:**
- Professional legal color scheme (blue primary)
- Inter font for UI, JetBrains Mono for code/citations
- Consistent spacing and elevation system
- Responsive breakpoints (mobile, tablet, desktop)
- Accessible components with proper ARIA labels

## API Endpoints

### Search & Cases
- `GET /api/search` - Search legal cases with filters
- `GET /api/case/:id` - Get case details by ID

### Analysis
- `POST /api/analyze-judgment` - Analyze uploaded legal document

### Vector Search
- `GET /api/vector-search` - Semantic search through laws

### Authentication
- `POST /api/auth/register` - Register/sync Firebase user
- `GET /api/auth/user/:firebaseUid` - Get user by Firebase UID

## Data Models

### LegalCase
- Case metadata (number, title, court, date, judges)
- Full text and excerpt
- Citations and related cases
- Petitioner/respondent information
- Verdict and headnotes

### JudgmentAnalysis
- Document information
- AI-generated summary
- Key points extraction
- Precedents with citations
- Legal issues and recommendations

### VectorSearchResult
- Law name and section
- Content text
- Relevance score
- Metadata (act, year, category)

## Environment Variables Required

### Firebase (for authentication):
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_API_KEY` - Firebase API key

### Future Integration (not required for MVP):
- `OPENAI_API_KEY` - For AI judgment analysis
- Pinecone credentials - For vector search

## Running the Project

1. Install dependencies (already done via packager)
2. Configure Firebase secrets (use ask_secrets tool if needed)
3. Run `npm run dev` - Starts both frontend and backend
4. Access at the development URL

## Future Integration Points

### Ready for Integration:
1. **India Kanoon API** - Replace mock search in `storage.searchCases()`
2. **OpenAI GPT-5** - Implement real judgment analysis in `storage.analyzeJudgment()`
3. **Pinecone Vector DB** - Replace mock vector search in `storage.vectorSearch()`
4. **Web Scraping** - Fallback strategy for India Kanoon when API fails
5. **Caching Layer** - Add Redis or similar for 5-minute TTL caching

### Backend Services to Implement:
- Enhanced India Kanoon Service with retry logic and exponential backoff
- Multi-strategy search (API → Browser → Scraping → Templates)
- Document processing for file uploads
- User preferences and saved searches persistence

## User Preferences

- Professional legal design aesthetic
- Dark mode support throughout
- Responsive design for all screen sizes
- Accessibility-first approach
- Fast, efficient UX with loading states

## Recent Changes

- Created complete schema with all data models
- Built all frontend pages and components
- Implemented Firebase authentication
- Created mock backend with realistic legal data
- Set up routing with protected routes
- Designed professional legal-themed UI
- Added dark mode support
- Implemented responsive layouts

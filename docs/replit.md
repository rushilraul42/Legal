# BetterCall AI - Legal Research Platform

## Project Overview

BetterCall AI is a comprehensive AI-powered legal assistant platform specifically designed for lawyers and legal professionals. It showcases a complete frontend implementation with all features working on dummy data, ready for backend integration.

## Core Features (All Working on Frontend with Dummy Data)

1. **Landing Page** - Professional marketing page with:
   - Hero section with clear value proposition
   - Feature showcase grid
   - Statistics display
   - Responsive footer
   - Simple mock authentication
   - Dark/Light theme toggle

2. **Mock Authentication**
   - Simple localStorage-based mock authentication
   - No external dependencies required
   - Protected routes for authenticated users
   - User profile display in sidebar

3. **Dashboard** - Main application hub with:
   - Quick search functionality
   - Activity statistics (cases searched, analyses run, time saved)
   - Quick action cards for main features
   - Recent searches display
   - Research insights

4. **Case Search** - Advanced legal case search with:
   - Semantic search through 130K+ legal documents (mock data with 5 real cases)
   - Advanced filtering (court, jurisdiction, document type)
   - Real-time filtering
   - Case result cards with key metadata
   - Complete case information

5. **AI Judgment Analysis** - Document analysis page with:
   - Drag-and-drop file upload
   - Simulated AI-powered analysis results:
     - Summary and key points extraction
     - Precedent matching with citations
     - Legal issues identification
     - AI recommendations
   - Export and copy functionality

6. **Vector Database Search** - Semantic law search with:
   - Search through 45+ Indian laws (mock data with 5 real laws)
   - Relevance scoring display
   - Popular laws quick access
   - Semantic filtering

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
- TanStack Query (with mock data, no actual API calls)
- Shadcn UI components with Tailwind CSS
- Dark/Light theme support
- All data from `client/src/lib/mock-data.ts`

**Backend:**
- Express.js server (present but not used by frontend)
- In-memory storage (not currently used)
- Ready for future API integration

**Design System:**
- Professional legal color scheme (blue primary)
- Inter font for UI, JetBrains Mono for code/citations
- Consistent spacing and elevation system
- Responsive breakpoints (mobile, tablet, desktop)
- Accessible components with proper ARIA labels

## Mock Data

All application data is stored in `client/src/lib/mock-data.ts`:

- **5 Legal Cases** with full details (title, court, judges, full text, citations, etc.)
- **Judgment Analysis** with AI-generated insights
- **5 Vector Search Results** from Indian laws (Contract Act, IPC, Constitution, etc.)
- All data is realistic and representative of real legal documents

## Running the Project

1. Install dependencies: `npm install` (or use packager tool)
2. Run `npm run dev` - Starts both frontend and backend
3. Access the development URL
4. Click "Sign In" to automatically log in with mock user
5. Explore all features with dummy data

## No Environment Variables Required

The application runs completely on the frontend with no external dependencies:
- No Firebase configuration needed
- No API keys required
- No database setup needed
- Everything works out of the box

## Future Integration Points

### When Ready for Real Backend:

1. **Replace Mock Authentication** in `client/src/hooks/use-auth.tsx`
   - Integrate with Firebase or other auth provider
   - Update login/logout logic
   
2. **Replace Mock Data** in pages:
   - Update `client/src/pages/search.tsx` to use real API calls
   - Update `client/src/pages/analysis.tsx` to call analysis API
   - Update `client/src/pages/vector-search.tsx` to use vector DB
   - Update `client/src/pages/case-details.tsx` to fetch real case data

3. **Backend Services to Implement:**
   - India Kanoon API integration
   - OpenAI GPT-5 for judgment analysis
   - Pinecone Vector DB for semantic search
   - Web scraping fallback
   - Caching layer (Redis)

## User Experience

- Professional legal design aesthetic
- Dark mode support throughout
- Responsive design for all screen sizes
- Accessibility-first approach
- Fast, efficient UX with instant feedback (no loading delays from dummy data)
- All features functional and interactive

## Recent Changes

- Removed Firebase dependency
- Replaced all API calls with local mock data
- Simplified authentication to localStorage-based system
- Created comprehensive mock data library
- All features now work completely on frontend
- No backend/API configuration required

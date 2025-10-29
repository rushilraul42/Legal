# BetterCall AI - Comprehensive Design Guidelines

## Design Approach

**Selected Approach:** Professional Legal System (Design System-based)

**Rationale:** Legal professionals require a trustworthy, efficient interface prioritizing clarity and information density over visual experimentation. The design draws inspiration from Linear's clean data presentation, Stripe's professional restraint, and Notion's document-centric layouts.

**Core Principles:**
- Professional Trust: Conservative, credible aesthetic suitable for legal practice
- Information Hierarchy: Clear visual organization of complex legal data
- Efficiency First: Minimal friction for common legal research tasks
- Scannable Content: Dense information presented in digestible formats

---

## Typography System

**Primary Font:** Inter or similar (Google Fonts via CDN)
- Headers: Font weights 600-700, sizes from text-3xl (dashboard titles) to text-sm (metadata)
- Body: Font weight 400-500, text-base for primary content, text-sm for secondary
- Legal Text: Font weight 400, text-sm with increased line-height (1.7) for readability
- Code/Citations: Mono font (JetBrains Mono or Courier) for case numbers and legal citations

**Hierarchy:**
- Page Titles: text-3xl font-semibold
- Section Headers: text-2xl font-semibold
- Card/Panel Titles: text-lg font-medium
- Body Text: text-base font-normal
- Metadata/Labels: text-sm font-medium uppercase tracking-wide
- Fine Print: text-xs

---

## Layout & Spacing System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, and 16 exclusively
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-16
- Card gaps: gap-6 to gap-8
- Inline elements: space-x-2 to space-x-4

**Grid System:**
- Dashboard: 12-column grid with sidebar (w-64) + main content area
- Search Results: Single column on mobile, 2-column on tablet (md:grid-cols-2), maintain single column on desktop for readability
- Feature Cards: 3-column grid on desktop (lg:grid-cols-3), 2 on tablet, 1 on mobile
- Case Details: Single column max-w-4xl centered for optimal reading

**Container Strategy:**
- Full-width dashboard with fixed sidebar
- Content areas: max-w-6xl for main content, max-w-4xl for document reading
- Forms/Search: max-w-2xl centered

---

## Component Library

### Navigation & Header
**Top Navigation Bar:**
- Fixed header with backdrop-blur-lg effect
- Logo left, search bar center (max-w-xl), user menu right
- Height: h-16 with px-6 horizontal padding
- Navigation items with px-4 spacing, subtle underline on active state

**Sidebar (Dashboard):**
- Fixed left sidebar w-64, full height
- Navigation items with py-3 px-4, rounded-lg on hover
- Section dividers with border-t, my-4
- Collapsed state on mobile with slide-out animation

### Search Interface
**Search Bar:**
- Large focal element: h-12 with rounded-xl
- Icon left (Heroicons search), clear button right
- Prominent shadow (shadow-lg) to establish hierarchy
- Focus state: ring-2 with increased shadow

**Advanced Filters Panel:**
- Collapsible section below search bar
- Grid of filter chips (rounded-full, px-4 py-2)
- Date range picker, jurisdiction selector, document type toggles
- Apply/Clear actions with button group alignment

### Case Display Cards
**Result Cards:**
- Structured layout with clear sections:
  - Case number and title: text-lg font-semibold
  - Court and date metadata: text-sm with icon prefixes
  - Excerpt preview: text-sm with line-clamp-3
  - Action buttons: View Full Document, Add to Research
- Border-l-4 accent on left for visual scanning
- Hover state: subtle shadow increase (shadow-sm to shadow-md)
- Spacing: p-6 with gap-4 between sections

**Case Details View:**
- Document-style layout with max-w-4xl
- Sticky header with case number and quick actions
- Tabbed interface: Overview | Full Text | Citations | Analysis
- Citation references: Numbered footnotes with hover preview
- Related cases sidebar (optional, on desktop lg:grid-cols-3 with 2/3 + 1/3 split)

### Document Analysis Interface
**Upload Zone:**
- Large dropzone: min-h-64 with dashed border-2
- Centered icon (Heroicons document-arrow-up) and text
- Drag-over state: background shift, border solid
- File list below with remove buttons and file size display

**Analysis Results Panel:**
- Two-column split on desktop: Original document preview (60%) | AI Analysis (40%)
- Analysis sections with expandable accordions:
  - Key Points (bulleted list with text-sm)
  - Precedents Found (linked case cards)
  - Legal Issues Identified (badge chips)
  - Recommendations (numbered list)
- Copy-to-clipboard buttons for sections

### Data Display
**Tables (Case Lists):**
- Striped rows with alternating background
- Sticky header row
- Columns: Case Number | Title | Court | Date | Actions
- Sort icons in headers (Heroicons chevron-up-down)
- Row height: h-14 with px-4 cell padding

**Statistics Dashboard:**
- Metric cards in grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Each card: Large number (text-4xl), label below (text-sm), trend indicator
- Minimal design: p-6, rounded-lg, shadow-sm

### Forms & Inputs
**Input Fields:**
- Standard height: h-11 with px-4
- Label above: text-sm font-medium mb-2
- Helper text below: text-xs
- Error state: ring-2 with error text-xs

**Buttons:**
- Primary action: px-6 py-2.5, rounded-lg, font-medium
- Secondary: Same size with border-2
- Icon buttons: w-10 h-10, rounded-lg
- Button groups: Flush borders with rounded-l/rounded-r on ends

### Feedback Elements
**Loading States:**
- Skeleton screens for card grids (animate-pulse)
- Spinner for inline actions (Heroicons arrow-path with animate-spin)
- Progress bar for document uploads (h-2 rounded-full)

**Notifications/Toasts:**
- Fixed top-right position
- Slide-in animation from right
- Icon left, message center, close button right
- Auto-dismiss after 5 seconds

**Empty States:**
- Centered content with max-w-md
- Illustration or large icon (Heroicons scale)
- Heading and description
- Primary action button below

---

## Page Layouts

### Landing Page
**Structure (6-8 sections):**
1. **Hero:** Full viewport (min-h-screen), centered content, large heading (text-5xl), subheading, dual CTA buttons, hero image showing dashboard interface
2. **Features Grid:** 3 columns showcasing Semantic Search, AI Analysis, Vector Database with icons and descriptions (py-16)
3. **How It Works:** 3-step process with numbered cards and connecting lines
4. **Statistics Bar:** 4 metrics (130K+ cases, AI-powered, etc.) in single row
5. **Case Study/Demo:** Large screenshot with overlaid feature callouts
6. **Pricing/Access:** Simple card with benefits list and CTA
7. **Footer:** Multi-column (Company | Product | Resources | Legal) with newsletter signup

**Visual Elements:**
- Hero image: Dashboard screenshot or legal professional using platform
- Feature icons: Heroicons for search, document-text, chart-bar
- Screenshots: Actual interface previews with subtle shadow and rounded corners

### Dashboard (Main App)
**Layout:**
- Sidebar navigation (w-64 fixed left)
- Top bar with search (h-16 fixed top)
- Main content area with py-8 px-6
- Three-column info grid at top (Recent Cases | Saved Searches | Quick Actions)
- Primary search interface below
- Recent activity feed at bottom

### Search Results Page
**Layout:**
- Filters sidebar left (w-72, collapsible on mobile)
- Results list center (single column for readability)
- Results count and sort dropdown above list
- Pagination at bottom
- Infinite scroll as alternative

### Document Analysis Page
**Layout:**
- Document upload zone at top (if no document)
- Split view once analyzed (preview left, analysis right on desktop)
- Stack vertically on mobile
- Action toolbar sticky at top of analysis panel

---

## Responsive Behavior

**Breakpoints:**
- Mobile: Base styles (< 768px)
- Tablet: md: (768px+)
- Desktop: lg: (1024px+)

**Key Adaptations:**
- Sidebar: Slide-out drawer on mobile, fixed on desktop
- Search bar: Full width on mobile, max-w-xl centered on desktop
- Card grids: 1 column mobile, 2 tablet, 3 desktop
- Document viewer: Stack vertically on mobile, side-by-side on desktop

---

## Accessibility Standards

- All interactive elements: min-height h-11 for touch targets
- Form inputs: Associated labels with proper for/id pairing
- Skip-to-content link for keyboard navigation
- Focus rings: ring-2 with appropriate offset
- ARIA labels for icon-only buttons
- Heading hierarchy: Proper h1-h6 structure
- Color contrast: Text meets WCAG AA standards (implemented via color choices later)

---

## Images & Media

**Hero Section:** Large dashboard screenshot showcasing the search interface with results, dimensions approximately 1200x800, showing professional legal context

**Feature Sections:** Interface screenshots demonstrating key features (search results, document analysis view, case details page)

**About/Team:** Professional headshots if applicable, office environment photos conveying legal expertise

**Image Treatment:** All screenshots with rounded-xl corners and shadow-2xl, slight perspective tilt for depth

---

This design system creates a professional, trustworthy legal research platform that prioritizes clarity, efficiency, and information density while maintaining visual polish appropriate for legal professionals.
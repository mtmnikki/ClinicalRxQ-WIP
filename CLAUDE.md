# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                  # Install dependencies
npm run dev                  # Start development server with hot reload
npm run build                # Production build (minified, tree-shaken)
npm run lint                 # Run ESLint
npm run lint:fix             # Auto-fix linting issues
npm run preview              # Preview production build locally
npm run netlify:build        # Build for Netlify deployment
```

## High-Level Architecture

### Build System
- **esbuild** (scripts/build.mjs) with custom configuration
- Development: Hot reload, source maps, serves on localhost
- Production: Minified, tree-shaken, outputs to `dist/`
- File loaders: `.html` (copy), `.png/.svg/.jpg/.jpeg` (file)
- Path alias: `@/*` → `./src/*`
- Environment variables injected via `define` config

### Tech Stack
- **React 18** with TypeScript (strict mode)
- **Routing**: React Router v7 with HashRouter (#/)
- **State**: Zustand stores (bookmarkStore, auth/profile stores if present)
- **Styling**: Tailwind CSS + shadcn/ui components (50+ in src/components/ui/)
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (Auth + Database + Storage)

### Data Architecture

#### Supabase Integration
- **Client**: Single instance in `lib/supabaseClient.ts`
- **Service Layer**: Multiple service files in `src/services/`
  - `supabase.ts`: Main data operations
  - `supabaseStorage.ts`: File storage operations
  - `storageCatalog.ts`: Content catalog queries
  - `dashboardApi.ts`: Dashboard-specific data
- **Database Types**: Strongly typed via `types/database.types.ts`

#### Content Delivery System
Dual-source approach for reliability:
1. **Primary**: `storage_files_catalog` table (fast queries)
2. **Fallback**: Direct Supabase Storage API listing

Key tables/views used:
- `programs`: Clinical programs list
- `training_resources_view`: Training videos with sort_order
- `storage_files_catalog`: All content files catalog
- Program-specific views: `hba1c_view`, `mtmthefuturetoday_view`, etc.

### Component Architecture

```
src/
├── components/
│   ├── ui/          # shadcn/ui library (Radix UI + Tailwind)
│   ├── layout/      # AppShell, Header, Footer, Sidebar components
│   ├── auth/        # AuthContext, ProfileGate
│   ├── profiles/    # Profile management components
│   ├── resources/   # ResourceCard, ProgramResourceRow
│   └── common/      # Shared utilities (ErrorBoundary, ScrollToTop, etc.)
├── pages/           # Route components
├── services/        # API/data layer
├── stores/          # Zustand state management
├── lib/             # Utilities (utils.ts, slug.ts, cellValue.ts)
├── hooks/           # Custom React hooks
└── types/           # TypeScript definitions
```

### Routing Structure
HashRouter-based navigation:
- Public: `/`, `/contact`, `/login`, `/enroll`
- Protected: `/dashboard`, `/member-content`, `/resources`, `/program/:programSlug`, `/account`, `/bookmarks`

## Development Guidelines

### Code Quality
1. **Always run after changes**: `npm run lint` then `npm run lint:fix`
2. **ESLint rules**: No inner declarations, no functions in JSX blocks
3. **React**: No need to import React (modern JSX transform)
4. **TypeScript**: Strict mode enabled, use type imports where appropriate

### UI Components
- **Button variants**: Always add `className="bg-transparent"` for `variant="outline"`
- **Toasts**: Use Sonner, positioned top-center, 1.8s duration
- **Icons**: Lucide React library
- **Theme**: CSS variables support built-in

### Environment Variables
Required in production (use `.env` file or Netlify/Vercel dashboard):
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Development override via localStorage:
```javascript
localStorage.setItem('SUPABASE_URL', 'your-url')
localStorage.setItem('SUPABASE_ANON_KEY', 'your-key')
```

## Critical Implementation Details

### Authentication Flow
1. Multi-profile system via ProfileGate component
2. Supabase GoTrue for authentication
3. Auth state persists in localStorage
4. Flow: Login → Profile Selection → Protected Content

### Content Organization
Program slugs must match these exact mappings:
```typescript
'hba1c-testing' | 'hba1c' → 'HbA1C Testing (A1C)'
'timemymeds' | 'time-my-meds' → 'TimeMyMeds'
'oral-contraceptives' | 'oralcontraceptives' → 'Oral Contraceptives'
'mtm-the-future-today' | 'mtmthefuturetoday' → 'MTM The Future Today'
'test-and-treat' | 'testandtreat' → 'Test and Treat'
```

Special nested accordions for:
- **MTM The Future Today**: 4-level forms hierarchy
- **Test and Treat**: Condition-based forms (COVID/Flu/Strep)

### Database Query Patterns

#### Programs List
```sql
SELECT name, description, experience_level FROM programs ORDER BY name ASC
```

#### Training Videos (with sort order)
```sql
SELECT file_name, file_url, length FROM training_resources_view 
WHERE program_name = ? ORDER BY sort_order ASC
```

#### Resource Library (client-side filtering)
```sql
SELECT file_name, file_url, program_name, resource_type FROM storage_files_catalog
```

## Deployment

### Netlify Configuration
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18
- SPA redirects configured in `netlify.toml`

### Vercel Configuration
- Config in `vercel.json`
- Static build output to `dist/`

## Important Notes

1. **No test framework** currently configured - ask user before adding
2. **Desktop-first design** - dense layouts, small UI elements
3. **No video autoplay** - users must click to play
4. **Database over guessing** - use MIME types and sort orders from DB
5. **Clean rewrites preferred** over patches when refactoring
6. **Stores location**: Only `bookmarkStore.ts` exists in `src/stores/`
7. **Import style**: Use `import.meta.env` for Vite environment variables
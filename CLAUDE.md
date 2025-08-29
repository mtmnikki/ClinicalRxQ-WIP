# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start Vite dev server on port 3000
npm run build            # Production build with Vite (✅ WORKING)
npm run preview          # Preview production build
# ESLint: Currently using legacy .eslintrc.cjs but ESLint 9 requires migration
# For now, use npm run build to check for code issues
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite with React plugin and SVGR for SVG imports
- **Styling**: Tailwind CSS with shadcn/ui components (50+ Radix UI components)
- **Routing**: React Router v6 with HashRouter
- **State Management**: Zustand stores (bookmarkStore)
- **Authentication**: Supabase Auth with custom AuthContext and ProfileContext
- **Backend**: Supabase (Database + Storage + Auth)
- **Form Handling**: React Hook Form with Zod validation

### Project Structure
```
src/
├── components/
│   ├── ui/          # shadcn/ui components (accordion, dialog, button, etc.)
│   ├── layout/      # AppShell, Header, Footer, DashboardSidebarNav, MemberSidebar
│   ├── auth/        # ProfileGate
│   ├── profiles/    # AddProfileModal, ProfilesTable
│   ├── resources/   # ProgramResourceRow, ResourceCard
│   ├── home/        # ThreePillars
│   └── common/      # ErrorBoundary, SafeText, ScrollToTop, BackToTop, Breadcrumbs
├── pages/           # Route components (Home, Dashboard, Resources, etc.)
│   └── programDetail/  # ProgramDetail, trainingPlayer
├── contexts/        # AuthContext, ProfileContext
├── services/        # API services (supabase.ts, dashboardApi.ts, storageCatalog.ts)
├── lib/             # Utilities and Supabase client (supabaseClient.ts, utils.ts, slug.ts)
├── stores/          # Zustand stores (bookmarkStore.ts)
├── hooks/           # Custom hooks (use-toast, use-mobile)
└── types/           # TypeScript definitions (database.types.ts, dashboard.ts)
```

### Path Aliases
- `@/*` resolves to `./src/*` (configured in tsconfig.json and vite.config.ts)

## Key Implementation Patterns

### Authentication & Profiles
- **Multi-profile System**: Users can have multiple profiles selected via ProfileGate
- **Protected Routes**: Wrapped in ProtectedLayout with AuthProvider → ProfileProvider → ProfileGate
- **Auth Flow**: Supabase Auth → AuthContext → ProfileContext → Content
- **Profile Selection Required**: Users must select a profile after login to access protected content

### Data Layer
- **Supabase Client**: Single instance in `lib/supabaseClient.ts`
- **Database Views & Tables**:
  - `programs` - Clinical programs list
  - `training_resources_view` - Training videos with sort_order
  - Program-specific views: `hba1c_view`, `timemymeds_view`, `oralcontraceptives_view`, `mtmthefuturetoday_view`, `testandtreat_view`
  - `storage_files_catalog` - Complete resource catalog for filtering
- **Resource Types**: `training_module`, `protocol_manual`, `documentation_form`, `additional_resource`

### Routing Structure
HashRouter routes (all prefixed with #/):
- **Public**: `/`, `/contact`, `/login`
- **Protected**: `/dashboard`, `/member-content`, `/resources`, `/program/:programSlug`, `/account`, `/bookmarks`

### Critical Slug Mappings
ProgramDetail page requires these slug mappings:
```typescript
'hba1c-testing' → 'HbA1C Testing (A1C)'
'timemymeds' → 'TimeMyMeds'
'oral-contraceptives' → 'Oral Contraceptives'
'mtm-the-future-today' → 'MTM The Future Today'
'test-and-treat' → 'Test and Treat'
```

### UI Components
- **Base Components**: shadcn/ui with Radix UI primitives
- **Button Variants**: Always add `className="bg-transparent"` to `variant="outline"` buttons
- **Notifications**: Sonner toast (top-center, 1.8s duration)
- **Icons**: Lucide React
- **Nested Accordions**: Used for MTM and Test & Treat documentation forms (grouped by category/subcategory)

## Development Guidelines

### Code Quality
1. **Run ESLint after changes**: `npx eslint src`
2. **Fix linting issues**: `npx eslint src --fix`
3. **Never declare functions inside JSX** (enforced by ESLint)
4. **Follow React hooks rules** (no conditional hooks)

### Environment Variables
Required in `.env`:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Build System
- **Development**: Vite dev server with HMR on port 3000
- **Production**: Vite build with minification to `dist/`
- **SVG Support**: vite-plugin-svgr for importing SVGs as React components
- **TypeScript**: Configured but not enforced during build

## Current Implementation Status

### Recently Completed (✅ ALL WORKING)
- Migrated from custom esbuild to Vite
- Implemented real Supabase authentication with profiles
- Created program-specific database views
- Built TrainingPlayer component with video playlist
- Implemented Resources page with 6 filter cards and 20/80 split layout
- Added nested accordions for MTM and Test & Treat documentation
- **Profile-based bookmark system** (Netflix model - each profile has separate bookmarks)
- **Activity tracking** with `track_file_access` function for all file downloads/views
- **Database-backed bookmarks** replacing localStorage with Supabase `bookmarks` table
- **Dashboard updated** to use profile-specific recent activity data
- **Service layer consolidated** in `lib/supabaseClient.ts` with proper typing

### Status: ✅ FULLY FUNCTIONAL
- All builds passing (`npm run build` ✅)
- All service imports resolved 
- Profile-based bookmark and activity tracking working
- Dashboard using proper profile-specific data
- No broken imports or missing service files

## Important Preferences
- **Desktop-first design**: Dense layouts optimized for desktop
- **No autoplay videos**: User must explicitly click play
- **Database-driven sorting**: Use sort_order from DB, not client-side
- **Clean component rewrites**: Replace broken code rather than patching
- **Interactive UI**: Hover effects with shadows and gradient borders
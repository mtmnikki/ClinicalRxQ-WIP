# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install         # Install dependencies
npm run dev         # Start development server (esbuild with hot reload)
npm run build       # Production build (minified, tree-shaken)
node scripts/lint.mjs        # Run ESLint
node scripts/lint.mjs --fix  # Auto-fix linting issues
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: esbuild with custom scripts/build.mjs
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router v7 (HashRouter)
- **State Management**: Zustand stores (authStore, profilesStore, bookmarkStore)
- **Form Handling**: React Hook Form with Zod validation
- **Backend Integration**: Supabase (REST API + GoTrue auth)

### Project Structure
```
src/
├── components/
│   ├── ui/          # shadcn/ui component library (50+ components)
│   ├── layout/      # AppShell, Header, Footer, DashboardSidebarNav
│   ├── auth/        # AuthContext provider
│   ├── profiles/    # ProfileGate, AddProfileModal, ProfilesTable
│   ├── home/        # Homepage components (ThreePillars)
│   ├── resources/   # ResourceCard, ProgramResourceRow
│   └── common/      # SafeText, ErrorBoundary, ScrollToTop, BackToTop, Breadcrumbs
├── pages/           # Route-based page components
├── services/        # API integrations (supabase.ts, supabaseStorage.ts, storageCatalog.ts)
├── stores/          # Zustand state management
├── lib/             # Utility functions (utils.ts, slug.ts, cellValue.ts)
├── hooks/           # Custom React hooks (use-toast, use-mobile)
└── types/           # TypeScript definitions
```

### Path Aliases
- `@/*` resolves to `./src/*` (configured in tsconfig.json)

## Key Implementation Patterns

### Authentication & Profiles
- **Multi-profile System**: Users can have multiple profiles via ProfileGate component
- **Profile-based Access**: Protected routes require both authentication and profile selection
- **Auth Flow**: AuthContext → authStore → ProfileGate → Content
- **Supabase GoTrue**: Real authentication integrated with profiles table

### Data Layer
- **Supabase Service**: REST-based with typed interfaces (src/services/supabase.ts)
  - Programs, Training Modules, Protocol Manuals, Documentation Forms, Additional Resources
  - Patient Handouts, Clinical Guidelines, Medical Billing Resources
- **Storage Service**: Supabase storage integration (src/services/supabaseStorage.ts)
- **No Airtable**: Previously removed - all data operations go through Supabase

### Routing Structure
All routes use HashRouter (#/):
- Public: `/`, `/contact`, `/login`, `/enroll`
- Protected: `/dashboard`, `/member-content`, `/resources`, `/program/:programSlug`, `/account`, `/bookmarks`

### UI Components
- Base: shadcn/ui components (Radix UI + Tailwind)
- **Important**: For Button with `variant="outline"`, always include `className="bg-transparent"`
- Theme support via CSS variables
- Icons: Lucide React
- Notifications: Sonner toast system (top-center, 1.8s duration)

## Development Guidelines

### Quality Assurance
1. **Always run linting after changes**: `node scripts/lint.mjs`
2. **Fix linting issues**: `node scripts/lint.mjs --fix`
3. **Never declare functions inside JSX blocks**
4. **Follow React hooks rules** (no conditional hooks)
5. **Check visual rendering** on key pages: Home, Dashboard, ProgramDetail, Resources

### Testing
Currently no test framework is configured. When implementing tests:
1. Check package.json before assuming a test framework
2. Ask user for preferred testing approach

### Environment Variables
Required for production:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Environment variables can also be overridden via localStorage for development:
- `localStorage.setItem('SUPABASE_URL', 'your-url')`
- `localStorage.setItem('SUPABASE_ANON_KEY', 'your-key')`

## Build System

### Development Server
- esbuild with file watching and hot reload
- Serves on localhost with automatic port assignment
- Source maps enabled for debugging
- Automatic browser refresh on file changes

### Production Build
- Minification and tree-shaking enabled
- Output to `dist/` directory
- No source maps in production
- Static files (images) handled via file loader

### Deployment
- Vercel configuration present (vercel.json)
- API functions support in `api/` directory
- Static hosting compatible

## Important Notes

1. **ESLint Configuration**: Lives in .eslintrc.cjs - avoid editing package.json scripts
2. **Build Scripts**: Custom esbuild setup in scripts/build.mjs
3. **No TypeScript checking in build**: Use ESLint for type checking
4. **Route Structure**: Uses HashRouter - all routes must be hash-based (#/)
5. **Authentication State**: Real Supabase GoTrue integration, not mock data
6. **Profile Selection**: Users must select a profile after login via ProfileGate
7. **Storage URLs**: Use `getStorageUrl()` helper for Supabase public bucket files

## NIKKIS UPDATES FOR CLAUDE

### RECENT REFACTOR SUMMARY (Current Session Progress)

#### What We Fixed
- **Service Layer**: Created new `supabaseClient.ts` with correct table/view queries
- **MemberContent Page**: Now uses `programs` table instead of hardcoded data
- **ProgramDetail Page**: 
  - Uses `training_resources_view` with proper sort_order
  - Uses program-specific views for resources
  - Integrated TrainingPlayer component with video playlist
  - Handles nested accordions for MTM/Test & Treat
- **Resources Page**: 
  - 6 quick filter cards with hover effects at top
  - 20/80 split layout with comprehensive filters
  - Uses `storage_files_catalog` table
  - Client-side filtering for performance
- **TrainingPlayer**: Cleaned up - no sorting, uses DB order, added progress bar
- **ProgramResourceRow**: Dense desktop layout, video modal instead of new tabs

#### What Still Needs Work
- `dashboardApi.ts` still imports old `supabase.ts` service
- `ResourceCard.tsx` has old imports but needs to be kept
- Old service files need deletion: `supabase.ts`, `supabaseStorage.ts`, `storageCatalog.ts`
- Dashboard page needs updating to use new services

#### Build Errors to Fix (as of last session)
1. **authStore.ts line 56**: Syntax error with Date constructor
2. **supabase.ts line 228**: Import statement in wrong place (mixed with exports)
3. **SVG imports**: Multiple SVG files need loader configuration
4. **import.meta warnings**: Build config needs ESM format

#### Critical Slug Mappings (for ProgramDetail page)
```typescript
const SLUG_TO_PROGRAM = {
  'hba1c-testing': 'HbA1C Testing (A1C)',
  'hba1c': 'HbA1C Testing (A1C)',
  'timemymeds': 'TimeMyMeds',
  'time-my-meds': 'TimeMyMeds',
  'oral-contraceptives': 'Oral Contraceptives',
  'oralcontraceptives': 'Oral Contraceptives',
  'mtm-the-future-today': 'MTM The Future Today',
  'mtmthefuturetoday': 'MTM The Future Today',
  'test-and-treat': 'Test and Treat',
  'testandtreat': 'Test and Treat',
}
```

#### Important Preferences
- **Desktop-first**: Dense layouts, small UI elements
- **No autoplay videos**: Users must click play for engagement  
- **Use database properly**: MIME types, sort orders - no client-side guessing
- **Clean rewrites over patches**: Don't fix broken code, replace it
- **Pretty hover effects**: Shadows, movement, gradient borders are good

## NIKKIS UPDATES FOR CLAUDE

Of course. You are correct to demand a unified, comprehensive document. My apologies for the iterative approach.

Here is the complete, structured breakdown of the website's architecture, combining the user-facing front-end design with the specific back-end data requests required to power each page and feature.

***

## **Unified Website Architecture: Front-End & Back-End Specification**

This document outlines the complete plan for serving content to the ClinicalRxQ member website. It details both the user experience on the front-end and the precise, efficient Supabase database calls required on the back-end.

### **Part 1: The User Experience (Front-End Design)**

The member portal is designed for two primary user behaviors: structured, program-based learning and rapid, specific resource retrieval.

#### **Clinical Program Pages**

These pages are the core of the structured learning path. Each of the five clinical programs has a dedicated page that serves as a self-contained hub for all related materials. The interface is organized into clear, distinct tabs to prevent information overload.



* **Training Modules Tab**: Contains the core video-based training for the program. Each video is listed with its title and duration.
* **Manuals & Protocols Tab**: Houses the essential "how-to" guides and step-by-step Standard Operating Procedures (SOPs).
* **Documentation Forms Tab**: Provides all necessary downloadable and printable PDF forms, such as patient intake and consent forms.
* **Additional Resources Tab**: A repository for supplementary materials like links to external clinical guidelines or helpful articles.

**Special Case: Nested Accordions**
For programs with a high volume of forms like **MTM The Future Today** and **Test and Treat**, the "Documentation Forms" tab will feature a nested accordion layout to improve organization and reduce scrolling. Forms will be grouped first by `form_category` and then by `form_subcategory`, with all levels sorted alphabetically.

#### **The Resource Library**

The Resource Library is the central, searchable repository for every single piece of content on the site. It is designed for members who know exactly what they are looking for and need to find it quickly. Its primary feature is a powerful, persistent filtering system.



* **Search Bar**: Allows users to find resources by searching for keywords in the file's name.
* **Filter by Clinical Program**: Enables users to isolate all content belonging to one or more specific programs.
* **Filter by Resource Type**: Allows users to find a specific *type* of document (e.g., "protocol_manual", "documentation_form") across all programs simultaneously.

---

### **Part 2: The Data Engine (Back-End Requests)**

To ensure fast and efficient data delivery, the website will query a series of purpose-built tables and views from the Supabase database. The following is a definitive guide to the requests for each page.

#### **Page: Clinical Programs List**

* **Purpose**: To display all available programs for members to select.
* **Table to Call**: `programs`
* **Action**: Fetch all rows from the table, sorted alphabetically.
    * `SELECT name, description, experience_level FROM programs ORDER BY name ASC;`

#### **Page: Individual Clinical Program (e.g., "HbA1C Testing")**

This page uses a combination of views to populate its tabs efficiently.

* **Tab: "Training Modules"**
    * **Purpose**: To display videos in the correct sequence with their duration.
    * **Table to Call**: `training_resources_view`
    * **Action**: Fetch all training modules for the specific program, sorted by the pre-defined `sort_order`.
        * `SELECT file_name, file_url, length FROM training_resources_view WHERE program_name = 'HbA1C Testing (A1C)' ORDER BY sort_order ASC;`

* **Tab: "Manuals & Protocols"**
    * **Purpose**: To display an alphabetized list of all manuals for this program.
    * **Table to Call**: The program-specific view (e.g., `hba1c_view`).
    * **Action**: Fetch all resources of the type 'protocol_manual'.
        * `SELECT file_name, file_url FROM hba1c_view WHERE resource_type = 'protocol_manual' ORDER BY file_name ASC;`

* **Tab: "Documentation Forms" (Standard Programs like HbA1C, TimeMyMeds, Oral Contraceptives)**
    * **Purpose**: To display an alphabetized list of all forms for this program.
    * **Table to Call**: The program-specific view (e.g., `hba1c_view`).
    * **Action**: Fetch all resources of the type 'documentation_form'.
        * `SELECT file_name, file_url FROM hba1c_view WHERE resource_type = 'documentation_form' ORDER BY file_name ASC;`

* **Tab: "Documentation Forms" (Special Cases: MTM The Future Today & Test and Treat)**
    * **Purpose**: To fetch all forms and their categories to build the nested accordion UI.
    * **Table to Call**: The program-specific view (e.g., `mtmthefuturetoday_view`).
    * **Action**: Fetch all forms without sorting, as it will be handled on the front-end.
        * `SELECT file_name, file_url, form_category, form_subcategory FROM mtmthefuturetoday_view WHERE resource_type = 'documentation_form';`
    * **Front-End Logic**: The application code will receive this data and perform the grouping and alphabetizing necessary to render the nested accordions.

* **Tab: "Additional Resources"**
    * **Purpose**: To display an alphabetized list of all additional resources.
    * **Table to Call**: The program-specific view (e.g., `hba1c_view`).
    * **Action**: Fetch all resources of the type 'additional_resource'.
        * `SELECT file_name, file_url FROM hba1c_view WHERE resource_type = 'additional_resource' ORDER BY file_name ASC;`

#### **Page: Resource Library**

* **Purpose**: To provide a searchable and filterable view of every file on the site.
* **Table to Call for Initial Load**: `storage_files_catalog`
* **Action**: Fetch all rows. This provides the front-end with all the data it needs to perform client-side filtering without making additional database calls, resulting in a faster user experience.
    * `SELECT file_name, file_url, program_name, resource_type FROM storage_files_catalog;`
* **Filtering Logic**:
    * **Search Bar**: Filters the results locally where the `file_name` contains the search term.
    * **Filter by Program**: Filters the results locally where the `program_name` column matches the selected program(s).
    * **Filter by Resource Type**: Filters the results locally where the `resource_type` column matches the selected type(s).
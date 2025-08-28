# ClinicalRxQ Membership Portal

A React-based membership portal for community pharmacists providing access to clinical programs, training materials, protocols, and resources. Built with modern web technologies and powered by Supabase for authentication and content delivery.

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: esbuild with custom scripts
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand with persistence
- **Routing**: React Router v7
- **Authentication**: Supabase GoTrue
- **Backend**: Supabase (PostgreSQL + Storage)
- **Form Handling**: React Hook Form + Zod validation

### Project Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI components (button, card, etc.)
│   ├── layout/          # Shell components and navigation
│   ├── auth/            # Authentication components
│   ├── resources/       # Content display components
│   └── common/          # Shared utility components
├── pages/               # Route-based page components
├── services/            # API and external service integrations
├── stores/              # Zustand state management
├── lib/                 # Utility functions and helpers
├── config/              # Configuration files
└── types/              # TypeScript type definitions
```

## 🚀 Build Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Environment Variables
Create a `.env` file in the root directory:
```bash
VITE_SUPABASE_URL=https://xeyfhlmflsibxzjsirav.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation & Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
node scripts/lint.mjs

# Run linting with auto-fix
node scripts/lint.mjs --fix
```

### Build Configuration
- **Development**: esbuild dev server with hot reload
- **Production**: Minified bundle with tree shaking
- **Supported Files**: `.tsx`, `.ts`, `.css`, `.svg`, `.png`, `.jpeg`, `.jpg`
- **Output**: `dist/` directory

## 🔐 Authentication System

### Architecture Overview
The authentication system uses a layered architecture with Supabase GoTrue as the backend:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Login.tsx     │───▶│  authStore.ts    │───▶│  supabase.ts    │
│  (UI Layer)     │    │ (State Manager)  │    │ (Service Layer) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ AuthContext.tsx │◀───│   Zustand Store  │    │  lib/supabase.ts│
│ (React Context) │    │   (Persistence)  │    │  (Auth Client)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Authentication Flow

#### Login Process:
1. User enters credentials in `Login.tsx`
2. `Login.tsx` calls `useAuthStore().login(email, password)`
3. `authStore.login()` calls `authService.signIn(email, password)`
4. `authService.signIn()` calls `supabaseAuth.signIn()`
5. `supabaseAuth.signIn()` makes REST API call to Supabase
6. On success: session stored in localStorage
7. `authService.getCurrentProfile()` fetches user data
8. `authStore` updates state: `{ user, isAuthenticated: true }`
9. `Login.tsx` navigates to `/dashboard`

#### App Initialization:
1. App starts → `AuthProvider` mounts
2. `AuthProvider` calls `useAuthStore().checkAuth()`
3. `checkAuth()` calls `supabaseAuth.getSession()`
4. If valid session exists → fetch profile → set authenticated
5. If no session → set unauthenticated

### Key Authentication Files

1. **`src/stores/authStore.ts`** - Main authentication state management
   - Zustand store with persistence
   - Functions: `login()`, `logout()`, `register()`, `checkAuth()`, `updateProfile()`

2. **`src/lib/supabase.ts`** - Supabase authentication client
   - GoTrue API implementation
   - Session management (store/retrieve/refresh tokens)

3. **`src/services/supabase.ts`** - Authentication service interface
   - User profile management
   - Database integration

4. **`src/components/auth/AuthContext.tsx`** - React context provider
   - Bridges Zustand store to React context
   - Handles auth initialization on app start

5. **`src/pages/Login.tsx`** - Login page component
   - Form validation with Zod
   - Secret bypass functionality (Alt+Click for testing)

### Session Management
- **Storage**: localStorage (`supabase.auth.token`)
- **Persistence**: Zustand middleware saves `{ user, isAuthenticated }`
- **Refresh**: Automatic token refresh in `lib/supabase.ts`

### Security Features
- Token storage with automatic refresh
- Session validation on app start
- Comprehensive error handling at each layer
- Full TypeScript type safety

### Selected Profile
Users can have multiple profiles. The interface refers to the active one as the **Selected** profile. The database field `is_active`
is reserved for soft-delete semantics and should not appear in UI wording.

## 📡 API Integration

### Supabase Configuration
- **URL**: `https://xeyfhlmflsibxzjsirav.supabase.co`
- **Authentication**: GoTrue REST API
- **Database**: PostgreSQL with PostgREST
- **Storage**: File bucket `clinicalrxqfiles`

### API Services

#### Authentication API (`/auth/v1/`)
- `POST /signup` - User registration
- `POST /token?grant_type=password` - User login
- `POST /logout` - User logout
- `POST /recover` - Password recovery
- `PUT /user` - Update user metadata

#### Database API (`/rest/v1/`)
- `GET /storage_files_catalog` - Content catalog queries
- `GET /profiles` - User profile data

#### Storage API (`/storage/v1/`)
- `POST /object/list/{bucket}` - List files
- `GET /object/public/{bucket}/{path}` - Public file URLs

## 📁 Content API

Program and resource data are loaded from Supabase using `src/services/contentApi.ts`. Each PostgREST request specifies
`SELECT` aliases so responses return camelCase keys even though the underlying columns remain snake_case.

### Key functions

- `listPrograms()` – fetch all programs ordered by slug.
- `getProgramBySlug(slug)` – retrieve a single program.
- `listFilesByProgramId(programId, opts)` – files for a program with optional filters (`category`, `subcategory`, `q`, `isVideo`).
- `listAllFiles(opts)` – global file search with the same filters.
- `listAnnouncements()` – list announcements ordered by creation date.
- `listBookmarks(profileId)` – bookmarks for a specific profile.

`FileItem` objects include metadata such as `fileName`, `fileUrl`, `category`, `contentClass`, `useCase`, and `medicalConditions`.
Clients detect videos by checking `mimeType?.toLowerCase().startsWith('video/')`.

## 🔧 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Tailwind CSS for consistent styling
- Component-based architecture

### Testing
- No test suite currently configured
- Manual testing during development
- Build verification before deployment

### Deployment
- Static build output in `dist/`
- Environment variables required for production
- Supabase configuration for backend services

## 📚 Additional Resources

### Key Dependencies
- `react` + `react-dom` - UI framework
- `zustand` - State management
- `react-router` - Routing
- `react-hook-form` + `zod` - Forms and validation
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `esbuild` - Build tool

### File Structure Notes
- All pages are protected routes except public marketing pages
- Authentication state persists across browser sessions
- Content is dynamically loaded based on user access
- File uploads and management handled through Supabase Storage

### Support
For technical issues or questions about the codebase, refer to the inline code documentation and TypeScript type definitions throughout the project.
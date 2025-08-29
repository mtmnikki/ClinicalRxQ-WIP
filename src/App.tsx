/**
 * Main application component with routing
 * - Wraps ONLY protected routes with Auth and Profile providers.
 * - Public routes remain outside the authentication logic.
 */
import { HashRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import ProgramDetail from './pages/programDetail/ProgramDetail';
import MemberContent from './pages/MemberContent';
import AccountPage from './pages/Account';
import Bookmarks from './pages/Bookmarks';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Toaster } from 'sonner';
import ScrollToTop from './components/common/ScrollToTop';
import BackToTop from './components/common/BackToTop';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import ProfileGate from './components/auth/ProfileGate';

/**
 * A layout component that wraps all protected routes with the necessary providers and gatekeeper.
 */
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { account, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Optional: Render a full-page loading spinner during the initial auth check
    return (
       <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!account) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, wrap the content with the ProfileProvider and the ProfileGate
  return (
    <ProfileProvider>
      <ProfileGate>{children}</ProfileGate>
    </ProfileProvider>
  );
}

/**
 * App root component with correctly structured routing.
 */
export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <ErrorBoundary>
        <AuthProvider>
          <Routes>
            {/* Public Routes - Not wrapped by ProfileProvider or ProfileGate */}
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes - All wrapped by the ProtectedLayout */}
            <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/member-content" element={<ProtectedLayout><MemberContent /></ProtectedLayout>} />
            <Route path="/resources" element={<ProtectedLayout><Resources /></ProtectedLayout>} />
            <Route path="/program/:programSlug" element={<ProtectedLayout><ProgramDetail /></ProtectedLayout>} />
            <Route path="/account" element={<ProtectedLayout><AccountPage /></ProtectedLayout>} />
            <Route path="/bookmarks" element={<ProtectedLayout><Bookmarks /></ProtectedLayout>} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </ErrorBoundary>
      <Toaster position="top-center" richColors={false} closeButton={false} duration={1800} />
      <BackToTop />
    </HashRouter>
  );
}


import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { useOnboardingProgress } from './hooks/usePayment';
import { useAuth } from './contexts/AuthContext';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PromptStudio } from './pages/PromptStudio';
import { PromptEditor } from './pages/PromptEditor';
import { PromptExplorer } from './pages/PromptExplorer';
import { ComponentEditorPage } from './pages/ComponentEditorPage';
import { AssetEditorPage } from './pages/AssetEditorPage';
import { ComponentLibraryPage } from './pages/ComponentLibraryPage';
import { CommunityPage } from './pages/CommunityPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const { user } = useAuth();
  const { data: onboardingProgress } = useOnboardingProgress();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    if (user && onboardingProgress !== undefined) {
      setShowOnboarding(!onboardingProgress?.completed);
    }
  }, [user, onboardingProgress]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      <Routes>
        {/* Public Routes - No Layout needed, handled in components */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes - Layout handled by individual components */}
        <Route path="/studio" element={
          <ProtectedRoute>
            <PromptStudio />
          </ProtectedRoute>
        } />
        <Route path="/editor" element={
          <ProtectedRoute>
            <PromptEditor />
          </ProtectedRoute>
        } />
        <Route path="/component-editor/:id" element={
          <ProtectedRoute>
            <ComponentEditorPage />
          </ProtectedRoute>
        } />
        <Route path="/asset-editor/:id" element={
          <ProtectedRoute>
            <AssetEditorPage />
          </ProtectedRoute>
        } />
        <Route path="/explorer" element={
          <ProtectedRoute>
            <PromptExplorer />
          </ProtectedRoute>
        } />
        <Route path="/library" element={
          <ProtectedRoute>
            <ComponentLibraryPage />
          </ProtectedRoute>
        } />
        <Route path="/collections" element={
          <ProtectedRoute>
            <CollectionsPage />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-muted-foreground mt-2">Coming in Step 6</p>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/community" element={
          <ProtectedRoute>
            <CommunityPage />
          </ProtectedRoute>
        } />
        <Route path="/docs" element={
          <ProtectedRoute>
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <h1 className="text-2xl font-bold">Documentation</h1>
              <p className="text-muted-foreground mt-2">Coming in Step 6</p>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<SettingsPage />} />
      </Routes>

      {/* Onboarding Flow */}
      {showOnboarding && user && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <AppContent />
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
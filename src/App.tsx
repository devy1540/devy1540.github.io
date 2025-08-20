import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Layout } from '@/components/layout/Layout';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { TopLoadingBar } from '@/components/common/TopLoadingBar';
import { Toaster } from '@/components/ui/sonner';
import { HomePage } from '@/pages/HomePage';
import { PostsPage } from '@/pages/PostsPage';
import { PostDetailPage } from '@/pages/PostDetailPage';
import { AboutPage } from '@/pages/AboutPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TestPage } from '@/pages/TestPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function RedirectHandler() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handle GitHub Pages SPA fallback redirect
    const redirectPath = window.sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      window.sessionStorage.removeItem('redirectPath');
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);
  
  return null;
}

export function App() {
  const { theme, applyCurrentTheme } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount and when theme changes
    applyCurrentTheme();
  }, [theme, applyCurrentTheme]);

  return (
    <BrowserRouter>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen bg-background">
          <AppSidebar />
          <div className="flex-1 flex justify-center items-start min-w-0 overflow-hidden">
            <main className="w-full max-w-4xl mx-auto px-8 lg:px-12">
              <RedirectHandler />
              <TopLoadingBar />
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/posts" element={<Layout><PostsPage /></Layout>} />
                <Route path="/post/:slug" element={<Layout><PostDetailPage /></Layout>} />
                <Route path="/about" element={<Layout><AboutPage /></Layout>} />
                <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
                <Route path="/test" element={<Layout><TestPage /></Layout>} />
                <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
              </Routes>
            </main>
          </div>
        </div>
        <Toaster richColors closeButton />
      </SidebarProvider>
    </BrowserRouter>
  );
}
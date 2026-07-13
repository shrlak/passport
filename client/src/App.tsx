import { Navigate, Outlet, Route, Routes } from 'react-router';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LocationProvider } from './hooks/useGeolocation';
import { BottomNav } from './components/BottomNav';
import AuthPage from './pages/AuthPage';
import PassportPage from './pages/PassportPage';
import ExplorePage from './pages/ExplorePage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import AddPlacePage from './pages/AddPlacePage';
import ProfilePage from './pages/ProfilePage';
import GalleryPage from './pages/GalleryPage';

function Shell() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="font-display text-xl text-ink-soft">StampQuest</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <div className="mx-auto min-h-dvh max-w-md pb-24">
      <Outlet />
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route element={<Shell />}>
            <Route index element={<PassportPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="place/:id" element={<PlaceDetailPage />} />
            <Route path="add" element={<AddPlacePage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LocationProvider>
    </AuthProvider>
  );
}

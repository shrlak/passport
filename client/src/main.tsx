import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { MotionConfig } from 'framer-motion';
import './index.css';
import App from './App';

// When a newly deployed service worker takes control, reload once so an
// installed PWA cannot keep running an older local-only application bundle.
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  let reloadingForUpdate = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadingForUpdate) return;
    reloadingForUpdate = true;
    window.location.reload();
  });
}

// A browser refresh always reopens the passport at its landing page. Client-
// side links still preserve the selected category/place during normal use.
const navigationEntry = performance.getEntriesByType('navigation')[0] as
  | PerformanceNavigationTiming
  | undefined;
const legacyNavigation = performance as Performance & {
  navigation?: { type: number; TYPE_RELOAD: number };
};
const legacyWasReload =
  legacyNavigation.navigation !== undefined &&
  legacyNavigation.navigation.type === legacyNavigation.navigation.TYPE_RELOAD;
const wasReload =
  navigationEntry?.type === 'reload' ||
  legacyWasReload;

if (wasReload) {
  window.history.replaceState(null, '', import.meta.env.BASE_URL);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
);

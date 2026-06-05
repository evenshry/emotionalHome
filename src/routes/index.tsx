import { createHashRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import App from '@/App';

const HomePage = lazy(() => import('@pages/HomePage'));
const VentPage = lazy(() => import('@pages/VentPage'));
const GuidePage = lazy(() => import('@pages/GuidePage'));
const TransformPage = lazy(() => import('@pages/TransformPage'));
const DashboardPage = lazy(() => import('@pages/DashboardPage'));
const SummaryPage = lazy(() => import('@pages/SummaryPage'));

const LoadingSpinner = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <div
      style={{
        width: '40px',
        height: '40px',
        border: '4px solid rgba(255, 140, 102, 0.2)',
        borderRadius: '50%',
        borderTopColor: '#FF8C66',
        animation: 'spin 1s ease-in-out infinite',
      }}
    />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <HomePage />
          </LazyWrapper>
        ),
      },
      {
        path: '/vent',
        element: (
          <LazyWrapper>
            <VentPage />
          </LazyWrapper>
        ),
      },
      {
        path: '/guide',
        element: (
          <LazyWrapper>
            <GuidePage />
          </LazyWrapper>
        ),
      },
      {
        path: '/transform',
        element: (
          <LazyWrapper>
            <TransformPage />
          </LazyWrapper>
        ),
      },
      {
        path: '/dashboard',
        element: (
          <LazyWrapper>
            <DashboardPage />
          </LazyWrapper>
        ),
      },
      {
        path: '/summary',
        element: (
          <LazyWrapper>
            <SummaryPage />
          </LazyWrapper>
        ),
      },
    ],
  },
]);

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevLocation, setPrevLocation] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevLocation) {
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setPrevLocation(location.pathname);
        setIsTransitioning(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location, prevLocation]);

  return (
    <div className="page-transition-container">
      <div
        className={`page-transition-content ${isTransitioning ? 'page-transition-exit' : 'page-transition-enter'}`}
      >
        {children}
      </div>
      
      {isTransitioning && (
        <div className="page-transition-overlay" />
      )}
    </div>
  );
}

export default PageTransition;
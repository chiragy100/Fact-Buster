import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook that automatically scrolls to the top of the page
 * whenever the route changes (location.pathname changes)
 */
const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top whenever the pathname changes
    // Use smooth scrolling for better UX, fallback to instant scroll
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    } else {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }
  }, [pathname]);
};

export default useScrollToTop; 
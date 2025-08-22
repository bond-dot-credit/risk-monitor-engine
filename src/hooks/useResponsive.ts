import { useState, useEffect } from 'react';

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveState {
  viewport: ViewportSize;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

// Tailwind CSS breakpoints
const BREAKPOINTS = {
  mobile: 768,    // 0-767px
  tablet: 1024,   // 768-1023px
  desktop: 1024   // 1024px+
} as const;

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    viewport: 'mobile',
    width: 0,
    height: 0,
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait'
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let viewport: ViewportSize = 'mobile';
      if (width >= BREAKPOINTS.desktop) {
        viewport = 'desktop';
      } else if (width >= BREAKPOINTS.mobile) {
        viewport = 'tablet';
      }

      const orientation = width > height ? 'landscape' : 'portrait';

      setState({
        viewport,
        width,
        height,
        isMobile: viewport === 'mobile',
        isTablet: viewport === 'tablet',
        isDesktop: viewport === 'desktop',
        orientation
      });
    };

    // Initial call
    updateViewport();

    // Listen for resize events
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return state;
}

// Hook for managing mobile sheet states
export function useMobileSheet(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const { isMobile } = useResponsive();

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  // Auto-close when switching from mobile to larger screens
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  return {
    isOpen,
    open,
    close,
    toggle,
    isMobile
  };
}

// Hook for managing responsive sidebar states
export function useResponsiveSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { viewport, isMobile } = useResponsive();

  const toggle = () => setIsCollapsed(!isCollapsed);
  const collapse = () => setIsCollapsed(true);
  const expand = () => setIsCollapsed(false);

  // Auto-collapse on mobile, auto-expand on desktop
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    } else if (viewport === 'desktop') {
      setIsCollapsed(false);
    }
  }, [viewport, isMobile]);

  return {
    isCollapsed,
    toggle,
    collapse,
    expand,
    shouldShowAsModal: isMobile,
    shouldShowAsSidebar: !isMobile
  };
}
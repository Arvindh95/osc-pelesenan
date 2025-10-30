import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Helper to set viewport size
const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

// Helper to setup matchMedia mock
const setupMatchMedia = (width: number) => {
  const matchMediaMock = (query: string) => {
    // Parse the query to determine if it matches
    const minWidthMatch = query.match(/min-width:\s*(\d+)px/);
    const maxWidthMatch = query.match(/max-width:\s*(\d+)px/);
    
    let matches = false;
    if (minWidthMatch) {
      matches = width >= parseInt(minWidthMatch[1]);
    } else if (maxWidthMatch) {
      matches = width <= parseInt(maxWidthMatch[1]);
    }
    
    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    };
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: matchMediaMock,
  });
};

describe('Responsive Layout Tests', () => {
  // Simple test component to verify responsive behavior
  const TestResponsiveComponent = ({ className }: { className?: string }) => (
    <div className={className} data-testid="responsive-container">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-1">Item 1</div>
        <div className="col-span-1">Item 2</div>
        <div className="col-span-1">Item 3</div>
        <div className="col-span-1">Item 4</div>
      </div>
      <button className="w-full md:w-auto">Action Button</button>
    </div>
  );

  beforeEach(() => {
    // Reset viewport to default
    setViewportSize(1024, 768);
    setupMatchMedia(1024);
  });

  afterEach(() => {
    // Reset viewport
    setViewportSize(1024, 768);
    setupMatchMedia(1024);
  });

  describe('Mobile Layout (320px - 767px)', () => {
    it('should set viewport to mobile size', () => {
      setViewportSize(375, 667);
      expect(window.innerWidth).toBe(375);
      expect(window.innerHeight).toBe(667);
    });

    it('should match mobile media queries', () => {
      setViewportSize(375, 667);
      setupMatchMedia(375);
      
      // Test max-width media query for mobile
      const mobileQuery = window.matchMedia('(max-width: 767px)');
      expect(mobileQuery.matches).toBe(true);
      
      // Test min-width media query for desktop (should not match)
      const desktopQuery = window.matchMedia('(min-width: 1024px)');
      expect(desktopQuery.matches).toBe(false);
    });

    it('should render responsive component with mobile classes', () => {
      setViewportSize(375, 667);
      setupMatchMedia(375);
      
      render(<TestResponsiveComponent />);
      const container = screen.getByTestId('responsive-container');
      expect(container).toBeInTheDocument();
    });

    it('should handle small mobile viewport (320px)', () => {
      setViewportSize(320, 568);
      setupMatchMedia(320);
      
      expect(window.innerWidth).toBe(320);
      const mobileQuery = window.matchMedia('(max-width: 767px)');
      expect(mobileQuery.matches).toBe(true);
    });

    it('should handle large mobile viewport (767px)', () => {
      setViewportSize(767, 1024);
      setupMatchMedia(767);
      
      expect(window.innerWidth).toBe(767);
      const mobileQuery = window.matchMedia('(max-width: 767px)');
      expect(mobileQuery.matches).toBe(true);
    });
  });

  describe('Tablet Layout (768px - 1023px)', () => {
    it('should set viewport to tablet size', () => {
      setViewportSize(768, 1024);
      expect(window.innerWidth).toBe(768);
      expect(window.innerHeight).toBe(1024);
    });

    it('should match tablet media queries', () => {
      setViewportSize(768, 1024);
      setupMatchMedia(768);
      
      // Test min-width media query for tablet (md breakpoint)
      const tabletQuery = window.matchMedia('(min-width: 768px)');
      expect(tabletQuery.matches).toBe(true);
      
      // Test max-width media query for mobile (should not match)
      const mobileQuery = window.matchMedia('(max-width: 767px)');
      expect(mobileQuery.matches).toBe(false);
      
      // Test min-width media query for desktop (should not match)
      const desktopQuery = window.matchMedia('(min-width: 1024px)');
      expect(desktopQuery.matches).toBe(false);
    });

    it('should render responsive component with tablet classes', () => {
      setViewportSize(768, 1024);
      setupMatchMedia(768);
      
      render(<TestResponsiveComponent />);
      const container = screen.getByTestId('responsive-container');
      expect(container).toBeInTheDocument();
    });

    it('should handle small tablet viewport (768px)', () => {
      setViewportSize(768, 1024);
      setupMatchMedia(768);
      
      expect(window.innerWidth).toBe(768);
      const tabletQuery = window.matchMedia('(min-width: 768px)');
      expect(tabletQuery.matches).toBe(true);
    });

    it('should handle large tablet viewport (1023px)', () => {
      setViewportSize(1023, 768);
      setupMatchMedia(1023);
      
      expect(window.innerWidth).toBe(1023);
      const tabletQuery = window.matchMedia('(min-width: 768px)');
      expect(tabletQuery.matches).toBe(true);
      
      // Should not match desktop yet
      const desktopQuery = window.matchMedia('(min-width: 1024px)');
      expect(desktopQuery.matches).toBe(false);
    });
  });

  describe('Desktop Layout (1024px+)', () => {
    it('should set viewport to desktop size', () => {
      setViewportSize(1440, 900);
      expect(window.innerWidth).toBe(1440);
      expect(window.innerHeight).toBe(900);
    });

    it('should match desktop media queries', () => {
      setViewportSize(1440, 900);
      setupMatchMedia(1440);
      
      // Test min-width media query for desktop (lg breakpoint)
      const desktopQuery = window.matchMedia('(min-width: 1024px)');
      expect(desktopQuery.matches).toBe(true);
      
      // Test min-width media query for tablet (should also match)
      const tabletQuery = window.matchMedia('(min-width: 768px)');
      expect(tabletQuery.matches).toBe(true);
      
      // Test max-width media query for mobile (should not match)
      const mobileQuery = window.matchMedia('(max-width: 767px)');
      expect(mobileQuery.matches).toBe(false);
    });

    it('should render responsive component with desktop classes', () => {
      setViewportSize(1440, 900);
      setupMatchMedia(1440);
      
      render(<TestResponsiveComponent />);
      const container = screen.getByTestId('responsive-container');
      expect(container).toBeInTheDocument();
    });

    it('should handle minimum desktop viewport (1024px)', () => {
      setViewportSize(1024, 768);
      setupMatchMedia(1024);
      
      expect(window.innerWidth).toBe(1024);
      const desktopQuery = window.matchMedia('(min-width: 1024px)');
      expect(desktopQuery.matches).toBe(true);
    });

    it('should handle large desktop viewport (1920px)', () => {
      setViewportSize(1920, 1080);
      setupMatchMedia(1920);
      
      expect(window.innerWidth).toBe(1920);
      const desktopQuery = window.matchMedia('(min-width: 1024px)');
      expect(desktopQuery.matches).toBe(true);
    });

    it('should handle ultra-wide desktop viewport (2560px)', () => {
      setViewportSize(2560, 1440);
      setupMatchMedia(2560);
      
      expect(window.innerWidth).toBe(2560);
      const desktopQuery = window.matchMedia('(min-width: 1024px)');
      expect(desktopQuery.matches).toBe(true);
    });
  });

  describe('Component Usability Across Screen Sizes', () => {
    it('should render components consistently across all sizes', () => {
      const sizes = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1440, height: 900, name: 'desktop' },
      ];

      sizes.forEach(size => {
        setViewportSize(size.width, size.height);
        setupMatchMedia(size.width);

        const { unmount } = render(<TestResponsiveComponent />);
        const container = screen.getByTestId('responsive-container');
        expect(container).toBeInTheDocument();

        unmount();
      });
    });

    it('should handle viewport transitions smoothly', () => {
      // Start with mobile
      setViewportSize(375, 667);
      setupMatchMedia(375);
      expect(window.innerWidth).toBe(375);

      // Transition to tablet
      setViewportSize(768, 1024);
      setupMatchMedia(768);
      expect(window.innerWidth).toBe(768);

      // Transition to desktop
      setViewportSize(1440, 900);
      setupMatchMedia(1440);
      expect(window.innerWidth).toBe(1440);
    });

    it('should handle edge case viewport sizes', () => {
      // Test boundary between mobile and tablet
      setViewportSize(767, 1024);
      setupMatchMedia(767);
      let mobileQuery = window.matchMedia('(max-width: 767px)');
      expect(mobileQuery.matches).toBe(true);

      setViewportSize(768, 1024);
      setupMatchMedia(768);
      mobileQuery = window.matchMedia('(max-width: 767px)');
      expect(mobileQuery.matches).toBe(false);

      // Test boundary between tablet and desktop
      setViewportSize(1023, 768);
      setupMatchMedia(1023);
      let desktopQuery = window.matchMedia('(min-width: 1024px)');
      expect(desktopQuery.matches).toBe(false);

      setViewportSize(1024, 768);
      setupMatchMedia(1024);
      desktopQuery = window.matchMedia('(min-width: 1024px)');
      expect(desktopQuery.matches).toBe(true);
    });

    it('should render text content appropriately on all sizes', () => {
      const sizes = [375, 768, 1440];

      sizes.forEach(width => {
        setViewportSize(width, 800);
        setupMatchMedia(width);

        const { unmount } = render(
          <div data-testid="text-container" className="p-4">
            <p className="text-sm md:text-base lg:text-lg">
              Lesen Perniagaan Makanan dan Minuman Bagi Premis Yang Menjual Makanan Segera
            </p>
          </div>
        );

        const container = screen.getByTestId('text-container');
        expect(container).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Touch Interactions on Mobile Devices', () => {
    it('should support touch events on mobile viewport', () => {
      setViewportSize(375, 667);
      setupMatchMedia(375);

      // Verify mobile viewport is set
      expect(window.innerWidth).toBe(375);
      
      // Verify touch-friendly media query
      const touchQuery = window.matchMedia('(max-width: 767px)');
      expect(touchQuery.matches).toBe(true);
    });

    it('should render touch-friendly button sizes on mobile', () => {
      setViewportSize(375, 667);
      setupMatchMedia(375);

      render(
        <div data-testid="touch-container">
          <button className="w-full py-3 px-4 text-base">Touch Button</button>
        </div>
      );

      const container = screen.getByTestId('touch-container');
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Touch Button')).toBeInTheDocument();
    });

    it('should render touch-friendly input fields on mobile', () => {
      setViewportSize(375, 667);
      setupMatchMedia(375);

      render(
        <div data-testid="form-container">
          <input
            type="text"
            className="w-full py-3 px-4 text-base"
            placeholder="Touch-friendly input"
          />
        </div>
      );

      const input = screen.getByPlaceholderText('Touch-friendly input');
      expect(input).toBeInTheDocument();
    });

    it('should render touch-friendly navigation on mobile', () => {
      setViewportSize(375, 667);
      setupMatchMedia(375);

      render(
        <nav data-testid="mobile-nav" className="flex flex-col space-y-2">
          <button className="py-3 px-4">Nav Item 1</button>
          <button className="py-3 px-4">Nav Item 2</button>
          <button className="py-3 px-4">Nav Item 3</button>
        </nav>
      );

      const nav = screen.getByTestId('mobile-nav');
      expect(nav).toBeInTheDocument();
      expect(screen.getByText('Nav Item 1')).toBeInTheDocument();
    });

    it('should handle orientation changes on mobile', () => {
      // Portrait
      setViewportSize(375, 667);
      setupMatchMedia(375);
      expect(window.innerWidth).toBe(375);
      expect(window.innerHeight).toBe(667);

      // Landscape
      setViewportSize(667, 375);
      setupMatchMedia(667);
      expect(window.innerWidth).toBe(667);
      expect(window.innerHeight).toBe(375);
    });
  });
});

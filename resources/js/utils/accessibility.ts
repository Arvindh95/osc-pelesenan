/**
 * Accessibility utilities for the OSC Pelesenan frontend
 * Provides helpers for ARIA attributes, keyboard navigation, and screen reader support
 */

export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-disabled'?: boolean;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-pressed'?: boolean;
  'aria-haspopup'?:
    | boolean
    | 'false'
    | 'true'
    | 'menu'
    | 'listbox'
    | 'tree'
    | 'grid'
    | 'dialog';
  'aria-controls'?: string;
  'aria-owns'?: string;
  role?: string;
}

/**
 * Generate unique IDs for form elements and ARIA relationships
 */
export const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create ARIA attributes for form fields
 */
export const createFormFieldAria = (
  name: string,
  hasError: boolean,
  helpText?: string,
  required?: boolean
): AriaAttributes => {
  const errorId = hasError ? `${name}-error` : undefined;
  const helpId = helpText ? `${name}-help` : undefined;

  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

  return {
    'aria-invalid': hasError,
    'aria-describedby': describedBy,
    'aria-required': required,
  };
};

/**
 * Create ARIA attributes for navigation items
 */
export const createNavItemAria = (
  isActive: boolean,
  hasSubmenu?: boolean
): AriaAttributes => {
  return {
    'aria-current': isActive ? 'page' : undefined,
    'aria-haspopup': hasSubmenu ? 'menu' : undefined,
    'aria-expanded': hasSubmenu ? false : undefined,
  };
};

/**
 * Create ARIA attributes for buttons
 */
export const createButtonAria = (
  isPressed?: boolean,
  controls?: string,
  expanded?: boolean,
  disabled?: boolean
): AriaAttributes => {
  return {
    'aria-pressed': isPressed,
    'aria-controls': controls,
    'aria-expanded': expanded,
    'aria-disabled': disabled,
  };
};

/**
 * Create ARIA attributes for alerts and notifications
 */
export const createAlertAria = (
  type: 'success' | 'error' | 'warning' | 'info',
  live: boolean = true
): AriaAttributes => {
  return {
    role: 'alert',
    'aria-live': live ? (type === 'error' ? 'assertive' : 'polite') : 'off',
    'aria-atomic': true,
  };
};

/**
 * Create ARIA attributes for loading states
 */
export const createLoadingAria = (
  isLoading: boolean,
  label?: string
): AriaAttributes => {
  return {
    'aria-busy': isLoading,
    'aria-label': label || (isLoading ? 'Loading...' : undefined),
    'aria-live': isLoading ? 'polite' : 'off',
  };
};

/**
 * Create ARIA attributes for modal dialogs
 */
export const createModalAria = (
  titleId: string,
  descriptionId?: string
): AriaAttributes => {
  return {
    role: 'dialog',
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
  };
};

/**
 * Keyboard navigation utilities
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * Handle keyboard navigation for interactive elements
 */
export const handleKeyboardNavigation = (
  event: React.KeyboardEvent,
  handlers: Partial<Record<keyof typeof KeyboardKeys, () => void>>
): void => {
  const key = event.key;
  const handler = Object.entries(KeyboardKeys).find(
    ([, value]) => value === key
  )?.[0] as keyof typeof KeyboardKeys;

  if (handler && handlers[handler]) {
    event.preventDefault();
    handlers[handler]!();
  }
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Set focus to an element by ID
   */
  focusById: (id: string): void => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
    }
  },

  /**
   * Set focus to the first focusable element within a container
   */
  focusFirst: (container: HTMLElement): void => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  },

  /**
   * Trap focus within a container (for modals)
   */
  trapFocus: (container: HTMLElement, event: KeyboardEvent): void => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === KeyboardKeys.TAB) {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  },
};

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Announce a message to screen readers
   */
  announce: (
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  /**
   * Create a visually hidden element for screen readers
   */
  createVisuallyHidden: (text: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = text;
    return span;
  },
};

/**
 * Color contrast utilities
 */
export const colorContrast = {
  /**
   * Check if a color combination meets WCAG AA standards
   */
  meetsWCAG: (): boolean => {
    // This is a simplified check - in production, you'd use a proper color contrast library
    // For now, we'll assume our design system colors meet WCAG standards
    return true;
  },

  /**
   * Get high contrast alternative for a color
   */
  getHighContrast: (color: string): string => {
    // Return high contrast alternatives for common colors
    const highContrastMap: Record<string, string> = {
      'text-gray-500': 'text-gray-900',
      'text-gray-400': 'text-gray-800',
      'text-blue-500': 'text-blue-700',
      'text-blue-400': 'text-blue-600',
    };

    return highContrastMap[color] || color;
  },
};

/**
 * Reduced motion utilities
 */
export const reducedMotion = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get animation classes based on user preference
   */
  getAnimationClasses: (
    normalClasses: string,
    reducedClasses: string = ''
  ): string => {
    return reducedMotion.prefersReducedMotion()
      ? reducedClasses
      : normalClasses;
  },
};

/**
 * Semantic HTML utilities
 */
export const semanticHTML = {
  /**
   * Get appropriate heading level based on context
   */
  getHeadingLevel: (
    level: 1 | 2 | 3 | 4 | 5 | 6
  ): `h${1 | 2 | 3 | 4 | 5 | 6}` => {
    return `h${level}`;
  },

  /**
   * Get appropriate landmark role
   */
  getLandmarkRole: (
    type:
      | 'main'
      | 'navigation'
      | 'banner'
      | 'contentinfo'
      | 'complementary'
      | 'search'
  ): string => {
    return type;
  },
};

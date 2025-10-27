import { useEffect, useCallback, RefObject } from 'react';
import {
  KeyboardKeys,
  handleKeyboardNavigation,
  focusManagement,
} from '../utils/accessibility';

interface UseKeyboardNavigationOptions {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  trapFocus?: boolean;
  containerRef?: RefObject<HTMLElement>;
}

/**
 * Custom hook for handling keyboard navigation and accessibility
 */
export const useKeyboardNavigation = (
  options: UseKeyboardNavigationOptions = {}
) => {
  const {
    onEnter,
    onSpace,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onHome,
    onEnd,
    trapFocus = false,
    containerRef,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Handle focus trapping for modals
      if (trapFocus && containerRef?.current) {
        focusManagement.trapFocus(containerRef.current, event);
      }

      // Handle keyboard navigation
      handleKeyboardNavigation(event as any, {
        ENTER: onEnter,
        SPACE: onSpace,
        ESCAPE: onEscape,
        ARROW_UP: onArrowUp,
        ARROW_DOWN: onArrowDown,
        ARROW_LEFT: onArrowLeft,
        ARROW_RIGHT: onArrowRight,
        TAB: onTab,
        HOME: onHome,
        END: onEnd,
      });
    },
    [
      onEnter,
      onSpace,
      onEscape,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onTab,
      onHome,
      onEnd,
      trapFocus,
      containerRef,
    ]
  );

  useEffect(() => {
    if (trapFocus && containerRef?.current) {
      // Focus first element when modal opens
      focusManagement.focusFirst(containerRef.current);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, trapFocus, containerRef]);

  return {
    handleKeyDown: (event: React.KeyboardEvent) =>
      handleKeyDown(event.nativeEvent),
  };
};

/**
 * Hook for managing focus within a list of items (like navigation menus)
 */
export const useListNavigation = (
  items: Array<{ id: string; disabled?: boolean }>,
  options: {
    orientation?: 'horizontal' | 'vertical';
    loop?: boolean;
    onSelect?: (id: string) => void;
  } = {}
) => {
  const { orientation = 'vertical', loop = true, onSelect } = options;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentIndex: number) => {
      const enabledItems = items.filter(item => !item.disabled);
      const currentEnabledIndex = enabledItems.findIndex(
        item => item.id === items[currentIndex]?.id
      );

      let nextIndex = currentEnabledIndex;

      switch (event.key) {
        case KeyboardKeys.ARROW_DOWN:
          if (orientation === 'vertical') {
            event.preventDefault();
            nextIndex = currentEnabledIndex + 1;
            if (nextIndex >= enabledItems.length) {
              nextIndex = loop ? 0 : enabledItems.length - 1;
            }
          }
          break;

        case KeyboardKeys.ARROW_UP:
          if (orientation === 'vertical') {
            event.preventDefault();
            nextIndex = currentEnabledIndex - 1;
            if (nextIndex < 0) {
              nextIndex = loop ? enabledItems.length - 1 : 0;
            }
          }
          break;

        case KeyboardKeys.ARROW_RIGHT:
          if (orientation === 'horizontal') {
            event.preventDefault();
            nextIndex = currentEnabledIndex + 1;
            if (nextIndex >= enabledItems.length) {
              nextIndex = loop ? 0 : enabledItems.length - 1;
            }
          }
          break;

        case KeyboardKeys.ARROW_LEFT:
          if (orientation === 'horizontal') {
            event.preventDefault();
            nextIndex = currentEnabledIndex - 1;
            if (nextIndex < 0) {
              nextIndex = loop ? enabledItems.length - 1 : 0;
            }
          }
          break;

        case KeyboardKeys.HOME:
          event.preventDefault();
          nextIndex = 0;
          break;

        case KeyboardKeys.END:
          event.preventDefault();
          nextIndex = enabledItems.length - 1;
          break;

        case KeyboardKeys.ENTER:
        case KeyboardKeys.SPACE:
          event.preventDefault();
          if (onSelect && items[currentIndex]) {
            onSelect(items[currentIndex].id);
          }
          break;
      }

      if (nextIndex !== currentEnabledIndex) {
        const nextItem = enabledItems[nextIndex];
        if (nextItem) {
          focusManagement.focusById(nextItem.id);
        }
      }
    },
    [items, orientation, loop, onSelect]
  );

  return { handleKeyDown };
};

/**
 * Hook for managing roving tabindex in a group of elements
 */
export const useRovingTabIndex = (
  items: Array<{ id: string; disabled?: boolean }>,
  activeId?: string
) => {
  const getTabIndex = useCallback(
    (itemId: string) => {
      if (activeId) {
        return itemId === activeId ? 0 : -1;
      }
      // If no active item, make first enabled item focusable
      const firstEnabledItem = items.find(item => !item.disabled);
      return itemId === firstEnabledItem?.id ? 0 : -1;
    },
    [items, activeId]
  );

  return { getTabIndex };
};

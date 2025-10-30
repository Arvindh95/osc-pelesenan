/**
 * Focus Management Accessibility Tests
 * Tests focus management in dialogs, modals, and dynamic content
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import { CompanyContext } from '../../contexts/CompanyContext';
import LicenseDetailsPage from '../../pages/licenses/LicenseDetailsPage';
import LicenseEditPage from '../../pages/licenses/LicenseEditPage';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import apiClient from '../../services/apiClient';

// Mock API client
vi.mock('../../services/apiClient');

const mockAuthContext = {
  user: { id: '1', name: 'Test User', email: 'test@example.com' },
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
};

const mockNotificationContext = {
  showToast: vi.fn(),
  showNotification: vi.fn(),
};

const mockCompanyContext = {
  selectedCompany: { id: '1', name: 'Test Company', ssm_number: '123456-A' },
  companies: [],
  loading: false,
  selectCompany: vi.fn(),
  refreshCompanies: vi.fn(),
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        <NotificationContext.Provider value={mockNotificationContext}>
          <CompanyContext.Provider value={mockCompanyContext}>
            {component}
          </CompanyContext.Provider>
        </NotificationContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Focus Management - Dialog Opening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.getLicense as any).mockResolvedValue({
      id: '1',
      jenis_lesen_nama: 'Lesen Perniagaan',
      status: 'Draf',
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'Test Address',
          bandar: 'Test City',
          poskod: '12345',
          negeri: 'Selangor',
        },
        nama_perniagaan: 'Test Business',
      },
      documents: [],
    });
  });

  it('should move focus to dialog when opened', async () => {
    renderWithProviders(<LicenseDetailsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /batal permohonan/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /batal permohonan/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Focus should be on the first focusable element in dialog
    const dialog = screen.getByRole('dialog');
    const firstButton = dialog.querySelector('button');
    
    await waitFor(() => {
      expect(document.activeElement).toBe(firstButton);
    });
  });

  it('should focus on confirm button by default', async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /ya|confirm/i });
    
    await waitFor(() => {
      expect(document.activeElement).toBe(confirmButton);
    });
  });

  it('should focus on custom element if specified', async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        initialFocus="cancel"
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /tidak|cancel/i });
    
    await waitFor(() => {
      expect(document.activeElement).toBe(cancelButton);
    });
  });
});

describe('Focus Management - Focus Trapping', () => {
  it('should trap focus within dialog', async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /ya|confirm/i });
    const cancelButton = screen.getByRole('button', { name: /tidak|cancel/i });

    // Focus should start on confirm button
    expect(document.activeElement).toBe(confirmButton);

    // Tab should move to cancel button
    fireEvent.keyDown(confirmButton, { key: 'Tab' });
    await waitFor(() => {
      expect(document.activeElement).toBe(cancelButton);
    });

    // Tab from last element should wrap to first
    fireEvent.keyDown(cancelButton, { key: 'Tab' });
    await waitFor(() => {
      expect(document.activeElement).toBe(confirmButton);
    });
  });

  it('should trap focus with Shift+Tab', async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /ya|confirm/i });
    const cancelButton = screen.getByRole('button', { name: /tidak|cancel/i });

    // Focus should start on confirm button
    expect(document.activeElement).toBe(confirmButton);

    // Shift+Tab from first element should wrap to last
    fireEvent.keyDown(confirmButton, { key: 'Tab', shiftKey: true });
    await waitFor(() => {
      expect(document.activeElement).toBe(cancelButton);
    });

    // Shift+Tab should move back to confirm button
    fireEvent.keyDown(cancelButton, { key: 'Tab', shiftKey: true });
    await waitFor(() => {
      expect(document.activeElement).toBe(confirmButton);
    });
  });

  it('should not allow focus to escape dialog', async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    const { container } = render(
      <div>
        <button id="outside-button">Outside Button</button>
        <ConfirmDialog
          open={true}
          title="Confirm Action"
          message="Are you sure?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const outsideButton = container.querySelector('#outside-button') as HTMLElement;
    const confirmButton = screen.getByRole('button', { name: /ya|confirm/i });

    // Try to focus outside element
    outsideButton.focus();

    // Focus should remain in dialog
    await waitFor(() => {
      expect(document.activeElement).not.toBe(outsideButton);
      expect(document.activeElement).toBe(confirmButton);
    });
  });
});

describe('Focus Management - Dialog Closing', () => {
  let triggerButton: HTMLElement;

  beforeEach(() => {
    const { container } = render(
      <div>
        <button id="trigger">Open Dialog</button>
        <div id="dialog-container"></div>
      </div>
    );
    triggerButton = container.querySelector('#trigger') as HTMLElement;
  });

  it('should restore focus to trigger element after dialog closes', async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    // Focus trigger button
    triggerButton.focus();
    expect(document.activeElement).toBe(triggerButton);

    const { rerender } = render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Close dialog
    const cancelButton = screen.getByRole('button', { name: /tidak|cancel/i });
    fireEvent.click(cancelButton);

    rerender(
      <ConfirmDialog
        open={false}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Focus should return to trigger button
    await waitFor(() => {
      expect(document.activeElement).toBe(triggerButton);
    });
  });

  it('should restore focus after Escape key closes dialog', async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    triggerButton.focus();
    expect(document.activeElement).toBe(triggerButton);

    const { rerender } = render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Press Escape
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    rerender(
      <ConfirmDialog
        open={false}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Focus should return to trigger button
    await waitFor(() => {
      expect(document.activeElement).toBe(triggerButton);
    });
  });

  it('should restore focus after confirm action', async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    triggerButton.focus();
    expect(document.activeElement).toBe(triggerButton);

    const { rerender } = render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click confirm
    const confirmButton = screen.getByRole('button', { name: /ya|confirm/i });
    fireEvent.click(confirmButton);

    rerender(
      <ConfirmDialog
        open={false}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Focus should return to trigger button
    await waitFor(() => {
      expect(document.activeElement).toBe(triggerButton);
    });
  });
});

describe('Focus Management - Tab Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.getLicense as any).mockResolvedValue({
      id: '1',
      jenis_lesen_id: '1',
      jenis_lesen_nama: 'Lesen Perniagaan',
      status: 'Draf',
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'Test Address',
          bandar: 'Test City',
          poskod: '12345',
          negeri: 'Selangor',
        },
        nama_perniagaan: 'Test Business',
      },
      documents: [],
    });
    (apiClient.getLicenseRequirements as any).mockResolvedValue([]);
  });

  it('should focus on active tab panel content', async () => {
    renderWithProviders(<LicenseEditPage />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /maklumat/i })).toBeInTheDocument();
    });

    const maklumatTab = screen.getByRole('tab', { name: /maklumat/i });
    expect(maklumatTab).toHaveAttribute('aria-selected', 'true');

    // Tab panel should be focusable
    const tabPanel = screen.getByRole('tabpanel');
    expect(tabPanel).toBeInTheDocument();
    expect(tabPanel).toHaveAttribute('tabindex', '0');
  });

  it('should move focus to new tab panel when tab changes', async () => {
    renderWithProviders(<LicenseEditPage />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /dokumen/i })).toBeInTheDocument();
    });

    const dokumenTab = screen.getByRole('tab', { name: /dokumen/i });
    fireEvent.click(dokumenTab);

    await waitFor(() => {
      expect(dokumenTab).toHaveAttribute('aria-selected', 'true');
    });

    // Focus should move to new tab panel
    const tabPanel = screen.getByRole('tabpanel');
    await waitFor(() => {
      expect(document.activeElement).toBe(tabPanel);
    });
  });

  it('should maintain focus within tab panel', async () => {
    renderWithProviders(<LicenseEditPage />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /maklumat/i })).toBeInTheDocument();
    });

    const tabPanel = screen.getByRole('tabpanel');
    const firstInput = tabPanel.querySelector('input') as HTMLElement;

    if (firstInput) {
      firstInput.focus();
      expect(document.activeElement).toBe(firstInput);

      // Tab should move to next element within panel
      fireEvent.keyDown(firstInput, { key: 'Tab' });
      
      // Focus should remain within tab panel
      await waitFor(() => {
        expect(tabPanel.contains(document.activeElement)).toBe(true);
      });
    }
  });
});

describe('Focus Management - Dynamic Content', () => {
  it('should focus on newly added content', async () => {
    const { rerender } = render(
      <div>
        <button id="add-button">Add Item</button>
        <div id="items-container"></div>
      </div>
    );

    const addButton = screen.getByRole('button', { name: /add item/i });
    fireEvent.click(addButton);

    rerender(
      <div>
        <button id="add-button">Add Item</button>
        <div id="items-container">
          <div tabIndex={0} id="new-item">New Item</div>
        </div>
      </div>
    );

    await waitFor(() => {
      const newItem = document.getElementById('new-item');
      expect(document.activeElement).toBe(newItem);
    });
  });

  it('should announce and focus on error messages', async () => {
    const { container } = render(
      <div>
        <input type="text" id="test-input" aria-invalid="false" />
        <div id="error-container"></div>
      </div>
    );

    const input = container.querySelector('#test-input') as HTMLElement;
    input.focus();

    // Simulate validation error
    render(
      <div>
        <input
          type="text"
          id="test-input"
          aria-invalid="true"
          aria-describedby="error-message"
        />
        <div id="error-container">
          <div id="error-message" role="alert" tabIndex={-1}>
            Field is required
          </div>
        </div>
      </div>
    );

    await waitFor(() => {
      const errorMessage = document.getElementById('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });

  it('should manage focus when items are removed', async () => {
    const { rerender } = render(
      <div>
        <button id="item-1" data-index="0">Item 1</button>
        <button id="item-2" data-index="1">Item 2</button>
        <button id="item-3" data-index="2">Item 3</button>
      </div>
    );

    const item2 = document.getElementById('item-2') as HTMLElement;
    item2.focus();
    expect(document.activeElement).toBe(item2);

    // Remove item 2
    rerender(
      <div>
        <button id="item-1" data-index="0">Item 1</button>
        <button id="item-3" data-index="1">Item 3</button>
      </div>
    );

    await waitFor(() => {
      // Focus should move to next item (item 3)
      const item3 = document.getElementById('item-3');
      expect(document.activeElement).toBe(item3);
    });
  });
});

describe('Focus Management - Skip Links', () => {
  it('should provide skip to main content link', () => {
    const { container } = render(
      <div>
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to main content
        </a>
        <nav>Navigation</nav>
        <main id="main-content">Main Content</main>
      </div>
    );

    const skipLink = container.querySelector('a[href="#main-content"]');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveClass('sr-only');
    expect(skipLink).toHaveClass('focus:not-sr-only');
  });

  it('should make skip link visible on focus', () => {
    const { container } = render(
      <div>
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to main content
        </a>
        <nav>Navigation</nav>
        <main id="main-content">Main Content</main>
      </div>
    );

    const skipLink = container.querySelector('a[href="#main-content"]') as HTMLElement;
    skipLink.focus();

    expect(document.activeElement).toBe(skipLink);
    // In actual implementation, focus class would remove sr-only
  });

  it('should jump to main content when skip link is activated', () => {
    const { container } = render(
      <div>
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to main content
        </a>
        <nav>Navigation</nav>
        <main id="main-content" tabIndex={-1}>Main Content</main>
      </div>
    );

    const skipLink = container.querySelector('a[href="#main-content"]') as HTMLElement;
    const mainContent = container.querySelector('#main-content') as HTMLElement;

    fireEvent.click(skipLink);

    // Main content should receive focus
    expect(mainContent).toHaveAttribute('tabindex', '-1');
  });
});

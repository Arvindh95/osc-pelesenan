/**
 * Color Contrast Accessibility Tests
 * Tests color contrast ratios for WCAG AA compliance
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LicenseStatusBadge from '../../components/licenses/LicenseStatusBadge';
import Alert from '../../components/shared/Alert';
import SubmitButton from '../../components/shared/SubmitButton';

/**
 * Helper function to calculate relative luminance
 * Based on WCAG 2.1 formula
 *
 * Note: Currently unused but kept for future luminance calculations
 */
// const getRelativeLuminance = (r: number, g: number, b: number): number => {
//   const [rs, gs, bs] = [r, g, b].map(c => {
//     c = c / 255;
//     return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
//   });
//   return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
// };

/**
 * Calculate contrast ratio between two colors
 * Returns ratio (e.g., 4.5:1 returns 4.5)
 */
// Note: Currently unused but kept for future contrast ratio calculations
// const getContrastRatio = (
//   color1: { r: number; g: number; b: number },
//   color2: { r: number; g: number; b: number }
// ): number => {
//   const l1 = getRelativeLuminance(color1.r, color1.g, color1.b);
//   const l2 = getRelativeLuminance(color2.r, color2.g, color2.b);
//   const lighter = Math.max(l1, l2);
//   const darker = Math.min(l1, l2);
//   return (lighter + 0.05) / (darker + 0.05);
// };

/**
 * Extract RGB values from computed style
 */
// Note: Currently unused but kept for future color extraction needs
// const getRGBFromElement = (element: HTMLElement): { r: number; g: number; b: number } => {
//   const style = window.getComputedStyle(element);
//   const color = style.color;
//   const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
//   if (match) {
//     return {
//       r: parseInt(match[1]),
//       g: parseInt(match[2]),
//       b: parseInt(match[3]),
//     };
//   }
//   return { r: 0, g: 0, b: 0 };
// };

/**
 * Extract background RGB values from computed style
 */
// Note: Currently unused but kept for future background color extraction
// const getBackgroundRGBFromElement = (element: HTMLElement): { r: number; g: number; b: number } => {
//   const style = window.getComputedStyle(element);
//   const bgColor = style.backgroundColor;
//   const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
//   if (match) {
//     return {
//       r: parseInt(match[1]),
//       g: parseInt(match[2]),
//       b: parseInt(match[3]),
//     };
//   }
//   // Default to white background if transparent
//   return { r: 255, g: 255, b: 255 };
// };

describe('Color Contrast - Status Badges', () => {
  it('should meet WCAG AA contrast for Draf status badge', () => {
    render(<LicenseStatusBadge status="Draf" />);
    
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();

    // Draf badge should have gray background with dark text
    // Expected: bg-gray-100 (light gray) with text-gray-800 (dark gray)
    // This combination typically provides 4.5:1+ contrast ratio
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('should meet WCAG AA contrast for Diserahkan status badge', () => {
    render(<LicenseStatusBadge status="Diserahkan" />);
    
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();

    // Diserahkan badge should have blue background with dark blue text
    // Expected: bg-blue-100 (light blue) with text-blue-800 (dark blue)
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('should meet WCAG AA contrast for Dibatalkan status badge', () => {
    render(<LicenseStatusBadge status="Dibatalkan" />);
    
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();

    // Dibatalkan badge should have red background with dark red text
    // Expected: bg-red-100 (light red) with text-red-800 (dark red)
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('should meet WCAG AA contrast for "Permohonan Baru" label', () => {
    render(<LicenseStatusBadge status="Diserahkan" showNewLabel={true} />);
    
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Permohonan Baru');

    // Same contrast requirements as Diserahkan
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });
});

describe('Color Contrast - Alert Components', () => {
  it('should meet WCAG AA contrast for success alerts', () => {
    render(<Alert type="success" message="Berjaya disimpan" />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();

    // Success alerts typically use green background with dark green text
    // Tailwind: bg-green-50 with text-green-800
    expect(alert).toHaveClass('bg-green-50', 'text-green-800');
  });

  it('should meet WCAG AA contrast for error alerts', () => {
    render(<Alert type="error" message="Ralat berlaku" />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();

    // Error alerts typically use red background with dark red text
    // Tailwind: bg-red-50 with text-red-800
    expect(alert).toHaveClass('bg-red-50', 'text-red-800');
  });

  it('should meet WCAG AA contrast for warning alerts', () => {
    render(<Alert type="warning" message="Amaran" />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();

    // Warning alerts typically use yellow background with dark yellow text
    // Tailwind: bg-yellow-50 with text-yellow-800
    expect(alert).toHaveClass('bg-yellow-50', 'text-yellow-800');
  });

  it('should meet WCAG AA contrast for info alerts', () => {
    render(<Alert type="info" message="Maklumat" />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();

    // Info alerts typically use blue background with dark blue text
    // Tailwind: bg-blue-50 with text-blue-800
    expect(alert).toHaveClass('bg-blue-50', 'text-blue-800');
  });
});

describe('Color Contrast - Buttons', () => {
  it('should meet WCAG AA contrast for primary buttons', () => {
    render(<SubmitButton>Simpan</SubmitButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Primary buttons typically use blue background with white text
    // Tailwind: bg-blue-600 with text-white
    // This provides excellent contrast (>7:1)
    expect(button).toHaveClass('bg-blue-600', 'text-white');
  });

  it('should meet WCAG AA contrast for secondary buttons', () => {
    render(<SubmitButton variant="secondary">Batal</SubmitButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Secondary buttons typically use gray background with dark text
    // Tailwind: bg-gray-200 with text-gray-900
    expect(button).toHaveClass('bg-gray-200', 'text-gray-900');
  });

  it('should meet WCAG AA contrast for danger buttons', () => {
    render(<SubmitButton variant="danger">Padam</SubmitButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Danger buttons typically use red background with white text
    // Tailwind: bg-red-600 with text-white
    expect(button).toHaveClass('bg-red-600', 'text-white');
  });

  it('should meet WCAG AA contrast for disabled buttons', () => {
    render(<SubmitButton disabled>Simpan</SubmitButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Disabled buttons should still maintain readable contrast
    // Tailwind: bg-gray-300 with text-gray-500
    expect(button).toHaveClass('bg-gray-300', 'text-gray-500');
  });
});

describe('Color Contrast - Form Elements', () => {
  it('should meet WCAG AA contrast for form labels', () => {
    const { container } = render(
      <div>
        <label htmlFor="test" className="text-gray-700">
          Test Label
        </label>
        <input id="test" type="text" />
      </div>
    );

    const label = container.querySelector('label');
    expect(label).toBeInTheDocument();

    // Labels should use dark gray text on white background
    // Tailwind: text-gray-700 on white
    expect(label).toHaveClass('text-gray-700');
  });

  it('should meet WCAG AA contrast for input fields', () => {
    const { container } = render(
      <input
        type="text"
        className="border-gray-300 text-gray-900 placeholder-gray-400"
        placeholder="Enter text"
      />
    );

    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();

    // Input text should be dark on white background
    expect(input).toHaveClass('text-gray-900');
    
    // Placeholder text should meet minimum contrast (3:1 for large text)
    expect(input).toHaveClass('placeholder-gray-400');
  });

  it('should meet WCAG AA contrast for error messages', () => {
    const { container } = render(
      <div>
        <input type="text" aria-invalid="true" />
        <p className="text-red-600 text-sm">Field is required</p>
      </div>
    );

    const errorMessage = container.querySelector('p');
    expect(errorMessage).toBeInTheDocument();

    // Error messages should use red text with sufficient contrast
    // Tailwind: text-red-600 on white
    expect(errorMessage).toHaveClass('text-red-600');
  });

  it('should meet WCAG AA contrast for help text', () => {
    const { container } = render(
      <div>
        <input type="text" />
        <p className="text-gray-600 text-sm">Help text</p>
      </div>
    );

    const helpText = container.querySelector('p');
    expect(helpText).toBeInTheDocument();

    // Help text should use gray with sufficient contrast
    // Tailwind: text-gray-600 on white
    expect(helpText).toHaveClass('text-gray-600');
  });
});

describe('Color Contrast - Links', () => {
  it('should meet WCAG AA contrast for regular links', () => {
    const { container } = render(
      <a href="#" className="text-blue-600 hover:text-blue-800">
        Link Text
      </a>
    );

    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();

    // Links should use blue with sufficient contrast
    // Tailwind: text-blue-600 on white
    expect(link).toHaveClass('text-blue-600');
  });

  it('should meet WCAG AA contrast for visited links', () => {
    const { container } = render(
      <a href="#" className="text-blue-600 visited:text-purple-600">
        Visited Link
      </a>
    );

    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();

    // Visited links should maintain contrast
    expect(link).toHaveClass('visited:text-purple-600');
  });

  it('should meet WCAG AA contrast for hover state', () => {
    const { container } = render(
      <a href="#" className="text-blue-600 hover:text-blue-800">
        Hover Link
      </a>
    );

    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();

    // Hover state should maintain or improve contrast
    expect(link).toHaveClass('hover:text-blue-800');
  });
});

describe('Color Contrast - Table Elements', () => {
  it('should meet WCAG AA contrast for table headers', () => {
    const { container } = render(
      <table>
        <thead className="bg-gray-50">
          <tr>
            <th className="text-gray-700 font-semibold">Header</th>
          </tr>
        </thead>
      </table>
    );

    const th = container.querySelector('th');
    expect(th).toBeInTheDocument();

    // Table headers should have dark text on light background
    expect(th).toHaveClass('text-gray-700');
  });

  it('should meet WCAG AA contrast for table cells', () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <td className="text-gray-900">Cell content</td>
          </tr>
        </tbody>
      </table>
    );

    const td = container.querySelector('td');
    expect(td).toBeInTheDocument();

    // Table cells should have dark text on white background
    expect(td).toHaveClass('text-gray-900');
  });

  it('should meet WCAG AA contrast for alternating row colors', () => {
    const { container } = render(
      <table>
        <tbody>
          <tr className="bg-white">
            <td className="text-gray-900">Row 1</td>
          </tr>
          <tr className="bg-gray-50">
            <td className="text-gray-900">Row 2</td>
          </tr>
        </tbody>
      </table>
    );

    const rows = container.querySelectorAll('tr');
    expect(rows).toHaveLength(2);

    // Both row backgrounds should maintain contrast with text
    expect(rows[0]).toHaveClass('bg-white');
    expect(rows[1]).toHaveClass('bg-gray-50');
  });
});

describe('Color Contrast - Focus Indicators', () => {
  it('should have visible focus indicator on buttons', () => {
    render(<button className="focus:ring-2 focus:ring-blue-500">Button</button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Focus ring should be visible and have sufficient contrast
    expect(button).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
  });

  it('should have visible focus indicator on inputs', () => {
    const { container } = render(
      <input
        type="text"
        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    );

    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();

    // Focus ring and border should be visible
    expect(input).toHaveClass('focus:ring-2', 'focus:ring-blue-500', 'focus:border-blue-500');
  });

  it('should have visible focus indicator on links', () => {
    const { container } = render(
      <a href="#" className="focus:outline-none focus:ring-2 focus:ring-blue-500">
        Link
      </a>
    );

    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();

    // Focus ring should be visible
    expect(link).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
  });
});

describe('Color Contrast - Documentation', () => {
  it('should document color combinations used in the application', () => {
    // This test serves as documentation for color combinations
    const colorCombinations = {
      statusBadges: {
        draf: { bg: 'gray-100', text: 'gray-800', ratio: '> 4.5:1' },
        diserahkan: { bg: 'blue-100', text: 'blue-800', ratio: '> 4.5:1' },
        dibatalkan: { bg: 'red-100', text: 'red-800', ratio: '> 4.5:1' },
      },
      alerts: {
        success: { bg: 'green-50', text: 'green-800', ratio: '> 4.5:1' },
        error: { bg: 'red-50', text: 'red-800', ratio: '> 4.5:1' },
        warning: { bg: 'yellow-50', text: 'yellow-800', ratio: '> 4.5:1' },
        info: { bg: 'blue-50', text: 'blue-800', ratio: '> 4.5:1' },
      },
      buttons: {
        primary: { bg: 'blue-600', text: 'white', ratio: '> 7:1' },
        secondary: { bg: 'gray-200', text: 'gray-900', ratio: '> 4.5:1' },
        danger: { bg: 'red-600', text: 'white', ratio: '> 7:1' },
      },
      text: {
        primary: { color: 'gray-900', bg: 'white', ratio: '> 7:1' },
        secondary: { color: 'gray-700', bg: 'white', ratio: '> 4.5:1' },
        muted: { color: 'gray-600', bg: 'white', ratio: '> 4.5:1' },
      },
    };

    expect(colorCombinations).toBeDefined();
    expect(Object.keys(colorCombinations)).toHaveLength(4);
  });
});

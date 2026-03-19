import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders with default variant and default small size', () => {
    render(<Badge>Test</Badge>);

    const badge = screen.getByText('Test');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-slate-700/50', 'text-[10px]');
  });

  it('renders success variant with medium size classes', () => {
    render(
      <Badge variant="success" size="md">
        Success
      </Badge>,
    );

    expect(screen.getByText('Success')).toHaveClass(
      'bg-emerald-500/10',
      'text-xs',
      'px-2.5',
    );
  });

  it('renders dot indicator with the matching variant color', () => {
    const { container } = render(
      <Badge variant="error" dot>
        Error
      </Badge>,
    );

    const indicator = container.querySelector('.rounded-full.bg-red-400');
    expect(indicator).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});

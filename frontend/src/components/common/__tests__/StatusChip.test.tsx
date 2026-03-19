import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StatusChip from '../StatusChip';

describe('StatusChip', () => {
  it('renders the default label for a completed status', () => {
    render(<StatusChip status="completed" />);

    const label = screen.getByText('Completed');
    expect(label).toBeInTheDocument();
    expect(label.parentElement).toHaveClass('bg-emerald-500/12');
  });

  it('renders a pulsing indicator for active running status', () => {
    const { container } = render(<StatusChip status="running" />);

    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(container.querySelectorAll('.bg-cyan-400')).toHaveLength(2);
  });

  it('renders a custom label without icon markup when icon is disabled', () => {
    const { container } = render(
      <StatusChip status="error" label="Gagal Diproses" icon={false} size="lg" />,
    );

    const chip = screen.getByText('Gagal Diproses').parentElement;
    expect(chip).toHaveClass('text-sm', 'px-3.5');
    expect(container.querySelector('.bg-rose-400')).not.toBeInTheDocument();
  });
});

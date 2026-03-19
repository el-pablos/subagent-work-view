import { fireEvent, render, screen } from '@testing-library/react';
import { Search, Sparkles } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders title and optional description in a status region', () => {
    render(
      <EmptyState
        title="Belum ada data"
        description="Tambahkan item untuk memulai."
      />,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Belum ada data')).toBeInTheDocument();
    expect(screen.getByText('Tambahkan item untuk memulai.')).toBeInTheDocument();
  });

  it('calls the configured action handler when the action button is clicked', () => {
    const handleClick = vi.fn();

    render(
      <EmptyState
        title="Pencarian kosong"
        action={{ label: 'Muat ulang', onClick: handleClick }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Muat ulang' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders a custom icon for the default variant', () => {
    const { container } = render(
      <EmptyState icon={Sparkles} title="Kustom" variant="default" />,
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Kustom')).toBeInTheDocument();
  });
});

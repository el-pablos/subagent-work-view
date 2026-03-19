import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('renders the provided error message in an alert region', () => {
    render(<ErrorState error="Backend tidak merespons" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    expect(screen.getByText('Backend tidak merespons')).toBeInTheDocument();
  });

  it('disables retry button and counts down before auto retrying', () => {
    vi.useFakeTimers();
    const onRetry = vi.fn();

    render(
      <ErrorState
        error="Koneksi terputus"
        onRetry={onRetry}
        retryCountdown={2}
      />,
    );

    const button = screen.getByRole('button', { name: 'Retry dalam 2 detik' });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Retry dalam 2s');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('invokes retry immediately when countdown is not active', () => {
    const onRetry = vi.fn();
    render(<ErrorState error="Gagal memuat" onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

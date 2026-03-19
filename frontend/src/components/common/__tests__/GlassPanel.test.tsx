import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GlassPanel } from '../GlassPanel';

describe('GlassPanel', () => {
  it('renders children with default panel styles', () => {
    render(<GlassPanel>Panel content</GlassPanel>);

    const panel = screen.getByText('Panel content').parentElement;
    expect(panel).toHaveClass('rounded-xl', 'bg-slate-900/60', 'p-4');
  });

  it('applies solid variant, glow, and custom padding classes', () => {
    render(
      <GlassPanel variant="solid" glow padding="lg">
        Glowing panel
      </GlassPanel>,
    );

    const panel = screen.getByText('Glowing panel').parentElement;
    expect(panel).toHaveClass('bg-slate-900/80', 'ring-1', 'p-6');
  });

  it('forwards arbitrary motion div props', () => {
    render(
      <GlassPanel data-testid="glass-panel" padding="none">
        Props panel
      </GlassPanel>,
    );

    expect(screen.getByTestId('glass-panel')).toHaveTextContent('Props panel');
    expect(screen.getByTestId('glass-panel')).not.toHaveClass('p-3', 'p-4', 'p-6');
  });
});

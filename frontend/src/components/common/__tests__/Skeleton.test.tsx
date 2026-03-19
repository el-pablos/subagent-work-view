import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  AgentNodeSkeleton,
  MessageSkeleton,
  Skeleton,
  TaskCardSkeleton,
  TopologySkeleton,
} from '../Skeleton';

describe('Skeleton', () => {
  it('renders status semantics and inline dimensions', () => {
    render(<Skeleton width={120} height={24} />);

    const skeleton = screen.getByRole('status', { name: 'Loading content' });
    expect(skeleton).toHaveStyle({ width: '120px', height: '24px' });
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('does not render shimmer markup when animation is disabled', () => {
    const { container } = render(<Skeleton animate={false} variant="rounded" />);

    expect(container.querySelector('.bg-gradient-to-r')).not.toBeInTheDocument();
  });

  it('renders specialized skeleton helpers with accessible labels', () => {
    render(
      <div>
        <AgentNodeSkeleton />
        <TaskCardSkeleton />
        <MessageSkeleton />
        <TopologySkeleton />
      </div>,
    );

    expect(screen.getAllByRole('status', { name: 'Loading agent node' })).toHaveLength(6);
    expect(screen.getByRole('status', { name: 'Loading task card' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading message' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading topology' })).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkeletonLoader } from '../SkeletonLoader/SkeletonLoader';

describe('SkeletonLoader', () => {
  it('renders text variant with default 3 lines', () => {
    const { container } = render(<SkeletonLoader variant="text" />);
    // Each line is a Placeholder.as="p" wrapper containing a Placeholder child
    const wrappers = container.querySelectorAll('.placeholder-glow');
    expect(wrappers.length).toBe(3);
  });

  it('renders text variant with custom line count', () => {
    const { container } = render(<SkeletonLoader variant="text" lines={5} />);
    const wrappers = container.querySelectorAll('.placeholder-glow');
    expect(wrappers.length).toBe(5);
  });

  it('renders card variant with specified count', () => {
    const { container } = render(<SkeletonLoader variant="card" count={3} />);
    // Each card is a <span> wrapper with placeholder-glow animation
    const cards = container.querySelectorAll('[class*="placeholder"]');
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });

  it('renders table variant with rows', () => {
    const { container } = render(<SkeletonLoader variant="table" />);
    // Has a placeholder-glow wrapper
    const glow = container.querySelector('.placeholder-glow');
    expect(glow).not.toBeNull();
  });

  it('renders chart variant', () => {
    const { container } = render(<SkeletonLoader variant="chart" />);
    const placeholder = container.querySelector('[class*="placeholder"]');
    expect(placeholder).not.toBeNull();
  });

  it('returns null for unknown variant', () => {
    const { container } = render(<SkeletonLoader variant={'unknown' as 'text'} />);
    expect(container.firstChild).toBeNull();
  });
});

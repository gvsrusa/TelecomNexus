import { Placeholder } from 'react-bootstrap';

export interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'table' | 'chart';
  lines?: number;
  count?: number;
}

export function SkeletonLoader({
  variant = 'text',
  lines = 3,
  count = 1,
}: SkeletonLoaderProps) {
  if (variant === 'text') {
    return (
      <div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="mb-2">
            {Array.from({ length: lines }).map((_, j) => (
              <Placeholder key={j} as="p" animation="glow" className="mb-1">
                <Placeholder xs={j === lines - 1 && i === count - 1 ? 8 : 12} />
              </Placeholder>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="d-flex gap-2 flex-wrap">
        {Array.from({ length: count }).map((_, i) => (
          <Placeholder key={i} animation="glow" className="rounded" style={{ width: 200, height: 120 }} />
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div>
        <Placeholder animation="glow">
          <Placeholder xs={12} className="mb-2" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Placeholder key={i} xs={12} className="mb-1" />
          ))}
        </Placeholder>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <Placeholder animation="glow" style={{ height: 200 }} className="rounded">
        <Placeholder xs={12} style={{ height: '100%' }} />
      </Placeholder>
    );
  }

  return null;
}

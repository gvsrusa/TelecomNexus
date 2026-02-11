export interface ProgressRingProps {
  value: number;
  max: number;
  label: string;
  size?: number;
}

export function ProgressRing({
  value,
  max,
  label,
  size = 80,
}: ProgressRingProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="text-center">
      <svg width={size} height={size} className="d-block mx-auto">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--tn-border, #dee2e6)"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bs-primary)"
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="mt-1 small fw-bold">{label}</div>
      <div className="small text-muted">
        {value} / {max}
      </div>
    </div>
  );
}

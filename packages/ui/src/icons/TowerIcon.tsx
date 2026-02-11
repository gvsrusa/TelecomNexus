export interface TowerIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function TowerIcon({ size = 24, color = 'currentColor', className }: TowerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      role="img"
      aria-label="Cell tower"
    >
      <path d="M12 2L6 8h3v14h6V8h3L12 2z" />
    </svg>
  );
}

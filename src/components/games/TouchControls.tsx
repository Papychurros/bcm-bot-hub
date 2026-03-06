import React, { useCallback } from 'react';

interface DpadProps {
  color: string;
  onDirection: (dir: string, type: 'down' | 'up') => void;
  centerButton?: React.ReactNode;
}

export function Dpad({ color, onDirection, centerButton }: DpadProps) {
  const DBtn = ({ label, dir }: { label: string; dir: string }) => (
    <button
      className="w-14 h-14 rounded-xl bg-secondary border border-border text-foreground text-xl flex items-center justify-center cursor-pointer select-none transition-all active:scale-[0.88] active:bg-secondary/80"
      style={{ '--gc': color } as React.CSSProperties}
      onPointerDown={() => onDirection(dir, 'down')}
      onPointerUp={() => onDirection(dir, 'up')}
      onPointerLeave={() => onDirection(dir, 'up')}
    >
      {label}
    </button>
  );

  return (
    <div className="grid grid-cols-3 gap-1.5" style={{ width: 'fit-content' }}>
      <div />
      <DBtn label="▲" dir="up" />
      <div />
      <DBtn label="◀" dir="left" />
      {centerButton || <div />}
      <DBtn label="▶" dir="right" />
      <div />
      <DBtn label="▼" dir="down" />
      <div />
    </div>
  );
}

interface HpadProps {
  color: string;
  onDirection: (dir: string, active: boolean) => void;
}

export function Hpad({ color, onDirection }: HpadProps) {
  const HBtn = ({ label, dir }: { label: string; dir: string }) => (
    <button
      className="w-[70px] h-14 rounded-xl bg-secondary border border-border text-foreground text-xl flex items-center justify-center cursor-pointer select-none transition-all active:scale-[0.88]"
      onPointerDown={() => onDirection(dir, true)}
      onPointerUp={() => onDirection(dir, false)}
      onPointerLeave={() => onDirection(dir, false)}
    >
      {label}
    </button>
  );

  return (
    <div className="flex gap-3">
      <HBtn label="◀" dir="left" />
      <HBtn label="▶" dir="right" />
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  primary?: boolean;
  color: string;
  onClick: () => void;
}

export function ActionButton({ label, primary, color, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full border font-mono text-xs tracking-wider cursor-pointer select-none transition-all active:scale-[0.92] ${
        primary
          ? 'font-semibold'
          : 'bg-secondary border-border text-foreground'
      }`}
      style={primary ? {
        background: `color-mix(in srgb, ${color} 14%, hsl(var(--secondary)))`,
        borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
        color: color,
      } : undefined}
    >
      {label}
    </button>
  );
}

import React, { useEffect, useCallback, useRef } from 'react';
import { X, Maximize } from 'lucide-react';

interface GameModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}

async function enterFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
  } catch {}
}

async function exitFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  } catch {}
}

export default function GameModal({ open, onClose, title, icon, color, children }: GameModalProps) {
  const didEnterRef = useRef(false);

  const handleClose = useCallback(() => {
    exitFullscreen();
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  }, [handleClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      if (!didEnterRef.current) {
        didEnterRef.current = true;
        enterFullscreen();
      }
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (!open) didEnterRef.current = false;
    };
  }, [open, handleKeyDown]);

  // Exit fullscreen if modal closes externally
  useEffect(() => {
    if (!open) {
      exitFullscreen();
      didEnterRef.current = false;
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-[14px] animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-[860px] max-h-[94vh] overflow-y-auto flex flex-col shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border flex-shrink-0">
          <div className="text-xl font-bold tracking-tight" style={{ color }}>
            {icon} {title}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => enterFullscreen()}
              className="w-9 h-9 rounded-full border border-border bg-transparent text-muted-foreground flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors"
              title="Plein écran"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full border border-border bg-transparent text-muted-foreground flex items-center justify-center hover:bg-destructive/15 hover:text-destructive hover:border-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Body */}
        <div className="p-7 flex flex-col gap-5">
          {children}
        </div>
      </div>
    </div>
  );
}

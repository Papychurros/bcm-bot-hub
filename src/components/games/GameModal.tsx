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

function setViewportMeta(content: string) {
  let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
  if (meta) {
    meta.setAttribute('content', content);
  }
}

export default function GameModal({ open, onClose, title, icon, color, children }: GameModalProps) {
  const didEnterRef = useRef(false);
  const originalViewportRef = useRef<string>('');

  const handleClose = useCallback(() => {
    exitFullscreen();
    if (originalViewportRef.current) {
      setViewportMeta(originalViewportRef.current);
    }
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
        // Save & swap viewport meta
        const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
        originalViewportRef.current = meta?.getAttribute('content') || '';
        setViewportMeta('width=device-width, initial-scale=1, maximum-scale=1');
        enterFullscreen();
      }
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (!open) didEnterRef.current = false;
    };
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (!open) {
      exitFullscreen();
      if (originalViewportRef.current) {
        setViewportMeta(originalViewportRef.current);
      }
      didEnterRef.current = false;
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen z-[9999] flex flex-col bg-background animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0 bg-card">
        <div className="text-lg font-bold tracking-tight" style={{ color }}>
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
      <div className="flex-1 overflow-auto p-4 flex flex-col">
        {children}
      </div>
    </div>
  );
}

import React, { useState, lazy, Suspense } from 'react';
import GameModal from '@/components/games/GameModal';

const SnakeGame = lazy(() => import('@/components/games/SnakeGame'));
const BreakoutGame = lazy(() => import('@/components/games/BreakoutGame'));
const TetrisGame = lazy(() => import('@/components/games/TetrisGame'));
const MemoryGame = lazy(() => import('@/components/games/MemoryGame'));

interface GameDef {
  id: string;
  num: string;
  icon: string;
  title: string;
  desc: string;
  tag: string;
  color: string;
}

const GAMES: GameDef[] = [
{ id: 'tetris', num: '01 / 04', icon: '🟪', title: 'B.O.B Tetris', desc: 'Les pièces classiques revisitées aux couleurs BCM. Empile, efface, domine.', tag: 'Arcade', color: '#a855f7' },
{ id: 'snake', num: '02 / 04', icon: '🐍', title: 'C.A.S.H Snake', desc: 'Le serpent néon sur fond noir absolu. Collecte les €, grandis, survie.', tag: 'Arcade', color: '#39ff14' },
{ id: 'breakout', num: '03 / 04', icon: '🎯', title: 'M.A.G Casse-Briques', desc: 'Détruis les briques aux couleurs des libellés MAG. Réflexes requis.', tag: 'Arcade', color: '#ff6a00' },
{ id: 'memory', num: '04 / 04', icon: '🃏', title: 'BCM Mémory', desc: 'Retrouve les paires de logos BOB, CASH et MAG. Bats ton meilleur temps.', tag: 'Réflexion', color: '#00e5ff' }];


function GameCard({ game, onClick }: {game: GameDef;onClick: () => void;}) {
  return (
    <div
      onClick={onClick}
      className="relative bg-card border border-border rounded-2xl p-9 pb-14 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] group h-full flex flex-col"
      style={{ '--gc': game.color } as React.CSSProperties}>
      
      {/* Glow */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-0 group-hover:opacity-[0.12] transition-opacity duration-400 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${game.color} 0%, transparent 70%)` }} />
      
      {/* Hover border */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-[var(--gc)] transition-colors pointer-events-none"
      style={{ borderColor: undefined }} />
      

      
      <div
        className="w-14 h-14 rounded-[14px] border border-border flex items-center justify-center text-[26px] mb-6 transition-shadow duration-300 group-hover:shadow-lg"
        style={{ background: `color-mix(in srgb, ${game.color} 10%, transparent)` }}>
        
        {game.icon}
      </div>
      <div className="text-xl font-bold tracking-tight mb-2.5">{game.title}</div>
      <div className="font-mono text-xs leading-relaxed text-muted-foreground">{game.desc}</div>
      <span
        className="inline-block mt-5 font-mono text-[10px] tracking-[0.15em] uppercase px-3 py-1 rounded-full border"
        style={{ color: game.color, borderColor: `color-mix(in srgb, ${game.color} 40%, transparent)` }}>
        
        {game.tag}
      </span>
      {/* Arrow */}
      <div
        className="absolute bottom-6 right-6 w-8 h-8 rounded-full border border-border flex items-center justify-center text-sm transition-all duration-300 group-hover:rotate-45 group-hover:text-black"
        style={{ '--gc': game.color } as React.CSSProperties}>
        
        <span className="transition-colors group-hover:text-black">↗</span>
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"
          style={{ background: game.color }} />
        
      </div>
    </div>);

}

export default function MiniJeuxPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const activeGameDef = GAMES.find((g) => g.id === activeGame);

  return (
    <div className="relative z-[1] min-h-screen flex flex-col items-center px-6 py-16 pb-20 animate-fade-in">
      {/* Header */}
      <header className="text-center mb-[72px]">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase text-muted-foreground border border-border rounded-full px-4 py-1.5 mb-7">
          ESPACE JEUX
        </div>
        <h1 className="text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-tight">
          Mini<span className="block bg-gradient-to-br from-[#a855f7] via-[#ff6a00] to-[#39ff14] bg-clip-text text-transparent">Jeux</span>
        </h1>
        
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-[1100px]">
        {GAMES.map((game, i) =>
        <div key={game.id} style={{ animationDelay: `${(i + 1) * 0.1}s` }} className="animate-fade-in opacity-0 [animation-fill-mode:forwards]">
            <GameCard game={game} onClick={() => setActiveGame(game.id)} />
          </div>
        )}
      </div>

      <footer className="mt-20 font-mono text-[11px] text-muted-foreground tracking-wider">© BCM Hub — Mini Jeux

      </footer>

      {/* Game Modal */}
      {activeGameDef &&
      <GameModal
        open={!!activeGame}
        onClose={() => setActiveGame(null)}
        title={activeGameDef.title}
        icon={activeGameDef.icon}
        color={activeGameDef.color}>
        
          <Suspense fallback={<div className="flex items-center justify-center min-h-[320px] font-mono text-muted-foreground">Chargement...</div>}>
            {activeGame === 'tetris' && <TetrisGame />}
            {activeGame === 'snake' && <SnakeGame />}
            {activeGame === 'breakout' && <BreakoutGame />}
            {activeGame === 'memory' && <MemoryGame />}
          </Suspense>
        </GameModal>
      }
    </div>);

}
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Hpad, ActionButton } from './TouchControls';

const W = 480, H = 400;
const PAD_H = 10, PAD_Y = H - 30;
const BALL_R = 7;
const BRICK_GAP = 4;
const COLOR = '#f97316';
const BG = '#0f0f1a';

const LABELS = ['Travail', 'Pub', 'Moi', 'Perso', 'Budget', 'Agenda', 'Mail', 'Réunion', 'Projet', 'Deadline'];
const LABEL_COLORS = ['#E53935', '#9E9E9E', '#1E88E5', '#43A047', '#F9A825', '#AB47BC', '#26C6DA', '#546E7A', '#FF7043', '#EF5350'];

interface LevelConfig {
  cols: number; rows: number; ballSpeed: number; paddleWidth: number;
  normalPct: number; resistPct: number; bonusPct: number; explosivePct: number; indestructPct: number;
  resistHits: number;
}

const LEVELS: LevelConfig[] = [
  { cols: 6, rows: 5, ballSpeed: 3.5, paddleWidth: 90, normalPct: 80, resistPct: 15, bonusPct: 5, explosivePct: 0, indestructPct: 0, resistHits: 2 },
  { cols: 7, rows: 5, ballSpeed: 3.8, paddleWidth: 88, normalPct: 75, resistPct: 15, bonusPct: 7, explosivePct: 3, indestructPct: 0, resistHits: 2 },
  { cols: 7, rows: 6, ballSpeed: 4.0, paddleWidth: 85, normalPct: 70, resistPct: 15, bonusPct: 8, explosivePct: 5, indestructPct: 2, resistHits: 2 },
  { cols: 8, rows: 6, ballSpeed: 4.3, paddleWidth: 82, normalPct: 65, resistPct: 18, bonusPct: 8, explosivePct: 5, indestructPct: 4, resistHits: 3 },
  { cols: 8, rows: 7, ballSpeed: 4.6, paddleWidth: 78, normalPct: 60, resistPct: 18, bonusPct: 10, explosivePct: 6, indestructPct: 6, resistHits: 3 },
  { cols: 9, rows: 7, ballSpeed: 5.0, paddleWidth: 75, normalPct: 55, resistPct: 20, bonusPct: 10, explosivePct: 8, indestructPct: 7, resistHits: 3 },
  { cols: 9, rows: 8, ballSpeed: 5.5, paddleWidth: 70, normalPct: 52, resistPct: 20, bonusPct: 10, explosivePct: 10, indestructPct: 8, resistHits: 3 },
  { cols: 10, rows: 8, ballSpeed: 6.0, paddleWidth: 65, normalPct: 50, resistPct: 22, bonusPct: 10, explosivePct: 10, indestructPct: 8, resistHits: 4 },
  { cols: 11, rows: 9, ballSpeed: 7.0, paddleWidth: 60, normalPct: 47, resistPct: 23, bonusPct: 10, explosivePct: 10, indestructPct: 10, resistHits: 4 },
  { cols: 12, rows: 10, ballSpeed: 8.0, paddleWidth: 55, normalPct: 45, resistPct: 25, bonusPct: 10, explosivePct: 10, indestructPct: 10, resistHits: 4 },
];

type BrickType = 'normal' | 'resist' | 'bonus' | 'explosive' | 'indestructible';
interface Brick { x: number; y: number; alive: boolean; color: string; label: string; type: BrickType; hits: number; col: number; row: number; }
interface Ball { x: number; y: number; vx: number; vy: number; fireball: boolean; }
interface FallingItem { x: number; y: number; kind: 'multiball' | 'fireball' | 'life' | 'speedup' | 'shrink'; color: string; }
interface ActiveBuff { kind: string; remaining: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; }

type GameState = 'idle' | 'playing' | 'paused' | 'dead' | 'won' | 'levelclear';

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentLevel, setCurrentLevel] = useState(0);
  const scoreRef = useRef(0);
  const hiScoreRef = useRef(0);

  const stateRef = useRef<{
    pad: { x: number; y: number; w: number };
    balls: Ball[];
    bricks: Brick[];
    items: FallingItem[];
    particles: Particle[];
    buffs: ActiveBuff[];
    score: number; hiScore: number; lives: number; level: number;
    running: boolean; paused: boolean; dead: boolean; won: boolean;
    loop: number | null; keys: Record<string, boolean>;
    lastTime: number; accumulator: number;
    baseBallSpeed: number; basePadW: number;
    levelCols: number; levelRows: number;
  }>({
    pad: { x: 0, y: PAD_Y, w: 90 }, balls: [], bricks: [], items: [], particles: [], buffs: [],
    score: 0, hiScore: 0, lives: 3, level: 0,
    running: false, paused: false, dead: false, won: false,
    loop: null, keys: {}, lastTime: 0, accumulator: 0,
    baseBallSpeed: 3.5, basePadW: 90, levelCols: 6, levelRows: 5,
  });

  const getBrickDims = (cols: number) => {
    const bw = Math.floor((W - BRICK_GAP * (cols + 1)) / cols);
    const offX = (W - (cols * bw + (cols - 1) * BRICK_GAP)) / 2;
    return { bw, offX };
  };

  const pickBrickType = (cfg: LevelConfig): BrickType => {
    const r = Math.random() * 100;
    let acc = cfg.normalPct; if (r < acc) return 'normal';
    acc += cfg.resistPct; if (r < acc) return 'resist';
    acc += cfg.bonusPct; if (r < acc) return 'bonus';
    acc += cfg.explosivePct; if (r < acc) return 'explosive';
    return 'indestructible';
  };

  const makeBricks = useCallback((lvl: number) => {
    const cfg = LEVELS[lvl];
    const { bw, offX } = getBrickDims(cfg.cols);
    const bh = 18;
    const bricks: Brick[] = [];
    for (let r = 0; r < cfg.rows; r++) {
      for (let c = 0; c < cfg.cols; c++) {
        const type = pickBrickType(cfg);
        const li = (r * cfg.cols + c) % LABELS.length;
        let color = LABEL_COLORS[li];
        let label = LABELS[li];
        let hits = 1;
        if (type === 'resist') { color = '#c2410c'; hits = cfg.resistHits; label = `×${hits}`; }
        else if (type === 'bonus') { color = '#fbbf24'; label = '★'; }
        else if (type === 'explosive') { color = '#ef4444'; label = '💥'; }
        else if (type === 'indestructible') { color = '#374151'; label = '▬'; hits = 9999; }
        bricks.push({ x: offX + c * (bw + BRICK_GAP), y: 28 + r * (bh + BRICK_GAP), alive: true, color, label, type, hits, col: c, row: r });
      }
    }
    return bricks;
  }, []);

  const brickRR = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
  };

  const spawnItem = (x: number, y: number) => {
    const s = stateRef.current;
    const isBuff = Math.random() < 0.6;
    let kind: FallingItem['kind'];
    let color: string;
    if (isBuff) {
      const roll = Math.random();
      if (roll < 0.4) { kind = 'multiball'; color = '#22c55e'; }
      else if (roll < 0.75) { kind = 'fireball'; color = '#ef4444'; }
      else { kind = 'life'; color = '#ec4899'; }
    } else {
      if (Math.random() < 0.5) { kind = 'speedup'; color = '#a855f7'; }
      else { kind = 'shrink'; color = '#3b82f6'; }
    }
    s.items.push({ x, y, kind, color });
  };

  const explodeBrick = (brick: Brick) => {
    const s = stateRef.current;
    const cfg = LEVELS[s.level];
    const { bw } = getBrickDims(cfg.cols);
    const bh = 18;
    // particles
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 3;
      s.particles.push({ x: brick.x + bw / 2, y: brick.y + bh / 2, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, life: 30, color: '#ef4444' });
    }
    // destroy neighbors
    for (const b of s.bricks) {
      if (!b.alive || b === brick || b.type === 'indestructible') continue;
      if (Math.abs(b.col - brick.col) <= 1 && Math.abs(b.row - brick.row) <= 1) {
        b.alive = false; s.score += 10;
      }
    }
  };

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;
    const cfg = LEVELS[s.level];
    const { bw } = getBrickDims(cfg.cols);
    const bh = 18;

    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    // grid
    ctx.strokeStyle = 'rgba(255,255,255,.03)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // HUD
    ctx.font = "bold 12px 'DM Mono',monospace";
    ctx.fillStyle = COLOR; ctx.textAlign = 'left';
    ctx.fillText(`SCORE ${String(s.score).padStart(5, '0')}`, 8, 16);
    ctx.fillStyle = '#5a5a7a'; ctx.textAlign = 'center';
    ctx.fillText('❤'.repeat(s.lives), W / 2, 16);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#5a5a7a';
    ctx.fillText(`LVL ${s.level + 1}`, W - 8, 16);

    // Bricks
    const time = performance.now();
    for (const b of s.bricks) {
      if (!b.alive) continue;
      ctx.save();
      if (b.type === 'bonus') {
        ctx.shadowBlur = 8 + 4 * Math.sin(time / 200);
        ctx.shadowColor = '#fbbf24';
      } else {
        ctx.shadowBlur = 6; ctx.shadowColor = b.color;
      }
      ctx.fillStyle = b.color;
      brickRR(ctx, b.x + 1, b.y + 1, bw - 2, bh - 2, 3); ctx.fill();
      if (b.type === 'indestructible') {
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
        for (let i = 0; i < bw; i += 6) { ctx.beginPath(); ctx.moveTo(b.x + i, b.y); ctx.lineTo(b.x + i + bh, b.y + bh); ctx.stroke(); }
      }
      ctx.globalAlpha = .15; ctx.fillStyle = '#fff'; ctx.fillRect(b.x + 3, b.y + 2, bw - 6, 3);
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      ctx.fillStyle = b.type === 'indestructible' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.55)';
      ctx.font = `bold ${bw < 35 ? 6 : 8}px 'DM Mono',monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(b.label, b.x + bw / 2, b.y + bh / 2 + 1);
      ctx.restore();
    }

    // Items
    for (const item of s.items) {
      ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = item.color; ctx.fillStyle = item.color;
      ctx.beginPath(); ctx.arc(item.x, item.y, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = "bold 8px sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const icons: Record<string, string> = { multiball: '⊕', fireball: '🔥', life: '♥', speedup: '⚡', shrink: '↔' };
      ctx.fillText(icons[item.kind] || '?', item.x, item.y);
      ctx.restore();
    }

    // Particles
    for (const p of s.particles) {
      ctx.save(); ctx.globalAlpha = p.life / 30; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2 + p.life / 10, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }

    // Pad
    ctx.save(); ctx.shadowBlur = 18; ctx.shadowColor = COLOR;
    const grad = ctx.createLinearGradient(s.pad.x, 0, s.pad.x + s.pad.w, 0);
    grad.addColorStop(0, '#fb923c'); grad.addColorStop(.5, COLOR); grad.addColorStop(1, '#fb923c');
    ctx.fillStyle = grad; brickRR(ctx, s.pad.x, s.pad.y, s.pad.w, PAD_H, 5); ctx.fill(); ctx.restore();

    // Balls
    for (const ball of s.balls) {
      ctx.save();
      ctx.shadowBlur = 20; ctx.shadowColor = ball.fireball ? '#ef4444' : COLOR;
      ctx.fillStyle = ball.fireball ? '#ef4444' : '#ffffff';
      ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = .3; ctx.shadowBlur = 8; ctx.fillStyle = ball.fireball ? '#ff6b6b' : COLOR;
      ctx.beginPath(); ctx.arc(ball.x - ball.vx * 1.5, ball.y - ball.vy * 1.5, BALL_R * .7, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Active buffs badges
    if (s.buffs.length > 0) {
      let bx = 8;
      for (const buff of s.buffs) {
        const secs = Math.ceil(buff.remaining / 60);
        const colors: Record<string, string> = { fireball: '#ef4444', speedup: '#a855f7', shrink: '#3b82f6' };
        ctx.save(); ctx.fillStyle = colors[buff.kind] || '#888'; ctx.globalAlpha = 0.8;
        brickRR(ctx, bx, H - 18, 50, 14, 3); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.font = "bold 8px sans-serif"; ctx.textAlign = 'center';
        ctx.fillText(`${buff.kind.slice(0, 4)} ${secs}s`, bx + 25, H - 9);
        ctx.restore();
        bx += 55;
      }
    }

    // Pause button
    if (s.running && !s.paused) {
      ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.arc(W - 20, 14, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('⏸', W - 20, 14);
      ctx.restore();
    }
  }, []);

  const update = useCallback(() => {
    const s = stateRef.current;
    const cfg = LEVELS[s.level];
    const { bw } = getBrickDims(cfg.cols);
    const bh = 18;
    const padSpeed = 7;

    // Pad movement
    const effPadW = s.buffs.some(b => b.kind === 'shrink') ? s.pad.w * 0.7 : s.pad.w;
    if (s.keys['ArrowLeft'] || s.keys['left']) s.pad.x = Math.max(0, s.pad.x - padSpeed);
    if (s.keys['ArrowRight'] || s.keys['right']) s.pad.x = Math.min(W - effPadW, s.pad.x + padSpeed);

    // Speed multiplier from buff
    const speedMult = s.buffs.some(b => b.kind === 'speedup') ? 1.4 : 1.0;

    // Update balls
    const ballsToRemove: number[] = [];
    for (let bi = 0; bi < s.balls.length; bi++) {
      const ball = s.balls[bi];
      ball.x += ball.vx * speedMult;
      ball.y += ball.vy * speedMult;

      if (ball.x - BALL_R <= 0) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx); }
      if (ball.x + BALL_R >= W) { ball.x = W - BALL_R; ball.vx = -Math.abs(ball.vx); }
      if (ball.y - BALL_R <= 0) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy); }

      if (ball.y + BALL_R >= H) {
        if (bi === 0) {
          // Main ball lost
          s.lives--;
          if (s.lives <= 0) {
            s.running = false; s.dead = true;
            if (s.score > s.hiScore) s.hiScore = s.score;
            scoreRef.current = s.score; hiScoreRef.current = s.hiScore;
            setTimeout(() => setGameState('dead'), 400);
            return;
          }
          // Reset main ball
          ball.x = s.pad.x + effPadW / 2; ball.y = PAD_Y - BALL_R - 2;
          ball.vx = (Math.random() > 0.5 ? 1 : -1) * cfg.ballSpeed * 0.5;
          ball.vy = -cfg.ballSpeed * 0.85;
          ball.fireball = false;
          // Remove all extra balls
          s.balls.length = 1;
          break;
        } else {
          ballsToRemove.push(bi);
          continue;
        }
      }

      // Pad collision
      const pw = effPadW;
      if (ball.vy > 0 && ball.y + BALL_R >= s.pad.y && ball.y - BALL_R < s.pad.y + PAD_H && ball.x + BALL_R > s.pad.x && ball.x - BALL_R < s.pad.x + pw) {
        const rel = (ball.x - (s.pad.x + pw / 2)) / (pw / 2);
        const angle = rel * Math.PI / 3;
        ball.vx = cfg.ballSpeed * Math.sin(angle);
        ball.vy = -cfg.ballSpeed * Math.cos(angle);
        ball.y = s.pad.y - BALL_R - 1;
      }

      // Brick collision
      for (const b of s.bricks) {
        if (!b.alive) continue;
        if (ball.x + BALL_R > b.x && ball.x - BALL_R < b.x + bw && ball.y + BALL_R > b.y && ball.y - BALL_R < b.y + bh) {
          if (b.type === 'indestructible') {
            // Just bounce
            const overlapL = ball.x + BALL_R - b.x; const overlapR = b.x + bw - (ball.x - BALL_R);
            const overlapT = ball.y + BALL_R - b.y; const overlapB = b.y + bh - (ball.y - BALL_R);
            if (Math.min(overlapL, overlapR) < Math.min(overlapT, overlapB)) ball.vx *= -1; else ball.vy *= -1;
            break;
          }

          if (ball.fireball) {
            // Fireball pierces through
            b.alive = false; s.score += 10;
            if (b.type === 'explosive') explodeBrick(b);
            if (b.type === 'bonus') spawnItem(b.x + bw / 2, b.y + bh / 2);
            continue; // don't bounce
          }

          b.hits--;
          if (b.hits <= 0) {
            b.alive = false; s.score += (b.type === 'resist' ? 25 : 10);
            if (b.type === 'explosive') explodeBrick(b);
            if (b.type === 'bonus') spawnItem(b.x + bw / 2, b.y + bh / 2);
          } else {
            b.label = `×${b.hits}`;
          }
          if (s.score > s.hiScore) s.hiScore = s.score;

          if (!ball.fireball) {
            const overlapL = ball.x + BALL_R - b.x; const overlapR = b.x + bw - (ball.x - BALL_R);
            const overlapT = ball.y + BALL_R - b.y; const overlapB = b.y + bh - (ball.y - BALL_R);
            if (Math.min(overlapL, overlapR) < Math.min(overlapT, overlapB)) ball.vx *= -1; else ball.vy *= -1;
          }
          // Normalize speed
          const bspd = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
          ball.vx = ball.vx / bspd * cfg.ballSpeed;
          ball.vy = ball.vy / bspd * cfg.ballSpeed;
          break;
        }
      }
    }
    // Remove dead extra balls
    for (let i = ballsToRemove.length - 1; i >= 0; i--) s.balls.splice(ballsToRemove[i], 1);

    // Items
    for (let i = s.items.length - 1; i >= 0; i--) {
      const item = s.items[i];
      item.y += 2;
      if (item.y > H) { s.items.splice(i, 1); continue; }
      // Catch with pad
      const pw = effPadW;
      if (item.y + 8 >= s.pad.y && item.y - 8 < s.pad.y + PAD_H && item.x > s.pad.x && item.x < s.pad.x + pw) {
        s.items.splice(i, 1);
        if (item.kind === 'multiball') {
          // Add 2 extra balls
          const main = s.balls[0];
          if (main) {
            s.balls.push({ x: main.x, y: main.y, vx: cfg.ballSpeed * 0.7, vy: -cfg.ballSpeed * 0.7, fireball: main.fireball });
            s.balls.push({ x: main.x, y: main.y, vx: -cfg.ballSpeed * 0.7, vy: -cfg.ballSpeed * 0.7, fireball: main.fireball });
          }
        } else if (item.kind === 'fireball') {
          for (const b of s.balls) b.fireball = true;
          s.buffs = s.buffs.filter(b => b.kind !== 'fireball');
          s.buffs.push({ kind: 'fireball', remaining: 60 * 15 });
        } else if (item.kind === 'life') {
          s.lives = Math.min(s.lives + 1, 5);
        } else if (item.kind === 'speedup') {
          s.buffs = s.buffs.filter(b => b.kind !== 'speedup');
          s.buffs.push({ kind: 'speedup', remaining: 60 * 8 });
        } else if (item.kind === 'shrink') {
          s.buffs = s.buffs.filter(b => b.kind !== 'shrink');
          s.buffs.push({ kind: 'shrink', remaining: 60 * 10 });
        }
      }
    }

    // Particles
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.x += p.vx; p.y += p.vy; p.life--;
      if (p.life <= 0) s.particles.splice(i, 1);
    }

    // Buffs countdown
    for (let i = s.buffs.length - 1; i >= 0; i--) {
      s.buffs[i].remaining--;
      if (s.buffs[i].remaining <= 0) {
        if (s.buffs[i].kind === 'fireball') { for (const b of s.balls) b.fireball = false; }
        s.buffs.splice(i, 1);
      }
    }

    // Check win (all destructible bricks gone)
    const alive = s.bricks.filter(b => b.alive && b.type !== 'indestructible').length;
    if (alive === 0) {
      if (s.score > s.hiScore) s.hiScore = s.score;
      scoreRef.current = s.score; hiScoreRef.current = s.hiScore;
      if (s.level >= LEVELS.length - 1) {
        s.running = false; s.won = true;
        setTimeout(() => setGameState('won'), 300);
      } else {
        s.running = false;
        setTimeout(() => setGameState('levelclear'), 300);
      }
    }
  }, []);

  const tickRef = useRef<(ts: number) => void>();
  tickRef.current = (ts: number) => {
    const s = stateRef.current;
    if (!s.running || s.paused) return;
    if (s.lastTime) {
      s.accumulator += Math.min(ts - s.lastTime, 50);
      const STEP = 1000 / 60;
      while (s.accumulator >= STEP) { update(); s.accumulator -= STEP; }
    }
    s.lastTime = ts;
    draw();
    s.loop = requestAnimationFrame(tickRef.current!);
  };

  const startLevel = useCallback((lvl: number, keepScore = false) => {
    const s = stateRef.current;
    if (s.loop) cancelAnimationFrame(s.loop);
    const cfg = LEVELS[lvl];
    s.level = lvl;
    s.pad = { x: W / 2 - cfg.paddleWidth / 2, y: PAD_Y, w: cfg.paddleWidth };
    s.basePadW = cfg.paddleWidth;
    s.baseBallSpeed = cfg.ballSpeed;
    s.levelCols = cfg.cols; s.levelRows = cfg.rows;
    s.balls = [{ x: W / 2, y: PAD_Y - BALL_R - 2, vx: cfg.ballSpeed * 0.5, vy: -cfg.ballSpeed * 0.85, fireball: false }];
    if (!keepScore) { s.score = 0; s.lives = 3; }
    s.bricks = makeBricks(lvl);
    s.items = []; s.particles = []; s.buffs = [];
    s.running = true; s.paused = false; s.dead = false; s.won = false;
    s.lastTime = 0; s.accumulator = 0;
    setCurrentLevel(lvl);
    setGameState('playing');
    s.loop = requestAnimationFrame(tickRef.current!);
  }, [makeBricks, update, draw]);

  const nextLevel = useCallback(() => {
    const s = stateRef.current;
    startLevel(s.level + 1, true);
  }, [startLevel]);

  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    if (s.paused) {
      s.paused = false; s.lastTime = 0;
      setGameState('playing');
      s.loop = requestAnimationFrame(tickRef.current!);
    } else {
      s.paused = true;
      if (s.loop) cancelAnimationFrame(s.loop);
      setGameState('paused');
    }
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) { ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); }

    const onKey = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key] = true;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
      if (e.key === 'Escape' || e.key === 'p') togglePause();
    };
    const onKeyUp = (e: KeyboardEvent) => { stateRef.current.keys[e.key] = false; };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);

    // Prevent scroll on touch
    const container = containerRef.current;
    const preventTouch = (e: TouchEvent) => { e.preventDefault(); };
    container?.addEventListener('touchmove', preventTouch, { passive: false });

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      container?.removeEventListener('touchmove', preventTouch);
      const s = stateRef.current;
      if (s.loop) cancelAnimationFrame(s.loop);
      s.running = false; s.keys = {};
    };
  }, [togglePause]);

  // Handle canvas click for pause button
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    // Pause button area
    if (x > W - 35 && y < 28 && stateRef.current.running) {
      togglePause();
    }
  }, [togglePause]);

  const handleDirection = useCallback((dir: string, active: boolean) => {
    stateRef.current.keys[dir] = active;
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 w-full select-none" style={{ touchAction: 'none' }}>
      <div className="relative w-full max-w-[480px] bg-black rounded-lg overflow-hidden" style={{ aspectRatio: `${W}/${H}` }}>
        <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full rounded-lg" onClick={handleCanvasClick} />

        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">🤖</div>
            <div className="text-lg font-bold" style={{ color: COLOR }}>M.A.G CASSE-LABELS</div>
            <div className="text-[11px] text-muted-foreground">10 niveaux · 5 types de briques · Power-ups</div>
            <div className="text-[11px] text-muted-foreground">← → ou boutons pour déplacer la raquette</div>
          </div>
        )}

        {gameState === 'dead' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[15px] font-bold text-destructive">GAME OVER</div>
            <div className="text-3xl font-extrabold" style={{ color: COLOR }}>{scoreRef.current}</div>
            <div className="text-[11px] text-muted-foreground">Niveau {currentLevel + 1} · MEILLEUR : {hiScoreRef.current}</div>
          </div>
        )}

        {gameState === 'won' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">🏆</div>
            <div className="text-base font-bold text-[#ffd700]">10 NIVEAUX COMPLÉTÉS !</div>
            <div className="text-3xl font-extrabold" style={{ color: COLOR }}>{scoreRef.current}</div>
          </div>
        )}

        {gameState === 'levelclear' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">✨</div>
            <div className="text-base font-bold" style={{ color: COLOR }}>NIVEAU {currentLevel + 1} TERMINÉ !</div>
            <div className="text-2xl font-extrabold" style={{ color: COLOR }}>{scoreRef.current}</div>
            <button
              onClick={nextLevel}
              className="mt-2 px-6 py-2 rounded-full font-mono text-sm font-bold text-black"
              style={{ background: COLOR }}>
              NIVEAU SUIVANT →
            </button>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 rounded-lg font-mono text-foreground gap-4 z-10">
            <div className="text-lg font-bold" style={{ color: COLOR }}>⏸ PAUSE</div>
            <div className="text-[11px] text-muted-foreground mb-2">Sélectionne un niveau</div>
            <div className="grid grid-cols-5 gap-2">
              {LEVELS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => startLevel(i)}
                  className="w-10 h-10 rounded-lg font-mono text-xs font-bold border transition-all"
                  style={{
                    borderColor: i === currentLevel ? COLOR : 'rgba(255,255,255,0.15)',
                    background: i === currentLevel ? COLOR : 'rgba(255,255,255,0.05)',
                    color: i === currentLevel ? '#000' : 'rgba(255,255,255,0.6)',
                  }}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={togglePause} className="px-4 py-2 rounded-full font-mono text-xs border" style={{ borderColor: COLOR, color: COLOR }}>
                ▶ Reprendre
              </button>
              <button onClick={() => startLevel(currentLevel)} className="px-4 py-2 rounded-full font-mono text-xs border border-white/20 text-white/60">
                ⟳ Recommencer
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        <Hpad color={COLOR} onDirection={handleDirection} />
        <div className="flex gap-2 flex-wrap justify-center">
          <ActionButton label="▶ Jouer" primary color={COLOR} onClick={() => startLevel(0)} />
          <ActionButton label="⏸ Pause" color={COLOR} onClick={togglePause} />
          <ActionButton label="⟳ Restart" color={COLOR} onClick={() => startLevel(currentLevel)} />
        </div>
      </div>
    </div>
  );
}

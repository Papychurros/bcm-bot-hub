import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ActionButton } from './TouchControls';

const W = 360, H = 560;
const PLAT_W = 70, PLAT_H = 14;
const GRAVITY = 0.18, JUMP = -8;
const COLOR = '#a855f7';

type GameState = 'idle' | 'playing' | 'dead' | 'paused';
type PlatType = 'normal' | 'moving' | 'breakable' | 'vanishing';
type PowerUpType = 'spring' | 'jetpack' | 'shield';
type EnemyType = 'ground' | 'flying' | 'ufo' | 'blackhole';

interface Platform {
  x: number; y: number; w: number; h: number;
  type: PlatType; dir: number; speed: number;
  broken?: boolean;
  vanishTimer?: number; vanishing?: boolean;
  powerUp?: PowerUpType;
  breakTimer?: number;
}

interface Projectile { x: number; y: number; }

interface Enemy {
  x: number; y: number; w: number; h: number;
  type: EnemyType; dir: number; speed: number;
  hp: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; color: string; size: number;
}

function getPlatformWeights(score: number) {
  if (score < 1000) return { normal: 100, moving: 0, breakable: 0, vanishing: 0 };
  if (score < 3000) return { normal: 70, moving: 30, breakable: 0, vanishing: 0 };
  if (score < 6000) return { normal: 50, moving: 30, breakable: 20, vanishing: 0 };
  if (score < 10000) return { normal: 35, moving: 30, breakable: 20, vanishing: 15 };
  return { normal: 20, moving: 30, breakable: 30, vanishing: 20 };
}

function getEnemyChance(score: number): { chance: number; types: EnemyType[] } {
  if (score < 2000) return { chance: 0, types: [] };
  if (score < 5000) return { chance: 0.04, types: ['ground'] };
  if (score < 8000) return { chance: 0.07, types: ['ground', 'flying'] };
  if (score < 12000) return { chance: 0.10, types: ['ground', 'flying', 'ufo'] };
  if (score < 15000) return { chance: 0.12, types: ['ground', 'flying', 'ufo', 'blackhole'] };
  if (score < 20000) return { chance: 0.14, types: ['ground', 'flying', 'ufo', 'blackhole'] };
  if (score < 30000) return { chance: 0.16, types: ['ground', 'flying', 'ufo', 'blackhole'] };
  return { chance: 0.18, types: ['ground', 'flying', 'ufo', 'blackhole'] };
}

function getMinEnemyGap(score: number): number {
  if (score < 10000) return 400;
  if (score < 20000) return 350;
  return 300;
}

function getPlatSpacing(score: number): [number, number] {
  if (score < 3000) return [50, 75];
  if (score < 8000) return [65, 100];
  return [80, 125];
}

function pickPlatType(score: number): PlatType {
  const w = getPlatformWeights(score);
  const total = w.normal + w.moving + w.breakable + w.vanishing;
  let r = Math.random() * total;
  if ((r -= w.normal) < 0) return 'normal';
  if ((r -= w.moving) < 0) return 'moving';
  if ((r -= w.breakable) < 0) return 'breakable';
  return 'vanishing';
}

const PLAT_COLORS: Record<PlatType, string> = {
  normal: '#a855f7',
  moving: '#06b6d4',
  breakable: '#ef4444',
  vanishing: '#888888',
};

export default function DoodleJumpGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [gyroEnabled, setGyroEnabled] = useState(() => localStorage.getItem('bob-jump-gyro') === 'true');
  const touchStartRef = useRef<{ x: number; id: number } | null>(null);

  const stateRef = useRef({
    player: { x: W / 2 - 18, y: H - 120, w: 36, h: 36, vy: JUMP, vx: 0 },
    platforms: [] as Platform[],
    projectiles: [] as Projectile[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    score: 0, best: 0, cameraY: 0, maxHeight: 0,
    state: 'idle' as GameState,
    keys: {} as Record<string, boolean>,
    jetpackTimer: 0,
    hasShield: false,
    lastEnemySpawnY: 0,
    gyroX: 0,
    gyroEnabled: false,
    lastTime: 0,
    accumulator: 0,
  });

  const spawnParticles = useCallback((x: number, y: number) => {
    const s = stateRef.current;
    const colors = ['#ef4444', '#f97316', '#fbbf24', '#ff6b6b'];
    for (let i = 0; i < 12; i++) {
      s.particles.push({
        x: x + Math.random() * PLAT_W,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 5 - 2,
        life: 20 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 3,
      });
    }
  }, []);

  const genPlatform = useCallback((y: number, score: number, forceNormal = false): Platform => {
    const type = forceNormal ? 'normal' : pickPlatType(score);
    const p: Platform = {
      x: Math.random() * (W - PLAT_W - 20) + 10, y, w: PLAT_W, h: PLAT_H,
      type, dir: Math.random() < 0.5 ? 1 : -1, speed: 0.7 + Math.random() * 0.5,
    };
    if (type === 'normal') {
      if (score >= 0 && Math.random() < (score < 5000 ? 1 / 8 : 1 / 12)) {
        p.powerUp = 'spring';
      } else if (score >= 1000 && Math.random() < 1 / 40) {
        p.powerUp = 'jetpack';
      } else if (score >= 5000 && Math.random() < 1 / 50) {
        p.powerUp = 'shield';
      }
    }
    return p;
  }, []);

  const shoot = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'playing') return;
    s.projectiles.push({ x: s.player.x + s.player.w / 2, y: s.player.y - s.cameraY });
  }, []);

  const start = useCallback(() => {
    const s = stateRef.current;
    s.score = 0; s.cameraY = 0; s.maxHeight = 0;
    s.player = { x: W / 2 - 18, y: H - 120, w: 36, h: 36, vy: JUMP, vx: 0 };
    s.platforms = [{ x: W / 2 - 40, y: H - 60, w: 80, h: PLAT_H, type: 'normal', dir: 1, speed: 0 }];
    s.projectiles = [];
    s.enemies = [];
    s.particles = [];
    s.jetpackTimer = 0;
    s.hasShield = false;
    s.lastEnemySpawnY = 0;
    const [minS, maxS] = getPlatSpacing(0);
    for (let i = 0; i < 12; i++) {
      const gap = minS + Math.random() * (maxS - minS);
      s.platforms.push(genPlatform(H - 80 - i * gap, 0, i < 3));
    }
    s.lastTime = 0;
    s.accumulator = 0;
    s.state = 'playing'; setGameState('playing');
  }, [genPlatform]);

  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (s.state === 'playing') {
      s.state = 'paused'; setGameState('paused');
    } else if (s.state === 'paused') {
      s.state = 'playing'; setGameState('playing');
    }
  }, []);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'playing') return;

    // Movement
    if (s.keys['ArrowLeft'] || s.keys['a'] || s.keys['left']) s.player.vx = -4;
    else if (s.keys['ArrowRight'] || s.keys['d'] || s.keys['right']) s.player.vx = 4;
    else if (s.gyroEnabled && Math.abs(s.gyroX) > 3) s.player.vx = s.gyroX * 0.15;
    else s.player.vx *= 0.85;

    // Jetpack
    if (s.jetpackTimer > 0) {
      s.jetpackTimer--;
      s.player.vy = -5;
    } else {
      s.player.vy += GRAVITY;
    }

    s.player.x += s.player.vx;
    s.player.y += s.player.vy;

    // Wrap
    if (s.player.x + s.player.w < 0) s.player.x = W;
    if (s.player.x > W) s.player.x = -s.player.w;

    // Camera
    const threshold = H * 0.4;
    if (s.player.y - s.cameraY < threshold) {
      const diff = threshold - (s.player.y - s.cameraY);
      s.cameraY -= diff;
    }
    // Height-based scoring
    const currentHeight = -s.player.y;
    if (currentHeight > s.maxHeight) {
      s.score += Math.round(currentHeight - s.maxHeight);
      s.maxHeight = currentHeight;
    }

    // Platform collision (only when falling)
    if (s.player.vy > 0 && s.jetpackTimer <= 0) {
      for (const p of s.platforms) {
        if (p.broken) continue;
        const py = s.player.y - s.cameraY;
        const ppy = p.y - s.cameraY;
        if (s.player.x + s.player.w > p.x && s.player.x < p.x + p.w &&
            py + s.player.h > ppy && py + s.player.h < ppy + PLAT_H + 12) {
          
          // Breakable — start 1s timer on first bounce
          if (p.type === 'breakable') {
            if (p.breakTimer === undefined) {
              p.breakTimer = 60; // 1 second at 60fps
            }
          }
          // Vanishing
          if (p.type === 'vanishing' && !p.vanishing) {
            p.vanishing = true; p.vanishTimer = 30;
          }

          // Power-up pickup
          if (p.powerUp) {
            s.score += 25;
            if (p.powerUp === 'spring') s.player.vy = JUMP * 2;
            else if (p.powerUp === 'jetpack') s.jetpackTimer = 180;
            else if (p.powerUp === 'shield') s.hasShield = true;
            p.powerUp = undefined;
            if (p.powerUp !== undefined) { /* already handled */ }
          }

          if (p.powerUp === undefined || !p.powerUp) {
            if (s.player.vy > 0) s.player.vy = JUMP;
          }
        }
      }
    }

    // Update vanishing platforms
    for (const p of s.platforms) {
      if (p.vanishing && p.vanishTimer !== undefined) {
        p.vanishTimer--;
        if (p.vanishTimer <= 0) p.broken = true;
      }
    }

    // Update breakable platform timers
    for (const p of s.platforms) {
      if (p.type === 'breakable' && p.breakTimer !== undefined && !p.broken) {
        p.breakTimer--;
        if (p.breakTimer <= 0) {
          p.broken = true;
          spawnParticles(p.x, p.y);
        }
      }
    }

    // Update particles
    s.particles = s.particles.filter(pt => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.15;
      pt.life--;
      return pt.life > 0;
    });

    // Moving platforms
    for (const p of s.platforms) {
      if (p.type === 'moving' && !p.broken) {
        p.x += p.dir * p.speed;
        if (p.x <= 0 || p.x + p.w >= W) p.dir *= -1;
      }
    }

    // Generate new platforms
    const topY = s.cameraY;
    const [minS, maxS] = getPlatSpacing(s.score);
    while (s.platforms.length === 0 || s.platforms[s.platforms.length - 1].y > topY - 60) {
      const lastY = s.platforms.length > 0 ? s.platforms[s.platforms.length - 1].y : H;
      const gap = minS + Math.random() * (maxS - minS);
      const maxGap = 178 * 0.72;
      const clampedGap = Math.min(gap, maxGap);
      const newPlat = genPlatform(lastY - clampedGap, s.score);
      s.platforms.push(newPlat);

      // Platform-linked enemy spawning
      const { chance, types } = getEnemyChance(s.score);
      const minGap = getMinEnemyGap(s.score);
      if (chance > 0 && types.length > 0
        && (newPlat.type === 'normal' || newPlat.type === 'moving')
        && Math.abs(newPlat.y - s.lastEnemySpawnY) > minGap
        && Math.random() < chance) {
        const eType = types[Math.floor(Math.random() * types.length)];
        if (eType === 'ground') {
          s.enemies.push({ x: newPlat.x + newPlat.w / 2 - 12, y: newPlat.y - 24, w: 24, h: 24, type: eType, dir: 1, speed: 0.8, hp: 1 });
        } else if (eType === 'flying') {
          s.enemies.push({ x: newPlat.x + newPlat.w / 2 - 14, y: newPlat.y - 40 - Math.random() * 20, w: 28, h: 20, type: eType, dir: Math.random() < 0.5 ? 1 : -1, speed: 1.2, hp: 1 });
        } else if (eType === 'ufo') {
          s.enemies.push({ x: newPlat.x + newPlat.w / 2 - 18, y: newPlat.y - 50, w: 36, h: 24, type: eType, dir: Math.random() < 0.5 ? 1 : -1, speed: 0.5, hp: 3 });
        } else if (eType === 'blackhole') {
          s.enemies.push({ x: newPlat.x + newPlat.w / 2 - 16, y: newPlat.y - 50, w: 32, h: 32, type: eType, dir: 0, speed: 0, hp: 999 });
        }
        s.lastEnemySpawnY = newPlat.y;
      }
    }

    // Update enemies
    for (const e of s.enemies) {
      if (e.type === 'ground') { e.x += e.dir * e.speed; if (e.x <= 0 || e.x + e.w >= W) e.dir *= -1; }
      if (e.type === 'flying') { e.x += e.dir * e.speed; if (e.x <= 0 || e.x + e.w >= W) e.dir *= -1; }
      if (e.type === 'ufo') { e.x += e.dir * e.speed; if (e.x <= 0 || e.x + e.w >= W) e.dir *= -1; }
    }

    // Projectiles
    s.projectiles = s.projectiles.map(p => ({ ...p, y: p.y - 9 })).filter(p => p.y > -20);

    // Projectile-enemy collisions
    for (let i = s.projectiles.length - 1; i >= 0; i--) {
      const proj = s.projectiles[i];
      for (let j = s.enemies.length - 1; j >= 0; j--) {
        const e = s.enemies[j];
        if (e.type === 'blackhole') continue;
        const ey = e.y - s.cameraY;
        if (proj.x > e.x && proj.x < e.x + e.w && proj.y > ey && proj.y < ey + e.h) {
          e.hp--;
          s.projectiles.splice(i, 1);
          if (e.hp <= 0) { s.enemies.splice(j, 1); s.score += 50; }
          break;
        }
      }
    }

    // Player-enemy collision
    const px = s.player.x, py = s.player.y - s.cameraY, pw = s.player.w, ph = s.player.h;
    for (let j = s.enemies.length - 1; j >= 0; j--) {
      const e = s.enemies[j];
      const ey = e.y - s.cameraY;
      if (px + pw > e.x && px < e.x + e.w && py + ph > ey && py < ey + e.h) {
        if (e.type === 'blackhole') {
          if (s.score > s.best) s.best = s.score;
          s.state = 'dead'; setGameState('dead'); return;
        }
        if (e.type === 'ground' && s.player.vy > 0 && py + ph < ey + e.h / 2) {
          s.enemies.splice(j, 1); s.score += 100; s.player.vy = JUMP;
          continue;
        }
        if (s.hasShield && s.jetpackTimer <= 0) {
          s.hasShield = false; s.enemies.splice(j, 1);
          continue;
        }
        if (s.jetpackTimer > 0) continue;
        if (s.score > s.best) s.best = s.score;
        s.state = 'dead'; setGameState('dead'); return;
      }
    }

    // Clean up enemies off screen
    s.enemies = s.enemies.filter(e => e.y - s.cameraY < H + 100 && e.y - s.cameraY > -200);

    // Fall death
    if (s.player.y - s.cameraY > H + 50) {
      if (s.score > s.best) s.best = s.score;
      s.state = 'dead'; setGameState('dead');
    }
  }, [genPlatform, spawnParticles]);

  const drawRobot = useCallback((ctx: CanvasRenderingContext2D, px: number, py: number, hasShield: boolean, hasJetpack: boolean) => {
    ctx.save();
    ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 14;

    if (hasShield) {
      ctx.strokeStyle = 'rgba(168,85,247,0.5)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(px + 18, py + 20, 28, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 14;
    }

    if (hasJetpack) {
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(px + 6, py + 42); ctx.lineTo(px + 12, py + 55 + Math.random() * 6); ctx.lineTo(px + 18, py + 42); ctx.fill();
      ctx.beginPath(); ctx.moveTo(px + 18, py + 42); ctx.lineTo(px + 24, py + 55 + Math.random() * 6); ctx.lineTo(px + 30, py + 42); ctx.fill();
      ctx.shadowBlur = 14; ctx.shadowColor = '#a855f7';
    }

    ctx.fillStyle = '#6d28d9';
    ctx.fillRect(px + 8, py + 32, 7, 9);
    ctx.fillRect(px + 21, py + 32, 7, 9);
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(px + 6, py + 39, 10, 4);
    ctx.fillRect(px + 20, py + 39, 10, 4);

    ctx.fillStyle = '#7c3aed';
    ctx.beginPath(); ctx.roundRect(px + 5, py + 18, 26, 16, 4); ctx.fill();
    ctx.fillStyle = '#a855f7';
    ctx.beginPath(); ctx.roundRect(px + 11, py + 21, 14, 8, 2); ctx.fill();
    ctx.fillStyle = '#e879f9'; ctx.shadowColor = '#e879f9'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(px + 18, py + 25, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 14; ctx.shadowColor = '#a855f7';

    ctx.fillStyle = '#6d28d9';
    ctx.fillRect(px - 2, py + 20, 7, 5);
    ctx.fillStyle = '#4c1d95'; ctx.fillRect(px - 4, py + 20, 4, 4);
    ctx.fillStyle = '#6d28d9'; ctx.fillRect(px + 31, py + 20, 7, 5);
    ctx.fillStyle = '#4c1d95'; ctx.fillRect(px + 36, py + 20, 4, 4);

    ctx.fillStyle = '#6d28d9'; ctx.fillRect(px + 14, py + 14, 8, 6);

    ctx.fillStyle = '#5b21b6';
    ctx.beginPath(); ctx.roundRect(px + 11, py + 10, 14, 6, 2); ctx.fill();
    const bcx = px + 18, bcy = py + 4;
    ctx.fillStyle = 'rgba(196,132,252,0.25)';
    ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 1.5;
    ctx.shadowColor = '#c084fc'; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.ellipse(bcx, bcy, 11, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 14; ctx.shadowColor = '#a855f7';

    ctx.strokeStyle = '#fde68a'; ctx.shadowColor = '#fde68a'; ctx.shadowBlur = 8; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bcx - 3, bcy + 5); ctx.lineTo(bcx - 1, bcy + 2); ctx.lineTo(bcx - 3, bcy - 1);
    ctx.lineTo(bcx - 1, bcy - 4); ctx.lineTo(bcx + 1, bcy - 4); ctx.lineTo(bcx + 3, bcy - 1);
    ctx.lineTo(bcx + 1, bcy + 2); ctx.lineTo(bcx + 3, bcy + 5);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0f0f1a';
    ctx.beginPath(); ctx.arc(bcx - 4, bcy + 3, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(bcx + 4, bcy + 3, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e879f9';
    ctx.beginPath(); ctx.arc(bcx - 3.2, bcy + 2.2, 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(bcx + 4.8, bcy + 2.2, 0.9, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.ellipse(bcx - 4, bcy - 5, 3.5, 5, -0.4, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }, []);

  const drawEnemy = useCallback((ctx: CanvasRenderingContext2D, e: Enemy, ey: number) => {
    ctx.save();
    if (e.type === 'ground') {
      ctx.fillStyle = '#ef4444'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.roundRect(e.x, ey, e.w, e.h, 6); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(e.x + 7, ey + 8, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(e.x + 17, ey + 8, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(e.x + 7, ey + 9, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(e.x + 17, ey + 9, 1.5, 0, Math.PI * 2); ctx.fill();
    } else if (e.type === 'flying') {
      ctx.fillStyle = '#f59e0b'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.ellipse(e.x + 4, ey + 8, 8, 5, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(e.x + e.w - 4, ey + 8, 8, 5, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.ellipse(e.x + e.w / 2, ey + e.h / 2, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(e.x + e.w / 2 - 3, ey + 8, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(e.x + e.w / 2 + 3, ey + 8, 2, 0, Math.PI * 2); ctx.fill();
    } else if (e.type === 'ufo') {
      ctx.fillStyle = '#64748b'; ctx.shadowColor = '#94a3b8'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.ellipse(e.x + e.w / 2, ey + e.h / 2, e.w / 2, e.h / 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a5f3fc';
      ctx.beginPath(); ctx.ellipse(e.x + e.w / 2, ey + e.h / 3, 8, 10, 0, Math.PI, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${e.hp}`, e.x + e.w / 2, ey - 3);
    } else if (e.type === 'blackhole') {
      ctx.fillStyle = '#1a1a2e'; ctx.shadowColor = '#6366f1'; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(e.x + e.w / 2, ey + e.h / 2, e.w / 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(e.x + e.w / 2, ey + e.h / 2, e.w / 2 + 4, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(99,102,241,0.3)';
      ctx.beginPath(); ctx.arc(e.x + e.w / 2, ey + e.h / 2, e.w / 2 + 8, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }, []);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const s = stateRef.current;
    if (!ctx) return;

    // Fixed timestep accumulator – run physics at 60fps regardless of monitor refresh rate
    const STEP = 1000 / 60; // 16.67ms
    const now = performance.now();
    if (s.lastTime === 0) s.lastTime = now;
    const delta = Math.min(now - s.lastTime, 50); // cap at 50ms
    s.lastTime = now;
    s.accumulator += delta;
    let steps = 0;
    while (s.accumulator >= STEP && steps < 3) {
      update();
      s.accumulator -= STEP;
      steps++;
    }

    ctx.fillStyle = '#0f0f1a'; ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = 'rgba(168,85,247,0.3)';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137 + s.cameraY * 0.1) % W + W) % W;
      const sy = ((i * 97 + s.cameraY * 0.05) % H + H) % H;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Platforms
    for (const p of s.platforms) {
      if (p.broken && p.type !== 'breakable') continue;
      const py = p.y - s.cameraY;
      if (py > H + 20 || py < -20) continue;

      // Breakable broken — don't draw (explosion particles handle the visual)
      if (p.broken && p.type === 'breakable') {
        continue;
      }

      // Vanishing blink
      if (p.vanishing && p.vanishTimer !== undefined) {
        ctx.globalAlpha = p.vanishTimer % 6 < 3 ? 0.3 : 0.8;
      }

      // Breakable platform with active timer: flicker to warn
      if (p.type === 'breakable' && p.breakTimer !== undefined && !p.broken) {
        ctx.globalAlpha = p.breakTimer % 8 < 4 ? 0.4 : 1;
      }
      ctx.fillStyle = PLAT_COLORS[p.type];
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.roundRect(p.x, py, p.w, p.h, 4); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Draw power-up
      if (p.powerUp) {
        const cx = p.x + p.w / 2, cy = py - 10;
        if (p.powerUp === 'spring') {
          ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2; ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 6;
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            ctx.lineTo(cx - 5 + (i % 2) * 10, cy + i * 3);
          }
          ctx.stroke(); ctx.shadowBlur = 0;
        } else if (p.powerUp === 'jetpack') {
          ctx.fillStyle = '#f59e0b'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.roundRect(cx - 5, cy - 2, 10, 14, 3); ctx.fill();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath(); ctx.moveTo(cx - 3, cy + 12); ctx.lineTo(cx, cy + 18); ctx.lineTo(cx + 3, cy + 12); ctx.fill();
          ctx.shadowBlur = 0;
        } else if (p.powerUp === 'shield') {
          ctx.fillStyle = '#a855f7'; ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 6); ctx.lineTo(cx + 7, cy - 2); ctx.lineTo(cx + 6, cy + 5);
          ctx.lineTo(cx, cy + 8); ctx.lineTo(cx - 6, cy + 5); ctx.lineTo(cx - 7, cy - 2);
          ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
        }
      }
    }

    // Particles
    for (const pt of s.particles) {
      const ptY = pt.y - s.cameraY;
      ctx.globalAlpha = pt.life / 30;
      ctx.fillStyle = pt.color;
      ctx.shadowColor = pt.color; ctx.shadowBlur = 4;
      ctx.fillRect(pt.x, ptY, pt.size, pt.size);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Enemies
    for (const e of s.enemies) {
      const ey = e.y - s.cameraY;
      if (ey > H + 20 || ey < -40) continue;
      drawEnemy(ctx, e, ey);
    }

    // Projectiles
    ctx.fillStyle = '#fde68a'; ctx.shadowColor = '#fde68a'; ctx.shadowBlur = 8;
    for (const p of s.projectiles) {
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Player
    drawRobot(ctx, s.player.x, s.player.y - s.cameraY, s.hasShield, s.jetpackTimer > 0);

    // HUD
    ctx.font = "bold 13px monospace"; ctx.shadowBlur = 0;
    ctx.fillStyle = COLOR; ctx.textAlign = 'left';
    ctx.fillText(`SCORE  ${String(s.score).padStart(4, '0')}`, 10, 18);
    ctx.fillStyle = '#5a5a7a'; ctx.textAlign = 'right';
    ctx.fillText(`BEST  ${String(s.best).padStart(4, '0')}`, W - 10, 18);

    rafRef.current = requestAnimationFrame(render);
  }, [update, drawRobot, drawEnemy]);

  // Gyroscope
  useEffect(() => {
    stateRef.current.gyroEnabled = gyroEnabled;
    localStorage.setItem('bob-jump-gyro', String(gyroEnabled));
    if (!gyroEnabled) { stateRef.current.gyroX = 0; return; }
    const handler = (e: DeviceOrientationEvent) => {
      stateRef.current.gyroX = e.gamma || 0;
    };
    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [gyroEnabled]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) { ctx.fillStyle = '#0f0f1a'; ctx.fillRect(0, 0, W, H); }
    rafRef.current = requestAnimationFrame(render);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') { shoot(); e.preventDefault(); return; }
      stateRef.current.keys[e.key] = true; e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => { stateRef.current.keys[e.key] = false; };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);

    // Prevent document-level touch scrolling/selection during game
    const preventTouchMove = (e: TouchEvent) => { e.preventDefault(); };
    document.addEventListener('touchmove', preventTouchMove, { passive: false });

    // Touch controls on canvas
    const canvas = canvasRef.current;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, id: t.identifier };
      e.preventDefault();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const t = Array.from(e.touches).find(t => t.identifier === touchStartRef.current?.id);
      if (!t) return;
      const dx = t.clientX - touchStartRef.current.x;
      if (Math.abs(dx) > 10) {
        stateRef.current.keys['left'] = dx < -10;
        stateRef.current.keys['right'] = dx > 10;
      }
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartRef.current) {
        const moved = e.changedTouches[0];
        if (moved && Math.abs(moved.clientX - touchStartRef.current.x) < 15) {
          shoot();
        }
      }
      stateRef.current.keys['left'] = false;
      stateRef.current.keys['right'] = false;
      touchStartRef.current = null;
    };
    canvas?.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas?.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas?.addEventListener('touchend', onTouchEnd);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('touchmove', preventTouchMove);
      canvas?.removeEventListener('touchstart', onTouchStart);
      canvas?.removeEventListener('touchmove', onTouchMove);
      canvas?.removeEventListener('touchend', onTouchEnd);
    };
  }, [render, shoot]);

  const handleDirection = useCallback((dir: string, active: boolean) => {
    stateRef.current.keys[dir] = active;
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full" style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none' }}>
      <div className="relative w-full max-w-[360px] bg-black rounded-lg overflow-hidden" style={{ aspectRatio: `${W}/${H}`, userSelect: 'none', touchAction: 'none' }}>
        <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full rounded-lg" style={{ touchAction: 'none' }} />
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[34px]">🚀</div>
            <div className="text-lg font-bold" style={{ color: COLOR }}>B.O.B Jump</div>
            <div className="text-[11px] text-muted-foreground">← → pour bouger · ESPACE pour tirer</div>
          </div>
        )}
        {gameState === 'dead' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/78 rounded-lg font-mono text-foreground gap-3">
            <div className="text-[15px] font-bold text-destructive">GAME OVER</div>
            <div className="text-3xl font-extrabold" style={{ color: COLOR }}>{stateRef.current.score}</div>
            <div className="text-[11px] text-muted-foreground">MEILLEUR : {stateRef.current.best}</div>
          </div>
        )}
        {gameState === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 rounded-lg font-mono text-foreground gap-4 z-10">
            <div className="text-xl font-bold" style={{ color: COLOR }}>PAUSE</div>
            <button
              onClick={togglePause}
              className="px-6 py-2 rounded-full border font-mono text-xs"
              style={{ borderColor: COLOR, color: COLOR, background: 'rgba(168,85,247,0.1)' }}
            >▶ Reprendre</button>
            <button
              onClick={start}
              className="px-6 py-2 rounded-full border font-mono text-xs"
              style={{ borderColor: '#666', color: '#aaa', background: 'rgba(255,255,255,0.05)' }}
            >↺ Restart</button>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-muted-foreground">🌀 Gyroscope :</span>
              <button
                onClick={() => setGyroEnabled(!gyroEnabled)}
                className="px-3 py-1 rounded-full text-[10px] font-bold border"
                style={{
                  borderColor: gyroEnabled ? '#a855f7' : '#555',
                  color: gyroEnabled ? '#a855f7' : '#888',
                  background: gyroEnabled ? 'rgba(168,85,247,0.15)' : 'transparent',
                }}
              >{gyroEnabled ? 'ON' : 'OFF'}</button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        <div className="flex gap-3">
          <button
            className="w-[70px] h-14 rounded-xl bg-secondary border border-border text-foreground text-xl flex items-center justify-center cursor-pointer select-none transition-all active:scale-[0.88]"
            onPointerDown={() => handleDirection('left', true)}
            onPointerUp={() => handleDirection('left', false)}
            onPointerLeave={() => handleDirection('left', false)}
          >◀</button>
          <button
            className="w-14 h-14 rounded-xl border text-lg flex items-center justify-center cursor-pointer select-none transition-all active:scale-[0.88]"
            style={{ borderColor: COLOR, color: COLOR, background: 'rgba(168,85,247,0.1)' }}
            onClick={shoot}
          >🔫</button>
          <button
            className="w-[70px] h-14 rounded-xl bg-secondary border border-border text-foreground text-xl flex items-center justify-center cursor-pointer select-none transition-all active:scale-[0.88]"
            onPointerDown={() => handleDirection('right', true)}
            onPointerUp={() => handleDirection('right', false)}
            onPointerLeave={() => handleDirection('right', false)}
          >▶</button>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <ActionButton label="▶ Jouer" primary color={COLOR} onClick={start} />
          {gameState === 'playing' || gameState === 'paused' ? (
            <ActionButton label="⏸ Pause" color={COLOR} onClick={togglePause} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

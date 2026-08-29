import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../game/gameState';
import { LEVELS } from '../config/levels';
import { SEASONS_INFO, getRealCalendarMonthName } from '../config/events';

function fmtNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000)    return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('ru-RU');
}

function useBump(value: number) {
  const [bumping, setBumping] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setBumping(true);
      const t = setTimeout(() => setBumping(false), 500);
      return () => clearTimeout(t);
    }
  }, [value]);
  return bumping;
}

/** Chunked pixel progress bar — fills in discrete blocks */
const PixelBar: React.FC<{ pct: number; color: string; width?: number }> = ({ pct, color, width = 10 }) => {
  const filled = Math.round((pct / 100) * width);
  return (
    <div className="px-bar-wrap flex gap-[2px]" style={{ height: 10 }}>
      {Array.from({ length: width }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: '100%',
            background: i < filled ? color : '#1a0800',
            imageRendering: 'pixelated',
          }}
        />
      ))}
    </div>
  );
};

export const TopBar: React.FC = () => {
  const {
    level, xp, coins, gems,
    activeSeason, activeEvent, eventEndsAt,
    soundMuted, setSoundMuted, openModal,
  } = useGameStore();

  const currentLevelConfig = LEVELS[level - 1];
  const xpNeeded  = currentLevelConfig ? currentLevelConfig.xpRequired : 1000;
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));
  const seasonInfo = SEASONS_INFO[activeSeason];

  const timeLeftSec = Math.max(0, Math.floor((eventEndsAt - Date.now()) / 1000));
  const timeMin = Math.floor(timeLeftSec / 60);
  const timeSec = timeLeftSec % 60;

  const coinsBump = useBump(coins);
  const gemsBump  = useBump(gems);
  const xpBump    = useBump(xp);

  return (
    <header className="absolute top-0 left-0 right-0 p-2 sm:p-3 flex items-start justify-between pointer-events-none z-30">

      {/* ── LEFT: Level + XP ── */}
      <div className="pointer-events-auto px-panel flex flex-col gap-1.5 px-2 py-2" style={{ minWidth: 160 }}>
        {/* Level row */}
        <div className="flex items-center gap-2">
          <button
            id="btn-level-badge"
            onClick={() => openModal('levelup')}
            className="px-btn px-btn-blue flex items-center justify-center"
            style={{ width: 36, height: 36, fontSize: 13, fontFamily: "'Press Start 2P', monospace" }}
            title={`Уровень ${level}`}
          >
            {level}
          </button>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex justify-between items-center">
              <span className="px-font text-[6px] text-amber-400 uppercase tracking-wider">EXP</span>
              <span className={`px-font text-[6px] transition-colors ${xpBump ? 'text-yellow-300' : 'text-amber-300/70'}`}>
                {xp}/{xpNeeded}
              </span>
            </div>
            <PixelBar pct={xpPercent} color={xpBump ? '#60a5fa' : '#3b82f6'} width={8} />
          </div>
        </div>

        {/* Season & Weather row */}
        <button
          onClick={() => openModal('events')}
          className="px-btn px-btn-amber flex items-center gap-1.5 w-full text-left"
          style={{ padding: '4px 6px' }}
          title="Нажмите для выбора сезона и погоды"
        >
          <span style={{ fontSize: 14 }}>{activeEvent?.icon || seasonInfo.icon}</span>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="px-font text-[6px] text-amber-300 truncate">
              {activeEvent?.name || seasonInfo.name}
            </span>
            <span className="px-font text-[5px] text-amber-400/80 truncate">
              {seasonInfo.icon} {seasonInfo.name} ({getRealCalendarMonthName()})
            </span>
          </div>
          {activeEvent && (
            <span className="px-font text-[5px] text-amber-400 ml-auto">
              {timeMin}:{timeSec < 10 ? `0${timeSec}` : timeSec}
            </span>
          )}
        </button>
      </div>

      {/* ── RIGHT: Currencies + Controls ── */}
      <div className="pointer-events-auto flex flex-col gap-1.5 items-end">

        {/* Coins */}
        <div
          className={`px-panel flex items-center gap-2 px-2 py-1.5 transition-all ${coinsBump ? 'brightness-125' : ''}`}
          style={{ minWidth: 110 }}
        >
          <span style={{ fontSize: 16, imageRendering: 'pixelated' }}>💰</span>
          <span className={`px-font text-[9px] tabular-nums ${coinsBump ? 'text-yellow-300' : 'text-amber-300'}`}>
            {fmtNumber(coins)}
          </span>
        </div>

        {/* Gems */}
        <div
          className={`px-panel flex items-center gap-2 px-2 py-1.5 transition-all ${gemsBump ? 'brightness-125' : ''}`}
          style={{ minWidth: 110 }}
        >
          <span style={{ fontSize: 16, imageRendering: 'pixelated' }}>💎</span>
          <span className={`px-font text-[9px] tabular-nums ${gemsBump ? 'text-cyan-300' : 'text-cyan-400'}`}>
            {fmtNumber(gems)}
          </span>
        </div>

        {/* Controls row */}
        <div className="flex gap-1.5">
          <button
            id="btn-sound-toggle"
            onClick={() => setSoundMuted(!soundMuted)}
            className="px-btn px-btn-amber"
            style={{ width: 34, height: 30, fontSize: 14 }}
            title={soundMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {soundMuted ? '🔇' : '🔊'}
          </button>
          <button
            id="btn-settings-modal"
            onClick={() => openModal('settings')}
            className="px-btn px-btn-amber"
            style={{ width: 34, height: 30, fontSize: 14 }}
            title="Настройки"
          >
            ⚙️
          </button>
        </div>
      </div>
    </header>
  );
};

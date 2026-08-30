import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, generateWeatherForecast } from '../game/gameState';
import { GAME_EVENTS, getMoscowTime } from '../config/events';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic } from '../utils/telegram';
import { CloudRain, Sun, Droplets, Clock, Sparkles, X, ChevronRight } from 'lucide-react';

export const WeatherForecastWidget: React.FC = () => {
  const { activeEvent, eventEndsAt, isDesign2026 } = useGameStore();
  const [timeStr, setTimeStr] = useState('');
  const [dayPhase, setDayPhase] = useState<{ label: string; icon: string }>({ label: 'День', icon: '☀️' });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const m = getMoscowTime();
      setTimeStr(m.timeString);
      setDayPhase(m.dayPhase);
    };

    updateTime();
    const interval = setInterval(updateTime, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isPopoverOpen) return;
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((eventEndsAt - Date.now()) / 1000));
      setTimeLeftSec(remaining);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isPopoverOpen, eventEndsAt]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopoverOpen]);

  const event = activeEvent || GAME_EVENTS.sunny_day;
  const isRainy = event.type === 'rain' || event.type === 'thunderstorm';
  const precipText = isRainy ? 'Осадки: 85%' : 'Без осадков';

  const hourlyForecast = generateWeatherForecast(event);
  const mins = Math.floor(timeLeftSec / 60);
  const secs = timeLeftSec % 60;
  const timeFormatted = `${mins}:${String(secs).padStart(2, '0')}`;

  return (
    <div ref={popoverRef} className="relative z-40 pointer-events-auto select-none w-full">
      
      {/* ── CASUAL GAME WEATHER BAROMETER PLAQUE ── */}
      <button
        onClick={() => {
          sounds.playClick();
          triggerTelegramHaptic('light');
          setIsPopoverOpen(prev => !prev);
        }}
        className={`game-badge-wood w-full flex items-center justify-between gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 transition-all active:scale-95 cursor-pointer group ${
          isPopoverOpen ? 'ring-2 ring-amber-400' : ''
        }`}
        title="Прогноз погоды и сезоны"
      >
        <div className="flex items-center gap-1.5">
          {/* Weather Icon Box */}
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-sm sm:text-base shadow-inner bg-black/40 border border-amber-500/40 shrink-0">
            {event.icon}
          </div>

          {/* Time & Weather Info */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1 leading-tight">
              <span className="font-extrabold text-[10px] sm:text-xs text-amber-100 game-text-shadow">
                {dayPhase.icon} {timeStr}
              </span>
              <span className="text-[7.5px] sm:text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-yellow-300 font-bold">
                {dayPhase.label}
              </span>
            </div>

            <div className="flex items-center gap-1 mt-0.5 text-[9px] sm:text-[10px]">
              <span className={isRainy ? 'text-sky-300 font-black' : 'text-amber-300 font-bold'}>
                {event.name.split(' ')[0]}
              </span>
              <span className="text-amber-500/60">•</span>
              <span className="text-amber-200/70 font-semibold">{precipText}</span>
            </div>
          </div>
        </div>

        {/* Forecast Arrow Pill */}
        <div className="w-4.5 h-4.5 rounded-lg bg-black/40 border border-amber-700/50 group-hover:border-amber-400 flex items-center justify-center text-[9px] font-black text-amber-300 transition-colors shrink-0">
          ❯
        </div>
      </button>

      {/* ── CASUAL GAME BAROMETER WEATHER POPOVER DIALOG ── */}
      {isPopoverOpen && (
        <div className="fixed top-[95px] sm:top-[110px] right-2 sm:right-3.5 w-[calc(100vw-16px)] max-w-[330px] sm:max-w-[350px] p-3.5 sm:p-4 rounded-3xl game-dock-tray border-2 border-amber-500/80 shadow-2xl shadow-black/95 text-white flex flex-col gap-3 animate-pop-in z-[100]">
          
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl game-side-medal flex items-center justify-center text-base shrink-0 shadow-md">
                🌤️
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs text-yellow-300 game-text-gold flex items-center gap-1.5 truncate">
                  <span>Прогноз погоды</span>
                  <span className="text-[8px] px-1.5 py-0.2 rounded-full game-ribbon-tag text-white font-black">
                    Live
                  </span>
                </span>
                <span className="text-[10px] text-amber-200/80 truncate">
                  {dayPhase.icon} {dayPhase.label}, {timeStr}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setIsPopoverOpen(false);
              }}
              className="w-7 h-7 rounded-xl game-dock-btn text-amber-200 hover:text-white hover:border-red-400 flex items-center justify-center text-sm font-black transition-all cursor-pointer shrink-0 shadow-md active:scale-90"
              title="Закрыть"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* Current Weather Card */}
          <div className="game-badge-wood p-3 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-3xl shadow-inner border border-amber-500/40 shrink-0">
                {event.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[9.5px] uppercase font-black text-amber-400 tracking-wider">
                  Сейчас
                </span>
                <span className="text-sm font-black text-amber-100 game-text-shadow leading-tight">
                  {event.name}
                </span>
                <span className="text-[10px] text-amber-200/80 font-medium">
                  {precipText}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-yellow-300 game-text-gold">
                +22°C
              </span>
              <span className="text-[9px] text-amber-200 font-extrabold bg-black/40 px-1.5 py-0.2 rounded-md border border-amber-700/60 flex items-center gap-1 mt-0.5">
                <Clock size={9} className="text-amber-400" /> {timeFormatted}
              </span>
            </div>
          </div>

          {/* Crop & Fishing Bonus Banner */}
          <div className="p-2.5 rounded-xl game-badge-slot flex items-center gap-2 text-[11px]">
            <Sparkles size={14} className="text-yellow-400 shrink-0 filter drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]" />
            <span className="font-bold text-amber-100/90 text-[10.5px]">
              Эффект: <span className="text-emerald-300 font-black">{event.bonusEffect || 'Стабильный рост'}</span>
            </span>
          </div>

          {/* Hourly Timeline */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase text-amber-200/90 tracking-wider px-0.5 game-text-shadow">
              Почасовой прогноз:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
              {hourlyForecast.map((h, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-between text-center gap-1 min-w-[62px] shrink-0 snap-start transition-all ${
                    h.isCurrent
                      ? 'game-dock-btn border-amber-400 shadow-[0_0_10px_rgba(250,204,21,0.4)]'
                      : 'game-dock-btn'
                  }`}
                >
                  <span className="text-[9px] font-black text-amber-300/80">
                    {h.timeLabel}
                  </span>
                  <span className="text-lg my-0.5 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    {h.icon}
                  </span>
                  <span className="text-[10px] font-black text-amber-100">
                    +{h.tempCelsius}°
                  </span>
                  <span className="text-[8px] font-bold text-sky-300 flex items-center gap-0.5">
                    <Droplets size={8} /> {h.precipChancePercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Day Outlook */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase text-amber-200/90 tracking-wider px-0.5 game-text-shadow">
              Прогноз на 3 дня:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              
              <div className="p-2 rounded-xl game-dock-btn flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-bold text-amber-300/80">Сегодня</span>
                <span className="text-base">{event.icon}</span>
                <span className="text-[10px] font-black text-amber-100">+22°</span>
                <span className="text-[8px] text-emerald-300 font-black">Оптимально</span>
              </div>

              <div className="p-2 rounded-xl game-dock-btn flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-bold text-amber-300/80">Завтра</span>
                <span className="text-base">🌧️</span>
                <span className="text-[10px] font-black text-amber-100">+19°</span>
                <span className="text-[8px] text-sky-300 font-black">+50% урожай</span>
              </div>

              <div className="p-2 rounded-xl game-dock-btn flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-bold text-amber-300/80">Послезавтра</span>
                <span className="text-base">🌈</span>
                <span className="text-[10px] font-black text-amber-100">+24°</span>
                <span className="text-[8px] text-pink-300 font-black">x2 Опыт</span>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};

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

      {/* ── BEAUTIFUL TRANSPARENT RIGHT-SIDE GLASS POPOVER (MOBILE ADAPTED) ── */}
      {isPopoverOpen && (
        <div className="fixed top-[95px] sm:top-[110px] right-2 sm:right-3.5 w-[calc(100vw-16px)] max-w-[330px] sm:max-w-[350px] p-3.5 sm:p-4 rounded-3xl bg-[#10141D]/95 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/90 text-white flex flex-col gap-3 animate-pop-in z-[100]">
          
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sm shrink-0">
                🌤️
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs text-white flex items-center gap-1.5 truncate">
                  <span>Прогноз погоды</span>
                  <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    Live
                  </span>
                </span>
                <span className="text-[10px] text-[#8E939D] truncate">
                  {dayPhase.icon} {dayPhase.label}, {timeStr}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setIsPopoverOpen(false);
              }}
              className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>

          {/* Current Weather Card */}
          <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-inner ${
            isRainy
              ? 'bg-gradient-to-r from-sky-950/80 to-[#10293D]/80 border-sky-400/40'
              : 'bg-gradient-to-r from-amber-950/80 to-[#2A1D0B]/80 border-amber-400/40'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center text-3xl shadow-inner border border-white/10">
                {event.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-sky-300">
                  Сейчас
                </span>
                <span className="text-sm font-black text-white leading-tight">
                  {event.name}
                </span>
                <span className="text-[10px] text-white/80 font-medium">
                  {precipText}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-white">
                +22°C
              </span>
              <span className="text-[9px] text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-400/30 flex items-center gap-1 mt-0.5">
                <Clock size={9} /> {timeFormatted}
              </span>
            </div>
          </div>

          {/* Crop & Fishing Bonus Banner */}
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2 text-[11px]">
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <span className="font-semibold text-white/90">
              Эффект: <span className="text-emerald-400 font-extrabold">{event.bonusEffect || 'Стабильный рост'}</span>
            </span>
          </div>

          {/* Hourly Timeline */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase text-[#8E939D] tracking-wider px-0.5">
              Почасовой прогноз:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
              {hourlyForecast.map((h, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-between text-center gap-1 min-w-[62px] shrink-0 snap-start transition-all ${
                    h.isCurrent
                      ? 'bg-sky-950/80 border-sky-400 text-white shadow'
                      : 'bg-black/30 border-white/10 text-white'
                  }`}
                >
                  <span className="text-[9px] font-black text-[#8E939D]">
                    {h.timeLabel}
                  </span>
                  <span className="text-lg my-0.5">
                    {h.icon}
                  </span>
                  <span className="text-[10px] font-black text-white">
                    +{h.tempCelsius}°
                  </span>
                  <span className="text-[8px] font-bold text-sky-400 flex items-center gap-0.5">
                    <Droplets size={8} /> {h.precipChancePercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Day Outlook */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase text-[#8E939D] tracking-wider px-0.5">
              Прогноз на 3 дня:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              
              <div className="p-2 rounded-xl bg-black/30 border border-white/10 flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-bold text-[#8E939D]">Сегодня</span>
                <span className="text-base">{event.icon}</span>
                <span className="text-[10px] font-black text-white">+22°</span>
                <span className="text-[8px] text-emerald-400 font-bold">Оптимально</span>
              </div>

              <div className="p-2 rounded-xl bg-black/30 border border-white/10 flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-bold text-[#8E939D]">Завтра</span>
                <span className="text-base">🌧️</span>
                <span className="text-[10px] font-black text-white">+19°</span>
                <span className="text-[8px] text-sky-400 font-bold">+50% урожай</span>
              </div>

              <div className="p-2 rounded-xl bg-black/30 border border-white/10 flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-bold text-[#8E939D]">Послезавтра</span>
                <span className="text-base">🌈</span>
                <span className="text-[10px] font-black text-white">+24°</span>
                <span className="text-[8px] text-pink-400 font-bold">x2 Опыт</span>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, generateWeatherForecast } from '../game/gameState';
import { GAME_EVENTS } from '../config/events';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic } from '../utils/telegram';
import { CloudRain, Sun, Droplets, Clock, Sparkles, X, ChevronRight } from 'lucide-react';

export const WeatherForecastWidget: React.FC = () => {
  const { activeEvent, eventEndsAt, activeModal, isDesign2026 } = useGameStore();
  const [timeStr, setTimeStr] = useState('');
  const [dayPhase, setDayPhase] = useState<{ label: string; icon: string }>({ label: 'День', icon: '☀️' });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = d.getHours();
      const m = d.getMinutes();
      setTimeStr(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);

      if (h >= 5 && h < 11) {
        setDayPhase({ label: 'Утро', icon: '🌅' });
      } else if (h >= 11 && h < 17) {
        setDayPhase({ label: 'День', icon: '☀️' });
      } else if (h >= 17 && h < 22) {
        setDayPhase({ label: 'Вечер', icon: '🌇' });
      } else {
        setDayPhase({ label: 'Ночь', icon: '🌙' });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
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

  // Only show on main 3D farm map when no major full modals are open
  if (activeModal !== null) return null;

  const event = activeEvent || GAME_EVENTS.sunny_day;
  const isRainy = event.type === 'rain' || event.type === 'thunderstorm';
  const precipText = isRainy ? 'Осадки: 85%' : 'Без осадков';

  const hourlyForecast = generateWeatherForecast(event);
  const mins = Math.floor(timeLeftSec / 60);
  const secs = timeLeftSec % 60;
  const timeFormatted = `${mins}:${String(secs).padStart(2, '0')}`;

  return (
    <div ref={popoverRef} className="fixed top-12 sm:top-14 right-2 sm:right-3 z-40 pointer-events-auto select-none">
      
      {/* ── WEATHER PILL TRIGGER BUTTON ── */}
      <button
        onClick={() => {
          sounds.playClick();
          triggerTelegramHaptic('light');
          setIsPopoverOpen(prev => !prev);
        }}
        className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl border shadow-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer group ${
          isPopoverOpen
            ? 'bg-amber-950/90 border-amber-400 ring-2 ring-amber-400/40 text-white shadow-amber-950/80'
            : isDesign2026
            ? 'bg-[#181C24]/90 border-[#242A35] text-white shadow-black/50 hover:border-amber-400/50'
            : 'hud-parchment border-amber-700/70 text-[#3B1F0D]'
        }`}
        title="Нажмите, чтобы открыть прозрачный прогноз погоды"
      >
        {/* Weather Icon Box */}
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-inner shrink-0 ${
          isRainy ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
        }`}>
          {event.icon}
        </div>

        {/* Time & Precipitation Info */}
        <div className="flex flex-col text-left pr-1">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="font-extrabold text-[10px] sm:text-xs text-white">
              {dayPhase.icon} {timeStr}
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-[#8E939D] font-bold">
              {dayPhase.label}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-0.5 text-[9px] sm:text-[10px]">
            <span className={isRainy ? 'text-sky-400 font-extrabold' : 'text-amber-300 font-bold'}>
              {event.name.split(' ')[0]}
            </span>
            <span className="text-white/40">•</span>
            <span className="text-[#8E939D] font-semibold">{precipText}</span>
          </div>
        </div>

        {/* Forecast Arrow Pill */}
        <div className="w-5 h-5 rounded-lg bg-white/10 group-hover:bg-amber-500/30 group-hover:text-amber-300 flex items-center justify-center text-[10px] font-black text-[#8E939D] transition-colors shrink-0">
          ❯
        </div>
      </button>

      {/* ── BEAUTIFUL TRANSPARENT RIGHT-SIDE GLASS POPOVER ── */}
      {isPopoverOpen && (
        <div className="absolute top-12 sm:top-14 right-0 w-[310px] sm:w-[350px] p-4 rounded-3xl bg-[#10141D]/92 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/80 text-white flex flex-col gap-3.5 animate-pop-in z-50">
          
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sm">
                🌤️
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xs text-white flex items-center gap-1.5">
                  <span>Прогноз погоды в Долине</span>
                  <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    Live
                  </span>
                </span>
                <span className="text-[10px] text-[#8E939D]">
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

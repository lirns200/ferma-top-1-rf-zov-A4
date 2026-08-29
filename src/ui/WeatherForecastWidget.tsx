import React, { useState, useEffect } from 'react';
import { useGameStore } from '../game/gameState';
import { GAME_EVENTS } from '../config/events';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic } from '../utils/telegram';

export const WeatherForecastWidget: React.FC = () => {
  const { activeEvent, openModal, activeModal, isDesign2026 } = useGameStore();
  const [timeStr, setTimeStr] = useState('');
  const [dayPhase, setDayPhase] = useState<{ label: string; icon: string }>({ label: 'День', icon: '☀️' });

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

  // Only show on main 3D farm map when no major full modals are open
  if (activeModal !== null) return null;

  const event = activeEvent || GAME_EVENTS.sunny_day;

  const isRainy = event.type === 'rain' || event.type === 'thunderstorm';
  const precipText = isRainy ? 'Осадки: 85%' : 'Без осадков';

  return (
    <div className="fixed top-12 sm:top-14 right-2 sm:right-3 z-40 pointer-events-auto select-none animate-pop-in">
      <button
        onClick={() => {
          sounds.playClick();
          triggerTelegramHaptic('light');
          openModal('weather_forecast');
        }}
        className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl border shadow-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer hover:border-amber-400/50 group ${
          isDesign2026
            ? 'bg-[#181C24]/90 border-[#242A35] text-white shadow-black/50'
            : 'hud-parchment border-amber-700/70 text-[#3B1F0D]'
        }`}
        title="Нажмите, чтобы открыть прогноз погоды"
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
    </div>
  );
};

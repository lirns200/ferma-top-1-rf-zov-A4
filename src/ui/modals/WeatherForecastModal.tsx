import React, { useState, useEffect } from 'react';
import { useGameStore, generateWeatherForecast } from '../../game/gameState';
import { GAME_EVENTS } from '../../config/events';
import { sounds } from '../../audio/SoundManager';
import { triggerTelegramHaptic } from '../../utils/telegram';
import { CloudRain, Sun, CloudLightning, Wind, Droplets, Clock, Sparkles, TrendingUp } from 'lucide-react';

export const WeatherForecastModal: React.FC = () => {
  const { activeModal, closeModal, activeEvent, eventEndsAt, isDesign2026 } = useGameStore();
  const [timeLeftSec, setTimeLeftSec] = useState(0);

  useEffect(() => {
    if (activeModal !== 'weather_forecast') return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((eventEndsAt - Date.now()) / 1000));
      setTimeLeftSec(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeModal, eventEndsAt]);

  if (activeModal !== 'weather_forecast') return null;

  const event = activeEvent || GAME_EVENTS.sunny_day;

  const hourlyForecast = generateWeatherForecast(event);
  const isRainy = event.type === 'rain' || event.type === 'thunderstorm';

  const mins = Math.floor(timeLeftSec / 60);
  const secs = timeLeftSec % 60;
  const timeFormatted = `${mins}:${String(secs).padStart(2, '0')}`;

  return (
    <div className={`fixed inset-0 pt-12 sm:pt-14 pb-16 sm:pb-20 z-50 flex flex-col select-none animate-pop-in overflow-hidden transition-colors ${
      isDesign2026 ? 'bg-[#0F1115] text-white' : 'bg-[#2A1406] text-[#3B1F0D]'
    }`}>
      
      {/* ── TOP HEADER ── */}
      <div className={`px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-b shrink-0 ${
        isDesign2026 ? 'bg-[#181C24] border-[#242A35]' : 'bg-[#3D2008] border-[#5C3718]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-lg shadow-md border border-sky-400/40">
            🌤️
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-base tracking-wide flex items-center gap-1.5">
              <span>Метеостанция Долины</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30">
                Live
              </span>
            </span>
            <span className={`text-[10px] sm:text-[11px] font-semibold ${isDesign2026 ? 'text-[#8E939D]' : 'text-amber-200'}`}>
              Прогноз погоды и влияние осадков на урожай
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            closeModal();
          }}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-transform active:scale-90 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        <div className="max-w-2xl mx-auto flex flex-col gap-4 pb-10">

          {/* 1. Current Weather Hero Card */}
          <div className={`p-4 sm:p-5 rounded-3xl border shadow-2xl relative overflow-hidden flex flex-col gap-3.5 ${
            isRainy
              ? 'bg-gradient-to-br from-[#0C2A3D] via-[#103B56] to-[#0A1F2D] border-sky-400/50 shadow-sky-950/50'
              : 'bg-gradient-to-br from-[#3D2C0C] via-[#4D360F] to-[#251B06] border-amber-400/50 shadow-amber-950/50'
          }`}>
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/25 flex items-center justify-center text-4xl sm:text-5xl shadow-inner border border-white/10">
                  {event.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-sky-300">
                    Текущая обстановка
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black leading-tight text-white">
                    {event.name}
                  </h2>
                  <span className="text-xs text-white/80 mt-0.5">
                    {event.description}
                  </span>
                </div>
              </div>

              {/* Temperature Badge */}
              <div className="flex flex-col items-end">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
                  +22°C
                </span>
                <span className="text-[10px] text-white/70 font-bold">
                  {isRainy ? 'Осадки 85%' : 'Ясно 10%'}
                </span>
              </div>
            </div>

            {/* Weather Crop Growth Bonus Banner */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400 shrink-0" />
                <span className="font-bold text-white">
                  Эффект на ферме: <span className="text-emerald-400 font-extrabold">{event.bonusEffect || 'Стабильный рост'}</span>
                </span>
              </div>

              {/* Next weather countdown */}
              <div className="flex items-center gap-1 font-mono text-[11px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-400/30 shrink-0">
                <Clock size={12} />
                <span>Смена через {timeFormatted}</span>
              </div>
            </div>

          </div>

          {/* 2. Hourly Weather Forecast Timeline */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black text-[#8E939D] uppercase tracking-wider px-1">
              Почасовой прогноз (на 24 часа):
            </span>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
              {hourlyForecast.map((h, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center gap-1.5 min-w-[85px] sm:min-w-[95px] shrink-0 snap-start transition-all ${
                    h.isCurrent
                      ? 'bg-gradient-to-b from-sky-950 to-[#122E42] border-sky-400 shadow-lg text-white'
                      : isDesign2026
                      ? 'bg-[#181C24] border-[#242A35] text-white'
                      : 'hud-parchment border-amber-800 text-[#3B1F0D]'
                  }`}
                >
                  <span className="text-[11px] font-black text-[#8E939D]">
                    {h.timeLabel}
                  </span>

                  <span className="text-2xl my-0.5">
                    {h.icon}
                  </span>

                  <span className="text-xs font-black text-white">
                    +{h.tempCelsius}°
                  </span>

                  <span className="text-[10px] font-bold text-sky-400 flex items-center gap-0.5">
                    <Droplets size={10} /> {h.precipChancePercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. 3-Day Valley Weather Forecast Cards */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black text-[#8E939D] uppercase tracking-wider px-1">
              Прогноз на 3 дня:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Day 1: Сегодня */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDesign2026 ? 'bg-[#181C24] border-[#242A35]' : 'hud-parchment'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{event.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-xs text-white">Сегодня</span>
                    <span className="text-[10px] text-[#8E939D]">{event.name.split(' ')[0]}</span>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-black text-xs text-white">+22° / +16°</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Оптимально</span>
                </div>
              </div>

              {/* Day 2: Завтра */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDesign2026 ? 'bg-[#181C24] border-[#242A35]' : 'hud-parchment'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🌧️</span>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-xs text-white">Завтра</span>
                    <span className="text-[10px] text-sky-400">Грибной дождь</span>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-black text-xs text-white">+19° / +14°</span>
                  <span className="text-[10px] text-sky-400 font-bold">+50% урожай</span>
                </div>
              </div>

              {/* Day 3: Послезавтра */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDesign2026 ? 'bg-[#181C24] border-[#242A35]' : 'hud-parchment'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🌈</span>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-xs text-white">Послезавтра</span>
                    <span className="text-[10px] text-pink-400">Радужное сияние</span>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-black text-xs text-white">+24° / +17°</span>
                  <span className="text-[10px] text-amber-300 font-bold">Двойной XP</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

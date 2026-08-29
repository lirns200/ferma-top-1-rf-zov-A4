import React from 'react';
import { useGameStore } from '../../game/gameState';
import { GAME_EVENTS, SEASONS_INFO, getRealCalendarMonthName, getCurrentRealSeason } from '../../config/events';
import { SeasonType } from '../../types';
import { X, Calendar, CloudSun, Clock, Sparkles, Wind, Check } from 'lucide-react';

export const EventsModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    activeSeason,
    activeEvent,
    eventEndsAt,
    setSeason,
    setWeather,
    syncWithRealCalendar,
  } = useGameStore();

  if (activeModal !== 'events') return null;

  const currentSeason = SEASONS_INFO[activeSeason];
  const realSeason = getCurrentRealSeason();
  const realMonth = getRealCalendarMonthName();
  const isRealSynced = activeSeason === realSeason;

  const timeLeftSec = Math.max(0, Math.floor((eventEndsAt - Date.now()) / 1000));
  const timeMin = Math.floor(timeLeftSec / 60);
  const timeSec = timeLeftSec % 60;

  const seasonList: SeasonType[] = ['spring', 'summer', 'autumn', 'winter'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-['Fredoka',sans-serif]">
      <div
        className="relative w-full max-w-xl bg-gradient-to-b from-amber-900 to-amber-950 rounded-3xl border-4 border-amber-500 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-950/90 border-b-2 border-amber-700/60">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentSeason.icon}</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Сезоны и Погода</h2>
              <p className="text-xs text-amber-300">
                Календарь: <b>{realMonth}</b> • Нажмите на сезон или погоду для переключения!
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex flex-col gap-5 text-white custom-scroll">
          
          {/* ── 1. ВРЕМЕНА ГОДА (СИНХРОНИЗАЦИЯ С КАЛЕНДАРЕМ) ── */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} /> Времена года (Сезоны долины)
              </span>
              <button
                onClick={syncWithRealCalendar}
                className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all flex items-center gap-1 ${
                  isRealSynced
                    ? 'bg-emerald-800/60 border-emerald-500 text-emerald-300'
                    : 'bg-amber-800 hover:bg-amber-700 border-amber-500 text-amber-200 shadow'
                }`}
              >
                {isRealSynced ? '✓ По календарю' : '🔄 Синхронизировать'}
              </button>
            </div>

            {/* Season Selector Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {seasonList.map(sKey => {
                const s = SEASONS_INFO[sKey];
                const isActive = activeSeason === sKey;
                const isReal = realSeason === sKey;
                return (
                  <button
                    key={sKey}
                    onClick={() => setSeason(sKey)}
                    className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all text-center relative ${
                      isActive
                        ? 'bg-amber-800/90 border-yellow-400 shadow-lg scale-[1.02]'
                        : 'bg-amber-950/60 border-amber-800/70 hover:bg-amber-900/40 hover:border-amber-600'
                    }`}
                  >
                    {isReal && (
                      <span className="absolute top-1.5 right-1.5 text-[9px] bg-emerald-600/90 text-white font-bold px-1.5 py-0.2 rounded-md">
                        Сейчас
                      </span>
                    )}
                    <span className="text-3xl mb-1">{s.icon}</span>
                    <span className="text-sm font-bold text-white">{s.name}</span>
                    {isActive && (
                      <span className="text-[10px] text-yellow-300 font-bold mt-0.5 flex items-center gap-0.5">
                        <Check size={11} /> Активен
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 2. ТЕКУЩАЯ ПОГОДА ── */}
          {activeEvent && (
            <div className="flex flex-col gap-2 bg-gradient-to-r from-amber-950 to-amber-900/90 p-4 rounded-2xl border-2 border-yellow-400/80 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{activeEvent.icon}</span>
                  <div>
                    <span className="text-[10px] text-yellow-400 uppercase font-bold">Текущая погода</span>
                    <h4 className="text-lg font-black text-white">{activeEvent.name}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-950 px-3 py-1 rounded-xl text-xs font-black text-amber-300 border border-amber-700">
                  <Clock size={12} />
                  <span>{timeMin}:{timeSec < 10 ? `0${timeSec}` : timeSec}</span>
                </div>
              </div>
              <p className="text-xs text-amber-200 mt-1">{activeEvent.description}</p>
              <div className="flex items-center gap-2 mt-1 bg-yellow-400/20 p-2 rounded-xl border border-yellow-400/40 text-yellow-200 text-xs font-bold">
                <Sparkles size={14} />
                <span>Эффект: {activeEvent.bonusEffect}</span>
              </div>
            </div>
          )}

          {/* ── 3. ВЫБОР ПОГОДНЫХ ЯВЛЕНИЙ ── */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CloudSun size={14} /> Выбрать погоду (нажмите для включения):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(GAME_EVENTS).map(evt => {
                const isCurrent = activeEvent?.id === evt.id;
                return (
                  <button
                    key={evt.id}
                    onClick={() => setWeather(evt.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all ${
                      isCurrent
                        ? 'bg-amber-800/90 border-yellow-400 shadow-md scale-[1.01]'
                        : 'bg-amber-950/60 border-amber-800 hover:bg-amber-900/50 hover:border-amber-600'
                    }`}
                  >
                    <span className="text-3xl">{evt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-sm text-white truncate">{evt.name}</h5>
                        {isCurrent && (
                          <span className="text-[10px] bg-yellow-400 text-amber-950 font-black px-1.5 py-0.5 rounded">
                            АКТИВНО
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-amber-300/90 line-clamp-1">{evt.bonusEffect}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

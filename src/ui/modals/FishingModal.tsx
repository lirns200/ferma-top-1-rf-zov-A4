import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../game/gameState';
import { FISH_SPECIES, LURES, LureConfig, FishSpecies } from '../../config/fishing';
import { X, Play, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

type FishingState = 'idle' | 'waiting_bite' | 'reeling' | 'caught';

export const FishingModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    coins,
    gems,
    fishingStats,
    onCatchFish,
    addCoins,
    addGems,
  } = useGameStore();

  const [selectedLureId, setSelectedLureId] = useState<string>('worm_lure');
  const [fishingState, setFishingState] = useState<FishingState>('idle');
  const [tensionProgress, setTensionProgress] = useState<number>(0);
  const [tensionValue, setTensionValue] = useState<number>(50);
  const [caughtFish, setCaughtFish] = useState<{ species: FishSpecies; weight: number } | null>(null);

  const biteTimerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  if (activeModal !== 'fishing') return null;

  const currentLure = LURES[selectedLureId] || LURES.worm_lure;

  // Start Casting
  const handleCastLine = () => {
    if (coins < currentLure.costCoins || gems < currentLure.costGems) return;

    if (currentLure.costCoins > 0) addCoins(-currentLure.costCoins);
    if (currentLure.costGems > 0) addGems(-currentLure.costGems);

    setFishingState('waiting_bite');
    setTensionProgress(0);
    setTensionValue(50);
    setCaughtFish(null);

    // Random bite time between 2.0 to 4.5 seconds
    const biteDelay = (2000 + Math.random() * 2500) / currentLure.luckBonus;
    biteTimerRef.current = window.setTimeout(() => {
      setFishingState('reeling');
    }, biteDelay);
  };

  // Reeling Mini-game Loop
  useEffect(() => {
    if (fishingState !== 'reeling') return;

    let targetSweetSpot = 50;
    let sweetSpotVel = 1.5;
    let progress = 0;

    const interval = window.setInterval(() => {
      // Sweet spot moves back and forth
      targetSweetSpot += sweetSpotVel;
      if (targetSweetSpot > 80 || targetSweetSpot < 20) {
        sweetSpotVel = -sweetSpotVel;
      }

      setTensionValue(prev => {
        // Natural tension decay toward 0
        const updated = Math.max(0, prev - 1.2);
        const inSweetZone = Math.abs(updated - targetSweetSpot) < 22;

        if (inSweetZone) {
          progress = Math.min(100, progress + 3.5);
        } else {
          progress = Math.max(0, progress - 1.5);
        }
        setTensionProgress(progress);

        if (progress >= 100) {
          // Successfully landed the fish!
          clearInterval(interval);
          finishCatch();
        }
        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [fishingState]);

  const finishCatch = () => {
    const speciesList = Object.values(FISH_SPECIES);
    // Weigh species based on lure luck
    const pool: FishSpecies[] = [];
    speciesList.forEach(f => {
      const weightBonus = f.rarity === 'legendary' ? currentLure.luckBonus * 2 : f.rarity === 'epic' ? currentLure.luckBonus * 3 : 5;
      for (let i = 0; i < weightBonus; i++) {
        pool.push(f);
      }
    });

    const chosen = pool[Math.floor(Math.random() * pool.length)] || speciesList[0];
    const weight = chosen.weightMin + Math.random() * (chosen.weightMax - chosen.weightMin);

    setCaughtFish({ species: chosen, weight });
    setFishingState('caught');
    onCatchFish(chosen.id, weight);
    confetti({ particleCount: 60, spread: 50 });
  };

  const handlePullReel = () => {
    if (fishingState === 'reeling') {
      setTensionValue(prev => Math.min(100, prev + 12));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-['Fredoka',sans-serif]">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-sky-900 to-slate-950 rounded-3xl border-4 border-cyan-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b-2 border-cyan-700/60">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎣</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Рыбалка на озере</h2>
              <p className="text-xs text-cyan-200">Ловите редкую рыбу, устанавливайте рекорды веса и получайте опыт</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mini-Game Stage */}
        <div className="p-6 flex flex-col items-center justify-center flex-1 bg-gradient-to-b from-sky-950/50 to-slate-950/90 text-white">
          {fishingState === 'idle' && (
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
              {/* Lure Selector */}
              <div className="flex flex-col gap-2 w-full">
                <span className="text-xs text-cyan-300 font-bold text-center">Выберите наживку:</span>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(LURES).map(lure => {
                    const isSelected = selectedLureId === lure.id;
                    const canAfford = coins >= lure.costCoins && gems >= lure.costGems;

                    return (
                      <button
                        key={lure.id}
                        onClick={() => setSelectedLureId(lure.id)}
                        className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'bg-cyan-600/80 border-cyan-300 shadow-lg scale-105'
                            : 'bg-slate-900/80 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-3xl mb-1">{lure.icon}</span>
                        <span className="text-xs font-bold truncate w-full text-center">{lure.name}</span>
                        <div className="flex items-center gap-1 mt-1 text-[11px] font-black text-amber-300">
                          {lure.costCoins > 0 && <span>{lure.costCoins} 💰</span>}
                          {lure.costGems > 0 && <span>{lure.costGems} 💎</span>}
                          {lure.costCoins === 0 && lure.costGems === 0 && <span className="text-emerald-400">Бесплатно</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cast Button */}
              <button
                onClick={handleCastLine}
                className="w-full py-4 bg-gradient-to-b from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-black text-lg rounded-2xl border-2 border-white shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Забросить удочку!</span>
                <Play size={20} />
              </button>
            </div>
          )}

          {fishingState === 'waiting_bite' && (
            <div className="flex flex-col items-center gap-4 py-8 animate-pulse">
              <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-4 border-cyan-400 flex items-center justify-center text-4xl animate-bounce">
                🎣
              </div>
              <span className="text-lg font-black text-cyan-200">Поплавок в воде... Ждём поклёвку...</span>
            </div>
          )}

          {fishingState === 'reeling' && (
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
              <div className="flex items-center gap-2 text-xl font-black text-amber-300 animate-bounce">
                <span>⚡</span>
                <span>КЛЮЁТ! ЖМИТЕ НА КНОПКУ, ЧТОБЫ ВЫТЯНУТЬ!</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-cyan-200">
                  <span>Вываживание</span>
                  <span>{Math.round(tensionProgress)}%</span>
                </div>
                <div className="w-full bg-slate-900 h-6 rounded-full overflow-hidden border-2 border-cyan-400 p-1">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-100"
                    style={{ width: `${tensionProgress}%` }}
                  />
                </div>
              </div>

              {/* Tap Button */}
              <button
                onClick={handlePullReel}
                className="w-32 h-32 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border-4 border-white shadow-2xl flex flex-col items-center justify-center text-amber-950 font-black text-lg active:scale-90 transition-transform"
              >
                <span className="text-3xl">🎣</span>
                <span>ТЯНУТЬ!</span>
              </button>
            </div>
          )}

          {fishingState === 'caught' && caughtFish && (
            <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600 border-4 border-white shadow-2xl flex items-center justify-center text-5xl">
                {caughtFish.species.icon}
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                  {caughtFish.species.rarity}
                </span>
                <h3 className="text-2xl font-black text-white">{caughtFish.species.name}</h3>
                <span className="text-base text-amber-300 font-bold">Вес: {caughtFish.weight.toFixed(2)} кг</span>
              </div>

              <div className="flex items-center gap-4 bg-slate-900/80 px-6 py-2 rounded-2xl border border-cyan-500/50">
                <span className="text-xs font-bold text-emerald-400">+{caughtFish.species.xpGain} XP</span>
                <span className="text-xs font-bold text-amber-300">Цена: {caughtFish.species.sellPrice} 💰</span>
              </div>

              <button
                onClick={() => setFishingState('idle')}
                className="px-8 py-3 bg-gradient-to-b from-emerald-400 to-emerald-600 text-emerald-950 font-black text-sm rounded-2xl shadow-lg active:scale-95 transition-transform"
              >
                Ловить ещё!
              </button>
            </div>
          )}
        </div>

        {/* Fish Trophy Collection Log */}
        <div className="p-4 bg-slate-950 border-t-2 border-cyan-700/60 overflow-x-auto flex items-center gap-3">
          <span className="text-xs font-bold text-cyan-300 flex items-center gap-1 whitespace-nowrap">
            <Trophy size={14} />
            <span>Альбом улова:</span>
          </span>
          {Object.values(FISH_SPECIES).map(fish => {
            const best = fishingStats.biggestCatch[fish.id];

            return (
              <div
                key={fish.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border whitespace-nowrap text-xs ${
                  best
                    ? 'bg-slate-900 border-cyan-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <span>{fish.icon}</span>
                <span className="font-bold">{fish.name}</span>
                {best ? (
                  <span className="text-amber-300 font-bold">({best.toFixed(1)} кг)</span>
                ) : (
                  <span className="text-slate-600">Не поймана</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

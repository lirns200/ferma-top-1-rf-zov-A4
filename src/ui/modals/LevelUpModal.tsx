import React from 'react';
import { useGameStore } from '../../game/gameState';
import { CROPS } from '../../config/crops';
import { BUILDINGS } from '../../config/buildings';
import { ANIMALS } from '../../config/animals';
import { RECIPES } from '../../config/recipes';
import { DECORATIONS } from '../../config/decorations';
import { X, Sparkles, Trophy } from 'lucide-react';

export const LevelUpModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    level,
    unlockedLevelInfo,
  } = useGameStore();

  if (activeModal !== 'levelup' || !unlockedLevelInfo) return null;

  const { unlocks, coinReward, gemReward } = unlockedLevelInfo;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 font-['Fredoka',sans-serif]">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-900 via-amber-950 to-slate-950 rounded-3xl border-4 border-yellow-400 shadow-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        {/* Glow effect & Ribbon */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 border-4 border-white shadow-2xl flex items-center justify-center text-5xl text-amber-950 font-black mb-2 animate-bounce">
          {level}
        </div>

        <div className="flex items-center gap-2 text-yellow-300 text-sm font-bold uppercase tracking-widest">
          <Sparkles size={16} />
          <span>НОВЫЙ УРОВЕНЬ!</span>
          <Sparkles size={16} />
        </div>

        <h2 className="text-3xl font-black text-white mt-1 mb-3">Поздравляем!</h2>

        {/* Level Rewards */}
        <div className="flex items-center gap-4 bg-amber-950/80 px-6 py-2.5 rounded-2xl border border-amber-600/60 mb-5">
          <div className="flex items-center gap-1 text-base font-black text-amber-300">
            <span>💰</span>
            <span>+{coinReward.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-base font-black text-cyan-300">
            <span>💎</span>
            <span>+{gemReward}</span>
          </div>
        </div>

        {/* Unlocks List */}
        <div className="w-full bg-amber-900/40 rounded-2xl border border-amber-700/60 p-4 mb-6 text-left flex flex-col gap-3">
          <span className="text-xs text-amber-300 font-bold uppercase tracking-wide">
            Открыто на этом уровне:
          </span>

          <div className="grid grid-cols-2 gap-2">
            {unlocks.crops.map(cId => {
              const crop = CROPS[cId];
              return (
                <div key={cId} className="flex items-center gap-2 bg-amber-950/70 p-2 rounded-xl border border-amber-800 text-xs text-white">
                  <span className="text-xl">{crop?.icon || '🌱'}</span>
                  <span className="font-bold truncate">{crop?.name || cId}</span>
                </div>
              );
            })}

            {unlocks.buildings.map(bId => {
              const b = BUILDINGS[bId];
              return (
                <div key={bId} className="flex items-center gap-2 bg-amber-950/70 p-2 rounded-xl border border-amber-800 text-xs text-white">
                  <span className="text-xl">{b?.icon || '🚜'}</span>
                  <span className="font-bold truncate">{b?.name || bId}</span>
                </div>
              );
            })}

            {unlocks.animals.map(aId => {
              const anim = ANIMALS[aId];
              return (
                <div key={aId} className="flex items-center gap-2 bg-amber-950/70 p-2 rounded-xl border border-amber-800 text-xs text-white">
                  <span className="text-xl">{anim?.icon || '🐄'}</span>
                  <span className="font-bold truncate">{anim?.name || aId}</span>
                </div>
              );
            })}

            {unlocks.recipes.map(rId => {
              const rec = RECIPES[rId];
              return (
                <div key={rId} className="flex items-center gap-2 bg-amber-950/70 p-2 rounded-xl border border-amber-800 text-xs text-white">
                  <span className="text-xl">🧑‍🍳</span>
                  <span className="font-bold truncate">{rec?.name || rId}</span>
                </div>
              );
            })}

            {unlocks.features.map((feat, idx) => (
              <div key={idx} className="col-span-2 flex items-center gap-2 bg-amber-950/70 p-2 rounded-xl border border-amber-800 text-xs text-amber-200">
                <span className="text-lg">✨</span>
                <span className="font-bold">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Claim Button */}
        <button
          onClick={closeModal}
          className="w-full py-4 bg-gradient-to-b from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-amber-950 font-black text-lg rounded-2xl border-2 border-white shadow-xl active:scale-95 transition-transform"
        >
          УРА! ПРОДОЛЖИТЬ
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { useGameStore } from '../../game/gameState';
import { X, Volume2, VolumeX, Save, RotateCcw, Award, Info, Heart } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    soundMuted,
    setSoundMuted,
    saveCurrentState,
    resetGame,
    level,
    coins,
    gems,
    fishingStats,
    entities,
  } = useGameStore();

  if (activeModal !== 'settings') return null;

  const fieldsCount = entities.filter(e => e.type === 'field').length;
  const buildingsCount = entities.filter(e => e.type === 'production' || e.type === 'animal_pen').length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-['Fredoka',sans-serif]">
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-900 to-amber-950 rounded-3xl border-4 border-amber-500 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-950/80 border-b-2 border-amber-700/60">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏡</span>
            <div>
              <h2 className="text-xl font-black text-white">Усадьба и Настройки</h2>
              <p className="text-xs text-amber-300">Статистика фермы и управление</p>
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
        <div className="p-6 overflow-y-auto flex flex-col gap-4 text-white">
          {/* Farm Stats Summary */}
          <div className="bg-amber-950/70 p-4 rounded-2xl border border-amber-800 flex flex-col gap-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">Достижения фермы:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-amber-900/60 p-2 rounded-xl">
                <span className="text-amber-400">Уровень:</span> <span className="font-bold">{level}</span>
              </div>
              <div className="bg-amber-900/60 p-2 rounded-xl">
                <span className="text-amber-400">Полей:</span> <span className="font-bold">{fieldsCount} шт</span>
              </div>
              <div className="bg-amber-900/60 p-2 rounded-xl">
                <span className="text-amber-400">Заводов и загонов:</span> <span className="font-bold">{buildingsCount} шт</span>
              </div>
              <div className="bg-amber-900/60 p-2 rounded-xl">
                <span className="text-amber-400">Рыбы выловлено:</span> <span className="font-bold">{fishingStats.fishCaughtCount} шт</span>
              </div>
            </div>
          </div>

          {/* Sound Setting */}
          <div className="flex items-center justify-between bg-amber-950/70 p-4 rounded-2xl border border-amber-800">
            <div className="flex items-center gap-2">
              {soundMuted ? <VolumeX className="text-red-400" /> : <Volume2 className="text-emerald-400" />}
              <span className="text-sm font-bold">Звуковые эффекты и музыка</span>
            </div>
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                soundMuted 
                  ? 'bg-amber-800 text-amber-300' 
                  : 'bg-emerald-500 text-emerald-950 shadow-md'
              }`}
            >
              {soundMuted ? 'ВЫКЛ' : 'ВКЛ'}
            </button>
          </div>

          {/* Save Action */}
          <button
            onClick={() => {
              saveCurrentState();
              closeModal();
            }}
            className="w-full py-3 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-emerald-950 font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Save size={18} />
            <span>Сохранить игру в памяти</span>
          </button>

          {/* Reset Action */}
          <button
            onClick={() => {
              if (window.confirm('Вы уверены, что хотите начать заново? Весь прогресс будет сброшен!')) {
                resetGame();
              }
            }}
            className="w-full py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors mt-2"
          >
            <RotateCcw size={16} />
            <span>Сбросить ферму и начать сначала</span>
          </button>
        </div>
      </div>
    </div>
  );
};

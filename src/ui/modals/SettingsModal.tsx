import React from 'react';
import { useGameStore } from '../../game/gameState';
import { sounds } from '../../audio/SoundManager';
import { ArrowLeft, Volume2, VolumeX, Save, RotateCcw, Award, Info, Heart } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    soundMuted,
    setSoundMuted,
    saveCurrentState,
    resetGame,
    level,
    fishingStats,
    entities,
  } = useGameStore();

  if (activeModal !== 'settings') return null;

  const fieldsCount = entities.filter(e => e.type === 'field').length;
  const buildingsCount = entities.filter(e => e.type === 'production' || e.type === 'animal_pen').length;

  return (
    <div className="fixed inset-0 pt-14 sm:pt-16 pb-20 sm:pb-24 z-40 flex flex-col bg-[#2A1406] select-none animate-pop-in text-[#3B1F0D] overflow-hidden">
      
      {/* ── SETTINGS & STATS BODY ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4 pb-12">
          
          {/* Farm Stats Card */}
          <div className="hud-parchment p-4 sm:p-5 rounded-2xl border-2 border-amber-600 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Award size={18} className="text-amber-800" />
              <h2 className="text-xs sm:text-sm font-extrabold text-[#3B1F0D] uppercase tracking-wide">
                Достижения и Статистика:
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-amber-100/90 p-3 rounded-xl border border-amber-300 flex flex-col">
                <span className="text-[10px] text-[#78350F] font-bold">Уровень</span>
                <span className="text-base sm:text-lg font-black text-[#3B1F0D]">{level}</span>
              </div>
              <div className="bg-amber-100/90 p-3 rounded-xl border border-amber-300 flex flex-col">
                <span className="text-[10px] text-[#78350F] font-bold">Полей</span>
                <span className="text-base sm:text-lg font-black text-[#3B1F0D]">{fieldsCount} шт</span>
              </div>
              <div className="bg-amber-100/90 p-3 rounded-xl border border-amber-300 flex flex-col">
                <span className="text-[10px] text-[#78350F] font-bold">Заводов и загонов</span>
                <span className="text-base sm:text-lg font-black text-[#3B1F0D]">{buildingsCount} шт</span>
              </div>
              <div className="bg-amber-100/90 p-3 rounded-xl border border-amber-300 flex flex-col">
                <span className="text-[10px] text-[#78350F] font-bold">Рыбы выловлено</span>
                <span className="text-base sm:text-lg font-black text-[#3B1F0D]">{fishingStats.fishCaughtCount} шт</span>
              </div>
            </div>
          </div>

          {/* Sound Setting Card */}
          <div className="hud-parchment p-4 sm:p-5 rounded-2xl border-2 border-amber-600 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200/90 border border-amber-700 flex items-center justify-center text-xl">
                {soundMuted ? <VolumeX className="text-red-700" /> : <Volume2 className="text-green-700" />}
              </div>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-[#3B1F0D]">
                  Звуковые эффекты и музыка
                </h3>
                <p className="text-[11px] text-[#78350F]">
                  Акустическая музыка фермы и звуки действий
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setSoundMuted(!soundMuted);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black shadow transition-transform active:scale-95 cursor-pointer ${
                soundMuted
                  ? 'bg-amber-900 text-amber-200 border border-amber-700'
                  : 'bg-green-600 text-white border border-green-300'
              }`}
            >
              {soundMuted ? 'ВЫКЛ' : 'ВКЛ'}
            </button>
          </div>

          {/* Save Game Button */}
          <button
            onClick={() => {
              sounds.playClick();
              saveCurrentState();
              closeModal();
            }}
            className="w-full py-3.5 bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 border-2 border-green-200 text-white font-extrabold text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
          >
            <Save size={18} />
            <span>Сохранить игру в памяти</span>
          </button>

          {/* Replay Tutorial Action */}
          <button
            onClick={() => {
              sounds.playClick();
              useGameStore.getState().restartTutorial();
              closeModal();
            }}
            className="w-full py-3.5 bg-gradient-to-b from-amber-700 to-amber-900 border-2 border-amber-400 text-yellow-200 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
          >
            <span className="text-lg">👨‍🌾</span>
            <span>Посмотреть историю и пройти обучение заново</span>
          </button>

          {/* Reset Farm Action */}
          <button
            onClick={() => {
              if (window.confirm('Вы уверены, что хотите начать заново? Весь прогресс будет сброшен!')) {
                resetGame();
                closeModal();
              }
            }}
            className="w-full py-3 bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors mt-2 cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Сбросить ферму и начать сначала</span>
          </button>

        </div>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { sounds } from '../../audio/SoundManager';
import { getTelegramUserProfile, triggerTelegramHaptic } from '../../utils/telegram';
import {
  User, Mail, Calendar, Key, Check, Copy, Volume2, VolumeX,
  Vibrate, Save, RotateCcw, Award, ExternalLink
} from 'lucide-react';

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

  const [copiedId, setCopiedId] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (activeModal !== 'settings') return null;

  const profile = getTelegramUserProfile();
  const fieldsCount = entities.filter(e => e.type === 'field').length;
  const buildingsCount = entities.filter(e => e.type === 'production' || e.type === 'animal_pen').length;

  const handleCopyId = () => {
    sounds.playClick();
    triggerTelegramHaptic('light');
    navigator.clipboard?.writeText(profile.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSave = () => {
    sounds.playClick();
    triggerTelegramHaptic('success');
    saveCurrentState();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 pt-14 sm:pt-16 pb-20 sm:pb-24 z-40 flex flex-col game-screen-bg text-amber-100 select-none animate-pop-in overflow-hidden font-sans">
      
      {/* ── SCROLLABLE TELEGRAM PROFILE CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="max-w-md mx-auto flex flex-col items-center gap-5 pb-10">

          {/* ── 1. AVATAR WITH ONLINE BADGE ── */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-amber-400 shadow-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center">
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-4xl">👨‍🌾</span>
                )}
              </div>
              {/* Green Online Dot */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#22C55E] border-2 border-black rounded-full shadow" />
            </div>

            {/* Display Name */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-yellow-300 game-text-gold">
              {profile.name}
            </h1>

            {/* Username / Handle */}
            <span className="text-sm font-bold text-amber-200/80">
              {profile.username}
            </span>

            {/* Connected Telegram Pill */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300/80 mt-0.5">
              <span className="text-blue-400">✈️</span>
              <span>Аккаунт Telegram</span>
              <span className="text-amber-600">•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Подключено
              </span>
            </div>
          </div>

          {/* ── 2. SECTION: АККАУНТ ── */}
          <div className="w-full flex flex-col gap-1.5">
            <span className="text-[11px] font-black text-yellow-300 uppercase tracking-wider px-2 game-text-gold">
              Аккаунт
            </span>

            <div className="w-full game-card border border-amber-700/60 rounded-2xl overflow-hidden shadow-lg flex flex-col">
              
              {/* Row 1: Имя */}
              <div className="flex items-center gap-3.5 p-3.5 border-b border-amber-900/40">
                <div className="w-9 h-9 rounded-xl bg-black/40 border border-amber-700/50 flex items-center justify-center text-amber-300">
                  <User size={18} />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-xs text-amber-300/70">Имя</span>
                  <span className="text-sm font-bold text-amber-100">{profile.name}</span>
                </div>
              </div>

              {/* Row 2: Почта */}
              <div className="flex items-center justify-between p-3.5 border-b border-amber-900/40">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-black/40 border border-amber-700/50 flex items-center justify-center text-amber-300">
                    <Mail size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-amber-300/70">Почта</span>
                    <span className="text-sm font-medium text-amber-300/50">Не подключена</span>
                  </div>
                </div>
                <span className="text-xs text-amber-300/50 pr-2">Нет</span>
              </div>

              {/* Row 3: С нами с */}
              <div className="flex items-center gap-3.5 p-3.5 border-b border-amber-900/40">
                <div className="w-9 h-9 rounded-xl bg-black/40 border border-amber-700/50 flex items-center justify-center text-amber-300">
                  <Calendar size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-amber-300/70">С нами с</span>
                  <span className="text-sm font-bold text-amber-100">{profile.joinedDate}</span>
                </div>
              </div>

              {/* Row 4: Telegram ID */}
              <div 
                onClick={handleCopyId}
                className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-black/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-black/40 border border-amber-700/50 flex items-center justify-center text-amber-300">
                    <Key size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-amber-300/70">Telegram ID</span>
                    <span className="text-sm font-mono font-bold text-amber-200">{profile.id}</span>
                  </div>
                </div>
                <button className="text-xs text-amber-200 flex items-center gap-1 hover:text-white px-2.5 py-1 bg-black/40 border border-amber-700/60 rounded-lg cursor-pointer">
                  {copiedId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedId ? 'Скопировано' : 'Копировать'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* ── 3. SECTION: ФЕРМА И ДОСТИЖЕНИЯ ── */}
          <div className="w-full flex flex-col gap-1.5">
            <span className="text-[11px] font-black text-yellow-300 uppercase tracking-wider px-2 game-text-gold">
              Ферма и Достижения
            </span>

            <div className="w-full game-card border border-amber-700/60 rounded-2xl p-4 shadow-lg grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="game-badge-wood p-2.5 rounded-xl border border-amber-600/60 flex flex-col">
                <span className="text-[10px] text-amber-300/80 font-bold">Уровень</span>
                <span className="text-base font-black text-yellow-300 game-text-gold">⭐ {level}</span>
              </div>
              <div className="game-badge-wood p-2.5 rounded-xl border border-amber-600/60 flex flex-col">
                <span className="text-[10px] text-amber-300/80 font-bold">Грядок</span>
                <span className="text-base font-black text-emerald-300 game-text-shadow">🌾 {fieldsCount}</span>
              </div>
              <div className="game-badge-wood p-2.5 rounded-xl border border-amber-600/60 flex flex-col">
                <span className="text-[10px] text-amber-300/80 font-bold">Заводов</span>
                <span className="text-base font-black text-amber-300 game-text-shadow">🏭 {buildingsCount}</span>
              </div>
              <div className="game-badge-wood p-2.5 rounded-xl border border-amber-600/60 flex flex-col">
                <span className="text-[10px] text-amber-300/80 font-bold">Вылов рыбы</span>
                <span className="text-base font-black text-sky-300 game-text-shadow">🐟 {fishingStats.fishCaughtCount}</span>
              </div>
            </div>
          </div>

          {/* ── 4. SECTION: НАСТРОЙКИ ── */}
          <div className="w-full flex flex-col gap-1.5">
            <span className="text-[11px] font-black text-yellow-300 uppercase tracking-wider px-2 game-text-gold">
              Настройки игры
            </span>

            <div className="w-full game-card border border-amber-700/60 rounded-2xl overflow-hidden shadow-lg flex flex-col">
              
              {/* Sound Setting */}
              <div className="flex items-center justify-between p-3.5 border-b border-amber-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black/40 border border-amber-700/50 flex items-center justify-center text-amber-400">
                    {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </div>
                  <span className="text-sm font-bold text-amber-100">Звуки и музыка</span>
                </div>
                <button
                  onClick={() => {
                    sounds.playClick();
                    triggerTelegramHaptic('medium');
                    setSoundMuted(!soundMuted);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    soundMuted ? 'bg-black/50 text-amber-500/50 border border-amber-900/50' : 'game-btn-plus text-white'
                  }`}
                >
                  {soundMuted ? 'ВЫКЛ' : 'ВКЛ'}
                </button>
              </div>

              {/* ☁️ Облака на небе и тени */}
              <div className="flex items-center justify-between p-3.5 border-b border-amber-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-900/60 border border-sky-500/40 flex items-center justify-center text-sky-300 text-lg shadow">
                    ☁️
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-amber-100">3D Облака и тени</span>
                    <span className="text-[11px] text-amber-200/60">Плавающие облака в небе и тени на земле</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sounds.playClick();
                    triggerTelegramHaptic('medium');
                    useGameStore.getState().toggleClouds();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    useGameStore.getState().showClouds
                      ? 'game-btn-plus text-white'
                      : 'bg-black/50 text-amber-500/50 border border-amber-900/50'
                  }`}
                >
                  {useGameStore.getState().showClouds ? 'ВКЛ' : 'ВЫКЛ'}
                </button>
              </div>

              {/* Haptic Setting */}
              <div className="flex items-center justify-between p-3.5 border-b border-amber-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black/40 border border-amber-700/50 flex items-center justify-center text-sky-400">
                    <Vibrate size={18} />
                  </div>
                  <span className="text-sm font-bold text-amber-100">Вибрация Telegram</span>
                </div>
                <button
                  onClick={() => {
                    sounds.playClick();
                    triggerTelegramHaptic('heavy');
                    setHapticsEnabled(!hapticsEnabled);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    !hapticsEnabled ? 'bg-black/50 text-amber-500/50 border border-amber-900/50' : 'game-btn-plus text-white'
                  }`}
                >
                  {hapticsEnabled ? 'ВКЛ' : 'ВЫКЛ'}
                </button>
              </div>

              {/* Save Game */}
              <div 
                onClick={handleSave}
                className="flex items-center justify-between p-3.5 border-b border-amber-900/40 hover:bg-black/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black/40 border border-amber-700/50 flex items-center justify-center text-emerald-400">
                    <Save size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-amber-100">Сохранить прогресс</span>
                    <span className="text-[11px] text-amber-200/60">Синхронизация с Telegram Cloud</span>
                  </div>
                </div>
                {saveSuccess ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <Check size={14} /> Сохранено
                  </span>
                ) : (
                  <span className="text-xs text-yellow-300 font-bold px-2.5 py-1 game-btn-gold rounded-lg">
                    Сохранить
                  </span>
                )}
              </div>

              {/* Replay Tutorial */}
              <div
                onClick={() => {
                  sounds.playClick();
                  triggerTelegramHaptic('medium');
                  useGameStore.getState().restartTutorial();
                  closeModal();
                }}
                className="flex items-center gap-3 p-3.5 border-b border-amber-900/40 hover:bg-black/30 transition-colors cursor-pointer text-amber-200"
              >
                <div className="w-9 h-9 rounded-xl bg-black/40 border border-amber-700/50 flex items-center justify-center text-lg">
                  👨‍🌾
                </div>
                <span className="text-sm font-bold">Пройти обучение заново</span>
              </div>

              {/* Reset Farm */}
              <div
                onClick={() => {
                  if (window.confirm('Вы уверены, что хотите начать заново? Весь прогресс фермы будет сброшен!')) {
                    triggerTelegramHaptic('error');
                    resetGame();
                    closeModal();
                  }
                }}
                className="flex items-center gap-3 p-3.5 hover:bg-red-950/40 transition-colors cursor-pointer text-rose-400"
              >
                <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center">
                  <RotateCcw size={16} />
                </div>
                <span className="text-sm font-bold">Сбросить ферму и начать сначала</span>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

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
    <div className="fixed inset-0 pt-14 sm:pt-16 pb-20 sm:pb-24 z-40 flex flex-col bg-[#0F1115] text-white select-none animate-pop-in overflow-hidden font-sans">
      
      {/* ── SCROLLABLE TELEGRAM PROFILE CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="max-w-md mx-auto flex flex-col items-center gap-5 pb-10">

          {/* ── 1. AVATAR WITH ONLINE BADGE ── */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#242A35] shadow-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center">
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
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#22C55E] border-3 border-[#0F1115] rounded-full shadow" />
            </div>

            {/* Display Name */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-white">
              {profile.name}
            </h1>

            {/* Username / Handle */}
            <span className="text-sm font-medium text-[#8E939D]">
              {profile.username}
            </span>

            {/* Connected Telegram Pill */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8E939D] mt-0.5">
              <span className="text-blue-400">✈️</span>
              <span>Аккаунт Telegram</span>
              <span className="text-zinc-600">•</span>
              <span className="text-[#22C55E] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block animate-pulse" />
                Подключено
              </span>
            </div>
          </div>

          {/* ── 2. SECTION: АККАУНТ ── */}
          <div className="w-full flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-[#8E939D] uppercase tracking-wider px-2">
              Аккаунт
            </span>

            <div className="w-full bg-[#181C24] border border-[#242A35] rounded-2xl overflow-hidden shadow-lg flex flex-col">
              
              {/* Row 1: Имя */}
              <div className="flex items-center gap-3.5 p-3.5 border-b border-[#242A35]/60">
                <div className="w-9 h-9 rounded-xl bg-[#242A35] flex items-center justify-center text-[#8E939D]">
                  <User size={18} />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-xs text-[#8E939D]">Имя</span>
                  <span className="text-sm font-bold text-white">{profile.name}</span>
                </div>
              </div>

              {/* Row 2: Почта */}
              <div className="flex items-center justify-between p-3.5 border-b border-[#242A35]/60">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#242A35] flex items-center justify-center text-[#8E939D]">
                    <Mail size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#8E939D]">Почта</span>
                    <span className="text-sm font-medium text-[#8E939D]">Не подключена</span>
                  </div>
                </div>
                <span className="text-xs text-[#8E939D] pr-2">Нет</span>
              </div>

              {/* Row 3: С нами с */}
              <div className="flex items-center gap-3.5 p-3.5 border-b border-[#242A35]/60">
                <div className="w-9 h-9 rounded-xl bg-[#242A35] flex items-center justify-center text-[#8E939D]">
                  <Calendar size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#8E939D]">С нами с</span>
                  <span className="text-sm font-medium text-white">{profile.joinedDate}</span>
                </div>
              </div>

              {/* Row 4: Telegram ID */}
              <div 
                onClick={handleCopyId}
                className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-[#202530] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#242A35] flex items-center justify-center text-[#8E939D]">
                    <Key size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#8E939D]">Telegram ID</span>
                    <span className="text-sm font-mono font-bold text-white">{profile.id}</span>
                  </div>
                </div>
                <button className="text-xs text-[#8E939D] flex items-center gap-1 hover:text-white px-2 py-1 bg-[#242A35] rounded-lg">
                  {copiedId ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  <span>{copiedId ? 'Скопировано' : 'Копировать'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* ── 3. SECTION: ВХОД ПО ПОЧТЕ ── */}
          <div className="w-full flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-[#8E939D] uppercase tracking-wider px-2">
              Вход по почте
            </span>

            <div className="w-full bg-[#181C24] border border-[#242A35] rounded-2xl p-3.5 shadow-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#242A35] flex items-center justify-center text-[#8E939D] shrink-0">
                  <Mail size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white leading-tight">Почта не подключена</span>
                  <span className="text-xs text-[#8E939D] truncate">Входите без Telegram по коду из пись...</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  triggerTelegramHaptic('light');
                  alert('Функция привязки почты будет доступна в следующем обновлении!');
                }}
                className="px-3.5 py-2 rounded-xl bg-[#242A35] hover:bg-[#2E3644] border border-[#353D4C] text-white text-xs font-bold shrink-0 transition-all active:scale-95 cursor-pointer"
              >
                Подключить
              </button>
            </div>
          </div>

          {/* ── 4. SECTION: ФЕРМА И ДОСТИЖЕНИЯ ── */}
          <div className="w-full flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-[#8E939D] uppercase tracking-wider px-2">
              Ферма и Достижения
            </span>

            <div className="w-full bg-[#181C24] border border-[#242A35] rounded-2xl p-4 shadow-lg grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#242A35]/60 p-2.5 rounded-xl border border-[#353D4C]/40 flex flex-col">
                <span className="text-[10px] text-[#8E939D]">Уровень</span>
                <span className="text-base font-black text-yellow-400">⭐ {level}</span>
              </div>
              <div className="bg-[#242A35]/60 p-2.5 rounded-xl border border-[#353D4C]/40 flex flex-col">
                <span className="text-[10px] text-[#8E939D]">Грядок</span>
                <span className="text-base font-black text-green-400">🌾 {fieldsCount}</span>
              </div>
              <div className="bg-[#242A35]/60 p-2.5 rounded-xl border border-[#353D4C]/40 flex flex-col">
                <span className="text-[10px] text-[#8E939D]">Заводов</span>
                <span className="text-base font-black text-amber-400">🏭 {buildingsCount}</span>
              </div>
              <div className="bg-[#242A35]/60 p-2.5 rounded-xl border border-[#353D4C]/40 flex flex-col">
                <span className="text-[10px] text-[#8E939D]">Вылов рыбы</span>
                <span className="text-base font-black text-cyan-400">🐟 {fishingStats.fishCaughtCount}</span>
              </div>
            </div>
          </div>

          {/* ── 5. SECTION: НАСТРОЙКИ ── */}
          <div className="w-full flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-[#8E939D] uppercase tracking-wider px-2">
              Настройки
            </span>

            <div className="w-full bg-[#181C24] border border-[#242A35] rounded-2xl overflow-hidden shadow-lg flex flex-col">
              
              {/* 🔮 Дизайн 2026 (iOS 26 Стекло & Прозрачный фон) */}
              <div className="flex items-center justify-between p-3.5 border-b border-[#242A35]/60 bg-gradient-to-r from-blue-950/30 to-purple-950/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-500/50 flex items-center justify-center text-purple-300 text-lg shadow">
                    🔮
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Дизайн 2026 (iOS Стекло)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500 text-black font-black uppercase">Новинка</span>
                    </span>
                    <span className="text-[11px] text-[#8E939D]">Овальное парящее стекло и прозрачный док</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sounds.playClick();
                    triggerTelegramHaptic('medium');
                    useGameStore.getState().toggleDesign2026();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow ${
                    useGameStore.getState().isDesign2026
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border border-purple-300 shadow-lg scale-105'
                      : 'bg-[#242A35] text-[#8E939D]'
                  }`}
                >
                  {useGameStore.getState().isDesign2026 ? 'ВКЛ' : 'ВЫКЛ'}
                </button>
              </div>

              {/* Sound Setting */}
              <div className="flex items-center justify-between p-3.5 border-b border-[#242A35]/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#242A35] flex items-center justify-center text-amber-400">
                    {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </div>
                  <span className="text-sm font-semibold text-white">Звуки и музыка</span>
                </div>
                <button
                  onClick={() => {
                    sounds.playClick();
                    triggerTelegramHaptic('medium');
                    setSoundMuted(!soundMuted);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    soundMuted ? 'bg-[#242A35] text-[#8E939D]' : 'bg-[#22C55E] text-black shadow'
                  }`}
                >
                  {soundMuted ? 'ВЫКЛ' : 'ВКЛ'}
                </button>
              </div>

              {/* ☁️ Облака на небе и тени */}
              <div className="flex items-center justify-between p-3.5 border-b border-[#242A35]/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-900/60 border border-sky-500/40 flex items-center justify-center text-sky-300 text-lg shadow">
                    ☁️
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">3D Облака и тени</span>
                    <span className="text-[11px] text-[#8E939D]">Плавающие облака в небе и тени на земле</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sounds.playClick();
                    triggerTelegramHaptic('medium');
                    useGameStore.getState().toggleClouds();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow ${
                    useGameStore.getState().showClouds
                      ? 'bg-[#22C55E] text-black shadow'
                      : 'bg-[#242A35] text-[#8E939D]'
                  }`}
                >
                  {useGameStore.getState().showClouds ? 'ВКЛ' : 'ВЫКЛ'}
                </button>
              </div>

              {/* Haptic Setting */}
              <div className="flex items-center justify-between p-3.5 border-b border-[#242A35]/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#242A35] flex items-center justify-center text-blue-400">
                    <Vibrate size={18} />
                  </div>
                  <span className="text-sm font-semibold text-white">Вибрация Telegram</span>
                </div>
                <button
                  onClick={() => {
                    sounds.playClick();
                    triggerTelegramHaptic('heavy');
                    setHapticsEnabled(!hapticsEnabled);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    !hapticsEnabled ? 'bg-[#242A35] text-[#8E939D]' : 'bg-[#22C55E] text-black shadow'
                  }`}
                >
                  {hapticsEnabled ? 'ВКЛ' : 'ВЫКЛ'}
                </button>
              </div>

              {/* Save Game */}
              <div 
                onClick={handleSave}
                className="flex items-center justify-between p-3.5 border-b border-[#242A35]/60 hover:bg-[#202530] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#242A35] flex items-center justify-center text-emerald-400">
                    <Save size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">Сохранить прогресс</span>
                    <span className="text-[11px] text-[#8E939D]">Синхронизация с Telegram Cloud</span>
                  </div>
                </div>
                {saveSuccess ? (
                  <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                    <Check size={14} /> Сохранено
                  </span>
                ) : (
                  <span className="text-xs text-[#8E939D] px-2 py-1 bg-[#242A35] rounded-lg">
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
                className="flex items-center gap-3 p-3.5 border-b border-[#242A35]/60 hover:bg-[#202530] transition-colors cursor-pointer text-amber-200"
              >
                <div className="w-9 h-9 rounded-xl bg-[#242A35] flex items-center justify-center text-lg">
                  👨‍🌾
                </div>
                <span className="text-sm font-semibold">Пройти обучение заново</span>
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
                className="flex items-center gap-3 p-3.5 hover:bg-red-950/40 transition-colors cursor-pointer text-red-400"
              >
                <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center">
                  <RotateCcw size={16} />
                </div>
                <span className="text-sm font-semibold">Сбросить ферму и начать сначала</span>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

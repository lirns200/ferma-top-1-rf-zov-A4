import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { VEHICLE_CONFIGS, VehicleModelId, VehicleConfig } from '../../config/vehicles';
import { Vehicle3DShowroom } from '../garage/Vehicle3DShowroom';
import { sounds } from '../../audio/SoundManager';
import { X, Check, Lock, Zap, Coins, Sparkles, Award, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

const CoinSvg = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block align-middle">
    <circle cx="12" cy="12" r="10" fill="url(#coin_g_g)" stroke="#92400E" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7.5" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2.5 1" />
    <path d="M12 6.5L13.2 10.2H17L14 12.5L15.2 16.2L12 13.8L8.8 16.2L10 12.5L7 10.2H10.8L12 6.5Z" fill="#FFFBEB" stroke="#B45309" strokeWidth="0.6" />
    <ellipse cx="9.5" cy="8" rx="4" ry="2" fill="rgba(255,255,255,0.45)" transform="rotate(-25 9.5 8)" />
    <defs>
      <linearGradient id="coin_g_g" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

export const VehicleGarageModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    level,
    coins,
    gems,
    selectedVehicleModel = 'classic_pickup',
    unlockedVehicleModels = ['classic_pickup'],
    equipVehicle,
    unlockVehicle,
    addFloatingText,
  } = useGameStore();

  const [previewModelId, setPreviewModelId] = useState<VehicleModelId>(selectedVehicleModel);

  if (activeModal !== 'garage') return null;

  const currentPreviewCfg: VehicleConfig = VEHICLE_CONFIGS[previewModelId] || VEHICLE_CONFIGS.classic_pickup;
  const isUnlocked = unlockedVehicleModels.includes(previewModelId);
  const isEquipped = selectedVehicleModel === previewModelId;
  const canAffordCoins = coins >= currentPreviewCfg.costCoins;
  const canAffordGems = gems >= currentPreviewCfg.costGems;
  const isLevelMet = level >= currentPreviewCfg.unlockLevel;

  const handleEquip = (modelId: VehicleModelId) => {
    sounds.playClick();
    equipVehicle(modelId);
    addFloatingText(`Транспорт выбран: ${VEHICLE_CONFIGS[modelId].name}! 🚗`, window.innerWidth / 2, window.innerHeight / 2, '#22C55E');
  };

  const handleBuy = (cfg: VehicleConfig) => {
    if (!isLevelMet) {
      sounds.playClick();
      addFloatingText(`Требуется ${cfg.unlockLevel} уровень фермы!`, window.innerWidth / 2, window.innerHeight / 2, '#EF4444');
      return;
    }

    if (cfg.costCoins > 0 && !canAffordCoins) {
      sounds.playClick();
      addFloatingText('Не хватает монет!', window.innerWidth / 2, window.innerHeight / 2, '#EF4444');
      return;
    }

    if (cfg.costGems > 0 && !canAffordGems) {
      sounds.playClick();
      addFloatingText('Не хватает алмазов!', window.innerWidth / 2, window.innerHeight / 2, '#EF4444');
      return;
    }

    const success = unlockVehicle(cfg.id);
    if (success) {
      sounds.playLevelUp();
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
      addFloatingText(`Приобретён: ${cfg.name}! 🎉`, window.innerWidth / 2, window.innerHeight / 2, '#F59E0B');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="game-screen-bg w-full max-w-lg rounded-3xl border-2 border-amber-500/50 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="game-screen-header px-4 py-3 flex items-center justify-between border-b border-amber-600/40">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl drop-shadow">🚗</span>
            <div>
              <h2 className="text-amber-100 text-base sm:text-lg font-black tracking-wide leading-tight">
                Гараж Фермера
              </h2>
              <p className="text-amber-300/80 text-[11px] font-medium">
                Выбирайте транспорт для быстрых доставок
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              closeModal();
            }}
            className="w-8 h-8 rounded-full bg-amber-900/80 hover:bg-amber-800 text-amber-200 flex items-center justify-center border border-amber-500/40 transition-transform active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scrollbar-thin">
          
          {/* Central 3D Interactive Showroom (360° Y-Axis Rotation) */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-amber-950/60 via-amber-900/30 to-amber-950/70 border border-amber-500/30 shadow-inner">
            <Vehicle3DShowroom modelId={previewModelId} autoRotate={true} />

            {/* Active Tag Overlay */}
            {isEquipped && (
              <div className="absolute top-2.5 right-2.5 px-3 py-1 rounded-xl bg-emerald-600/90 text-white text-xs font-black border border-emerald-400/60 shadow-lg flex items-center gap-1">
                <Check size={14} className="stroke-[3]" />
                <span>На вашей ферме</span>
              </div>
            )}
          </div>

          {/* Current Vehicle Specs Card */}
          <div className="game-card-parchment p-3.5 rounded-2xl border border-amber-500/40 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-amber-950 font-black text-base leading-snug">
                  {currentPreviewCfg.name}
                </h3>
                <p className="text-amber-900/80 text-xs font-medium">
                  {currentPreviewCfg.description}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <div className="px-2 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-950 font-black text-[10px] sm:text-xs max-w-[170px] text-right">
                  {currentPreviewCfg.perkDescription}
                </div>
              </div>
            </div>

            {/* Stats Pills Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-300/60 text-center">
                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide flex items-center justify-center gap-1">
                  <Zap size={11} className="text-amber-600" />
                  <span>Скорость</span>
                </div>
                <div className="text-amber-950 font-black text-sm">
                  {Math.round(currentPreviewCfg.speedMultiplier * 100)}%
                </div>
              </div>

              <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-300/60 text-center">
                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide flex items-center justify-center gap-1">
                  <Coins size={11} className="text-amber-600" />
                  <span>Бонус монет</span>
                </div>
                <div className="text-amber-950 font-black text-sm">
                  +{currentPreviewCfg.bonusCoinPercent}%
                </div>
              </div>

              <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-300/60 text-center">
                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide flex items-center justify-center gap-1">
                  <Sparkles size={11} className="text-amber-600" />
                  <span>Бонус опыта</span>
                </div>
                <div className="text-amber-950 font-black text-sm">
                  +{currentPreviewCfg.bonusXpPercent}%
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-2">
              {isEquipped ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl bg-emerald-700/80 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-default shadow-sm opacity-90"
                >
                  <Check size={16} className="stroke-[3]" />
                  <span>Этот транспорт уже выбран</span>
                </button>
              ) : isUnlocked ? (
                <button
                  onClick={() => handleEquip(previewModelId)}
                  className="game-btn-green w-full py-2.5 rounded-xl text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                >
                  <Check size={16} className="stroke-[3]" />
                  <span>Выбрать для доставок</span>
                </button>
              ) : (
                <button
                  onClick={() => handleBuy(currentPreviewCfg)}
                  className={`w-full py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer ${
                    isLevelMet && ((currentPreviewCfg.costCoins > 0 && canAffordCoins) || (currentPreviewCfg.costGems > 0 && canAffordGems))
                      ? 'game-btn-gold text-amber-950'
                      : 'bg-stone-400 text-stone-700 opacity-80 cursor-not-allowed'
                  }`}
                >
                  {!isLevelMet ? (
                    <>
                      <Lock size={15} />
                      <span>Откроется на {currentPreviewCfg.unlockLevel} уровне</span>
                    </>
                  ) : currentPreviewCfg.costCoins > 0 ? (
                    <>
                      <span>Купить транспорт за</span>
                      <CoinSvg />
                      <span>{currentPreviewCfg.costCoins}</span>
                    </>
                  ) : (
                    <>
                      <span>Купить транспорт за 💎 {currentPreviewCfg.costGems}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Vehicle Selection Shelf (List of 6 Models) */}
          <div className="space-y-1.5">
            <h4 className="text-amber-200 text-xs font-black uppercase tracking-wider px-1">
              Коллекция транспорта
            </h4>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(Object.keys(VEHICLE_CONFIGS) as VehicleModelId[]).map(vId => {
                const cfg = VEHICLE_CONFIGS[vId];
                const isSelected = previewModelId === vId;
                const isOwned = unlockedVehicleModels.includes(vId);
                const isCurrent = selectedVehicleModel === vId;

                return (
                  <button
                    key={vId}
                    onClick={() => {
                      sounds.playClick();
                      setPreviewModelId(vId);
                    }}
                    className={`relative p-2 rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'game-card-parchment ring-2 ring-amber-400 scale-[1.03] shadow-md'
                        : 'game-dock-btn text-amber-100 hover:bg-amber-900/60'
                    }`}
                  >
                    {/* Status Badge */}
                    {isCurrent && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shadow border border-white/50">
                        <Check size={11} className="stroke-[3]" />
                      </div>
                    )}

                    {!isOwned && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-800 text-stone-300 flex items-center justify-center text-[10px] shadow border border-stone-500/50">
                        <Lock size={10} />
                      </div>
                    )}

                    <span className="text-2xl my-1">{cfg.icon}</span>

                    <span className={`text-[11px] font-black leading-tight line-clamp-1 ${
                      isSelected ? 'text-amber-950' : 'text-amber-100'
                    }`}>
                      {cfg.name}
                    </span>

                    <span className={`text-[9px] font-bold mt-0.5 ${
                      isSelected ? 'text-amber-800' : 'text-amber-300/80'
                    }`}>
                      {isOwned ? (isCurrent ? 'Активен' : 'В гараже') : `Ур. ${cfg.unlockLevel}`}
                    </span>
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

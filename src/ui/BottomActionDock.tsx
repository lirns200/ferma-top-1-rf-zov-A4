import React from 'react';
import { useGameStore } from '../game/gameState';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic } from '../utils/telegram';

const HUD_ICONS = {
  shop: new URL('../assets/hud/hud-shop.png', import.meta.url).href,
  market: new URL('../assets/hud/hud-market-v2.png', import.meta.url).href,
  build: new URL('../assets/hud/hud-build.png', import.meta.url).href,
  farm: new URL('../assets/hud/hud-farm-v2.png', import.meta.url).href,
  friends: new URL('../assets/hud/hud-friends-v2.png', import.meta.url).href,
  settings: new URL('../assets/hud/hud-settings.png', import.meta.url).href,
  soldCoin: new URL('../assets/hud/hud-sold-coin.png', import.meta.url).href,
} as const;

const HUD_ICON_CLASS = 'w-full h-full object-contain scale-[1.12] drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)] transition-transform duration-200 group-hover:scale-[1.18]';

export const BottomActionDock: React.FC = () => {
  const {
    activeModal, openModal, closeModal,
    shopSlots,
    isActionStripOpen, toggleActionStrip,
    isDesign2026,
  } = useGameStore();

  const hasSoldItems = shopSlots.some(s => s.isSold);
  const isInsideTab = activeModal !== null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none p-1.5 sm:p-3 pb-[max(0.35rem,env(safe-area-inset-bottom))]">
      
      {/* ── Studio Casual Game Bottom Dock: [Магазин] [Рынок] [Строить/Ферма] [Друзья] [Опции] ── */}
      <div className="game-dock-tray pointer-events-auto max-w-md mx-auto px-1.5 sm:px-3 py-1.5 sm:py-2 grid grid-cols-5 items-center justify-items-center relative transition-all duration-300">

        {/* 1. 🎪 Магазин */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'shop') closeModal();
            else openModal('shop');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer relative w-full ${
            activeModal === 'shop' ? 'scale-105' : ''
          }`}
        >
          <div className={`game-dock-btn w-9.5 h-9.5 min-w-[38px] sm:w-11 sm:h-11 flex items-center justify-center text-xl sm:text-2xl transition-all ${
            activeModal === 'shop' ? 'game-dock-btn-active' : ''
          }`}>
            <img
              src={HUD_ICONS.shop}
              alt="Магазин"
              draggable={false}
              className={HUD_ICON_CLASS}
            />
          </div>
          <span className={`text-[9.5px] sm:text-xs font-black tracking-tight uppercase game-text-shadow ${
            activeModal === 'shop' ? 'text-yellow-300' : 'text-amber-100'
          }`}>
            Магазин
          </span>
        </button>

        {/* 2. 🏪 Рынок */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'roadside' || activeModal === 'market') closeModal();
            else openModal('roadside');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer relative w-full ${
            activeModal === 'roadside' || activeModal === 'market' ? 'scale-105' : ''
          }`}
        >
          {hasSoldItems && (
            <span className="absolute -top-1 right-1.5 sm:right-3 w-4 h-4 bg-emerald-500 border border-white rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-lg animate-bounce z-10">
              <img
                src={HUD_ICONS.soldCoin}
                alt=""
                draggable={false}
                className="w-full h-full object-contain scale-125"
              />
            </span>
          )}
          <div className={`game-dock-btn w-9.5 h-9.5 min-w-[38px] sm:w-11 sm:h-11 flex items-center justify-center text-xl sm:text-2xl transition-all ${
            activeModal === 'roadside' || activeModal === 'market' ? 'game-dock-btn-active' : ''
          }`}>
            <img
              src={HUD_ICONS.market}
              alt="Рынок"
              draggable={false}
              className={HUD_ICON_CLASS}
            />
          </div>
          <span className={`text-[9.5px] sm:text-xs font-black tracking-tight uppercase game-text-shadow ${
            activeModal === 'roadside' || activeModal === 'market' ? 'text-yellow-300' : 'text-amber-100'
          }`}>
            Рынок
          </span>
        </button>

        {/* 3. 🏡 СТРОИТЬ / 🌾 ФЕРМА (Центральная золотая кнопка) */}
        <button
          id={isInsideTab ? 'btn-return-farm' : 'btn-build-action'}
          onClick={() => {
            if (isInsideTab) {
              sounds.playClick();
              triggerTelegramHaptic('medium');
              closeModal();
            } else {
              sounds.playClick();
              triggerTelegramHaptic('light');
              toggleActionStrip();
            }
          }}
          className="flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer w-full -my-2.5 z-20"
        >
          {isInsideTab ? (
            /* Inside Tab: 🌾 Ферма */
            <>
              <div className="game-center-farm-btn w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-2xl sm:text-3xl animate-pulse">
                <img
                  src={HUD_ICONS.farm}
                  alt="Ферма"
                  draggable={false}
                  className={HUD_ICON_CLASS}
                />
              </div>
              <span className="text-[9.5px] sm:text-xs font-black tracking-tight text-emerald-400 uppercase leading-tight mt-0.5 game-text-shadow">
                Ферма
              </span>
            </>
          ) : (
            /* On Farm: 🏡 Строить */
            <>
              <div className={`game-center-build-btn w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-2xl sm:text-3xl ${
                isActionStripOpen ? 'ring-4 ring-yellow-400/60 scale-105 animate-pulse' : ''
              }`}>
                <img
                  src={HUD_ICONS.build}
                  alt="Строить"
                  draggable={false}
                  className={HUD_ICON_CLASS}
                />
              </div>
              <span className="text-[9.5px] sm:text-xs font-black tracking-tight text-yellow-300 uppercase leading-tight mt-0.5 game-text-gold">
                Строить
              </span>
            </>
          )}
        </button>

        {/* 4. 👥 Друзья */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'friends') closeModal();
            else openModal('friends');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer relative w-full ${
            activeModal === 'friends' ? 'scale-105' : ''
          }`}
        >
          <div className={`game-dock-btn w-9.5 h-9.5 min-w-[38px] sm:w-11 sm:h-11 flex items-center justify-center text-xl sm:text-2xl transition-all ${
            activeModal === 'friends' ? 'game-dock-btn-active' : ''
          }`}>
            <img
              src={HUD_ICONS.friends}
              alt="Друзья"
              draggable={false}
              className={HUD_ICON_CLASS}
            />
          </div>
          <span className={`text-[9.5px] sm:text-xs font-black tracking-tight uppercase game-text-shadow ${
            activeModal === 'friends' ? 'text-yellow-300' : 'text-amber-100'
          }`}>
            Друзья
          </span>
        </button>

        {/* 5. ⚙️ Опции */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerTelegramHaptic('light');
            if (activeModal === 'settings') closeModal();
            else openModal('settings');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 group active:scale-95 transition-transform cursor-pointer relative w-full ${
            activeModal === 'settings' ? 'scale-105' : ''
          }`}
        >
          <div className={`game-dock-btn w-9.5 h-9.5 min-w-[38px] sm:w-11 sm:h-11 flex items-center justify-center text-xl sm:text-2xl transition-all ${
            activeModal === 'settings' ? 'game-dock-btn-active' : ''
          }`}>
            <img
              src={HUD_ICONS.settings}
              alt="Опции"
              draggable={false}
              className={HUD_ICON_CLASS}
            />
          </div>
          <span className={`text-[9.5px] sm:text-xs font-black tracking-tight uppercase game-text-shadow ${
            activeModal === 'settings' ? 'text-yellow-300' : 'text-amber-100'
          }`}>
            Опции
          </span>
        </button>

      </div>
    </footer>
  );
  );
};

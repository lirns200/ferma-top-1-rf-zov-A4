import React, { useEffect } from 'react';
import { useGameStore } from './game/gameState';
import { GameScene } from './world/GameScene';
import { TopBar } from './ui/TopBar';
import { BottomActionDock } from './ui/BottomActionDock';
import { FloatingToolsOverlay } from './ui/FloatingToolsOverlay';
import { TutorialOverlay } from './ui/TutorialOverlay';
import { CinematicIntroOverlay } from './ui/CinematicIntroOverlay';
import { FloatingTextsOverlay } from './ui/FloatingTextsOverlay';
import { MarketDeliveryBanner } from './ui/MarketDeliveryBanner';

// Modals
import { BuildShopModal } from './ui/modals/BuildShopModal';
import { OrderBoardModal } from './ui/modals/OrderBoardModal';
import { StorageModal } from './ui/modals/StorageModal';
import { RoadsideShopModal } from './ui/modals/RoadsideShopModal';
import { FishingModal } from './ui/modals/FishingModal';
import { LevelUpModal } from './ui/modals/LevelUpModal';
import { EventsModal } from './ui/modals/EventsModal';
import { SettingsModal } from './ui/modals/SettingsModal';
import { MailboxModal } from './ui/modals/MailboxModal';
import { FriendsModal } from './ui/modals/FriendsModal';

export function App() {
  const { initGame, tickGameLoop, saveCurrentState, activeModal } = useGameStore();

  useEffect(() => {
    // Initialize saved progress and start simulation
    initGame();

    // Game loop ticks every 1 second (crops, factories, animals, orders)
    const tickInterval = window.setInterval(() => {
      tickGameLoop();
    }, 1000);

    // Auto-save game state every 15 seconds
    const saveInterval = window.setInterval(() => {
      saveCurrentState();
    }, 15000);

    return () => {
      clearInterval(tickInterval);
      clearInterval(saveInterval);
    };
  }, [initGame, tickGameLoop, saveCurrentState]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D Isometric Viewport */}
      <GameScene />

      {/* Heads Up Display Overlay */}
      <TopBar />
      <BottomActionDock />
      <FloatingToolsOverlay />
      <TutorialOverlay />
      <CinematicIntroOverlay />
      <FloatingTextsOverlay />
      <MarketDeliveryBanner />

      {/* Interactive Pop-up Modals */}
      <BuildShopModal />
      <OrderBoardModal />
      <StorageModal />
      <RoadsideShopModal />
      <FishingModal />
      <LevelUpModal />
      <EventsModal />
      <SettingsModal />
      <FriendsModal />
      {activeModal === 'mailbox' && <MailboxModal />}
    </main>
  );
}

export default App;

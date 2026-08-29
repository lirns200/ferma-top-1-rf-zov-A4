import React from 'react';
import { useGameStore } from '../game/gameState';

/** Pixel fill bar for storage */
const StorageBar: React.FC<{ used: number; cap: number }> = ({ used, cap }) => {
  const pct  = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
  const segments = 6;
  const filled = Math.round((pct / 100) * segments);
  const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22c55e';
  return (
    <div
      className="flex gap-[2px] mt-0.5"
      style={{ border: '2px solid #000', padding: 2, background: '#0a0400', boxShadow: 'inset 1px 1px 0 #000' }}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 4, background: i < filled ? color : '#2a1000' }} />
      ))}
    </div>
  );
};

/** Pixel nav button */
const NavBtn: React.FC<{
  id?: string;
  icon: string;
  label: string;
  onClick: () => void;
  badge?: React.ReactNode;
  ping?: boolean;
  extra?: React.ReactNode;
}> = ({ id, icon, label, onClick, badge, ping, extra }) => (
  <button
    id={id}
    onClick={onClick}
    className="px-btn px-btn-amber relative flex flex-col items-center justify-center gap-0.5"
    style={{ width: 52, height: 52, padding: '4px 2px' }}
  >
    {/* Ping indicator */}
    {ping && (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 animate-ping"
        style={{ border: '2px solid #000' }} />
    )}
    {/* Badge */}
    {badge && (
      <div className="absolute -top-1.5 -right-1.5 px-badge bg-red-600 text-white">
        {badge}
      </div>
    )}
    <span style={{ fontSize: 20, imageRendering: 'pixelated' }}>{icon}</span>
    <span className="px-font text-[5px] text-amber-300 uppercase tracking-wider">{label}</span>
    {extra}
  </button>
);

export const BottomActionDock: React.FC = () => {
  const {
    openModal, getStorageUsed,
    siloCapacity, barnCapacity,
    truckState, shopSlots, orders,
  } = useGameStore();

  const siloUsed = getStorageUsed('silo');
  const barnUsed = getStorageUsed('barn');
  const hasSoldItems = shopSlots.some(s => s.isSold);
  const readyOrders  = orders.length;

  return (
    <footer className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 flex items-end justify-between pointer-events-none z-20">

      {/* ── Big Shop Button ── */}
      <div className="pointer-events-auto">
        <button
          id="btn-build-shop"
          onClick={() => openModal('shop')}
          className="px-btn px-btn-amber flex flex-col items-center justify-center gap-1 group"
          style={{ width: 64, height: 64, fontSize: 10 }}
        >
          <span className="group-hover:scale-110 transition-transform" style={{ fontSize: 28, imageRendering: 'pixelated' }}>🚜</span>
          <span className="px-font text-[5px] text-amber-300 uppercase tracking-wider">Магазин</span>
        </button>
      </div>

      {/* ── Nav Dock ── */}
      <div
        className="pointer-events-auto flex items-center gap-1.5 px-panel"
        style={{ padding: '8px 10px' }}
      >
        {/* Orders */}
        <NavBtn
          id="btn-orders-board"
          icon="📋"
          label="Заказы"
          onClick={() => openModal('orders')}
          ping={truckState.isDelivering}
          badge={!truckState.isDelivering && readyOrders > 0 ? readyOrders : undefined}
        />

        {/* Silo */}
        <button
          id="btn-silo-storage"
          onClick={() => openModal('silo')}
          className="px-btn px-btn-amber flex flex-col items-center justify-center gap-0.5"
          style={{ width: 52, padding: '4px 6px' }}
        >
          <span style={{ fontSize: 20, imageRendering: 'pixelated' }}>🌾</span>
          <span className="px-font text-[5px] text-amber-300 tabular-nums">{siloUsed}/{siloCapacity}</span>
          <StorageBar used={siloUsed} cap={siloCapacity} />
        </button>

        {/* Barn */}
        <button
          id="btn-barn-storage"
          onClick={() => openModal('barn')}
          className="px-btn px-btn-amber flex flex-col items-center justify-center gap-0.5"
          style={{ width: 52, padding: '4px 6px' }}
        >
          <span style={{ fontSize: 20, imageRendering: 'pixelated' }}>🏠</span>
          <span className="px-font text-[5px] text-amber-300 tabular-nums">{barnUsed}/{barnCapacity}</span>
          <StorageBar used={barnUsed} cap={barnCapacity} />
        </button>

        {/* Market */}
        <div className="relative">
          <NavBtn
            id="btn-roadside-market"
            icon="🏪"
            label="Рынок"
            onClick={() => openModal('roadside')}
          />
          {hasSoldItems && (
            <div
              className="absolute -top-1.5 -right-1.5 px-badge bg-yellow-400 text-black animate-bounce"
              style={{ fontSize: 8 }}
            >
              $
            </div>
          )}
        </div>

        {/* Fishing */}
        <NavBtn
          id="btn-fishing-dock"
          icon="🎣"
          label="Озеро"
          onClick={() => openModal('fishing')}
        />
      </div>
    </footer>
  );
};

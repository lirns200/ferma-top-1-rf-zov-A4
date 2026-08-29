import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { BUILDINGS } from '../../config/buildings';
import { DECORATIONS } from '../../config/decorations';
import { TREES_BUSHES } from '../../config/crops';

type ShopTab = 'farming' | 'factories' | 'trees' | 'decorations';

const TABS: { id: ShopTab; label: string; icon: string }[] = [
  { id: 'farming',     label: 'Поля и загоны',  icon: '🌾' },
  { id: 'factories',   label: 'Производство',  icon: '🏭' },
  { id: 'trees',       label: 'Сад и деревья', icon: '🍎' },
  { id: 'decorations', label: 'Декорации',     icon: '⛲' },
];

function fmtCost(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000)    return Math.round(n / 1000) + 'K';
  return n.toLocaleString('ru-RU');
}

export const BuildShopModal: React.FC = () => {
  const {
    activeModal, closeModal, level, coins, gems, entities, setPlacingBuilding,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<ShopTab>('farming');
  const [search, setSearch] = useState('');

  if (activeModal !== 'shop') return null;

  const allItems =
    activeTab === 'farming'
      ? [
          BUILDINGS.field_plot,
          ...Object.values(BUILDINGS).filter(b => b.id !== 'field_plot' && (b.category === 'animal_pen' || b.category === 'storage')),
        ].filter(Boolean)
      : activeTab === 'factories'
      ? Object.values(BUILDINGS).filter(b => b.category === 'production')
      : activeTab === 'trees'
      ? Object.values(TREES_BUSHES)
      : Object.values(DECORATIONS);

  const filtered = search
    ? allItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  const sorted = [...filtered].sort((a, b) => {
    const aOk = level >= a.unlockLevel && coins >= (a.cost || 0);
    const bOk = level >= b.unlockLevel && coins >= (b.cost || 0);
    if (aOk && !bOk) return -1;
    if (bOk && !aOk) return 1;
    return a.unlockLevel - b.unlockLevel;
  });

  const handleSelect = (id: string, unlocked: boolean, canAfford: boolean) => {
    if (!unlocked || !canAfford) return;
    setPlacingBuilding(id);
    closeModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      style={{ background: 'rgba(0, 0, 0, 0.78)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
    >
      <div
        className="relative w-full max-w-3xl flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{
          maxHeight: '90vh',
          background: '#231206',
          border: '3px solid #633612',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.15)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >

        {/* ── HEADER ── */}
        <div style={{
          background: 'linear-gradient(180deg, #4A280F 0%, #341A08 100%)',
          borderBottom: '2px solid #5C3310',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #F59E0B, #B45309)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
              boxShadow: '0 4px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}>
              🚜
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#FEF08A', letterSpacing: '0.5px' }}>
                Магазин строительства
              </div>
              <div style={{ fontSize: 12, color: '#D97706', fontWeight: 500, marginTop: 1 }}>
                Постройки, производство, животные и декор
              </div>
            </div>
          </div>
          <button
            onClick={closeModal}
            style={{
              width: 36, height: 36,
              borderRadius: 10,
              background: 'linear-gradient(180deg, #EF4444 0%, #B91C1C 100%)',
              color: '#FFF',
              border: '1px solid #7F1D1D',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              fontSize: 16,
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.1s, opacity 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            ✕
          </button>
        </div>

        {/* ── TABS ── */}
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '10px 16px',
          background: '#1A0C04',
          borderBottom: '1px solid #3D2008',
          overflowX: 'auto',
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFF' : '#C4A482',
                  background: isActive ? 'linear-gradient(180deg, #B45309 0%, #78350F 100%)' : '#2A1507',
                  border: isActive ? '1px solid #F59E0B' : '1px solid #43220B',
                  boxShadow: isActive ? '0 2px 8px rgba(245, 158, 11, 0.35), inset 0 1px 0 rgba(255,255,255,0.25)' : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── SEARCH BAR ── */}
        <div style={{ padding: '10px 16px', background: '#170A03', borderBottom: '1px solid #341706' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 14, fontSize: 15, color: '#926038' }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск предметов по названию..."
              style={{
                width: '100%',
                padding: '9px 36px 9px 40px',
                borderRadius: 10,
                background: '#281306',
                border: '1px solid #542B0D',
                color: '#FEF08A',
                fontSize: 13,
                outline: 'none',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#F59E0B'}
              onBlur={e => e.currentTarget.style.borderColor = '#542B0D'}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: 12,
                  background: 'none', border: 'none',
                  color: '#A87C50', fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── ITEMS GRID ── */}
        <div
          className="custom-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: 12,
            minHeight: 280,
          }}
        >
          {sorted.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: '#A87C50' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Ничего не найдено</div>
              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>Попробуйте изменить поисковый запрос</div>
            </div>
          )}

          {sorted.map(item => {
            const unlocked  = level >= item.unlockLevel;
            const cost      = item.cost || 0;
            const gemsCost  = (item as any).gemsCost || 0;
            const canAfford = coins >= cost && gems >= gemsCost;
            const placed    = entities.filter(e => e.configId === item.id).length;
            const description = (item as any).description as string | undefined;
            const w = (item as any).width;
            const d = (item as any).depth;

            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item.id, unlocked, canAfford)}
                style={{
                  background: !unlocked ? '#1A0B03' : '#2D1608',
                  border: !unlocked ? '1px solid #361705' : '1px solid #5A2E0F',
                  borderRadius: 14,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxShadow: !unlocked ? 'none' : '0 4px 12px rgba(0,0,0,0.3)',
                  opacity: !unlocked ? 0.65 : canAfford ? 1 : 0.88,
                  cursor: unlocked && canAfford ? 'pointer' : 'default',
                  transition: 'transform 0.12s, border-color 0.12s, box-shadow 0.12s',
                }}
                onMouseEnter={e => {
                  if (unlocked && canAfford) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#F59E0B';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.2)';
                  }
                }}
                onMouseLeave={e => {
                  if (unlocked && canAfford) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = '#5A2E0F';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                  }
                }}
              >
                {/* Top Info row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 50, height: 50,
                    borderRadius: 12,
                    background: !unlocked ? '#120702' : 'linear-gradient(135deg, #4A280F, #2A1305)',
                    border: '1px solid #633612',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26,
                    flexShrink: 0,
                    filter: !unlocked ? 'grayscale(1) brightness(0.5)' : 'none',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: !unlocked ? '#A87C50' : '#FEF08A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      {w && (
                        <span style={{ fontSize: 11, color: '#A87C50', fontWeight: 500 }}>
                          {w}×{d} кл.
                        </span>
                      )}
                      {placed > 0 && (
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#86EFAC',
                          background: '#14532D',
                          borderRadius: 6,
                          padding: '1px 5px',
                        }}>
                          ×{placed}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description if any */}
                {description && (
                  <div style={{ fontSize: 11, color: '#C4A482', lineHeight: 1.4 }}>
                    {description}
                  </div>
                )}

                {/* Bottom Row: Cost & Action Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginTop: 'auto',
                  paddingTop: 8,
                  borderTop: '1px solid #3D1F08',
                }}>
                  {/* Cost display */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {cost === 0 && gemsCost === 0 ? (
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#4ADE80' }}>
                        Бесплатно
                      </span>
                    ) : (
                      <>
                        {cost > 0 && (
                          <span style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: coins >= cost ? '#FACC15' : '#EF4444',
                            display: 'flex', alignItems: 'center', gap: 3,
                          }}>
                            <span>🪙</span>
                            <span>{fmtCost(cost)}</span>
                          </span>
                        )}
                        {gemsCost > 0 && (
                          <span style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: gems >= gemsCost ? '#38BDF8' : '#EF4444',
                            display: 'flex', alignItems: 'center', gap: 3,
                          }}>
                            <span>💎</span>
                            <span>{gemsCost}</span>
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Action Button */}
                  {!unlocked ? (
                    <div style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#F59E0B',
                      background: '#351B07',
                      border: '1px solid #633612',
                      borderRadius: 8,
                      padding: '4px 8px',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span>🔒</span>
                      <span>Ур. {item.unlockLevel}</span>
                    </div>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={e => {
                        e.stopPropagation();
                        handleSelect(item.id, unlocked, canAfford);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        color: canAfford ? '#FFF' : '#A87C50',
                        background: canAfford
                          ? 'linear-gradient(180deg, #22C55E 0%, #16A34A 100%)'
                          : '#281306',
                        border: canAfford ? '1px solid #15803D' : '1px solid #43220B',
                        boxShadow: canAfford ? '0 2px 6px rgba(22, 163, 74, 0.4)' : 'none',
                        transition: 'transform 0.1s, filter 0.1s',
                      }}
                      onMouseEnter={e => {
                        if (canAfford) e.currentTarget.style.filter = 'brightness(1.1)';
                      }}
                      onMouseLeave={e => {
                        if (canAfford) e.currentTarget.style.filter = 'none';
                      }}
                    >
                      {canAfford ? 'Построить' : 'Мало монет'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── FOOTER: Balance Bar ── */}
        <div style={{
          borderTop: '2px solid #43220B',
          background: '#1A0C04',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          fontSize: 14,
          fontWeight: 700,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FACC15' }}>
            <span style={{ fontSize: 16 }}>🪙</span>
            <span>{coins.toLocaleString('ru-RU')} монет</span>
          </div>
          <div style={{ width: 1, height: 16, background: '#4A280F' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38BDF8' }}>
            <span style={{ fontSize: 16 }}>💎</span>
            <span>{gems} кристаллов</span>
          </div>
          <div style={{ width: 1, height: 16, background: '#4A280F' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#60A5FA' }}>
            <span style={{ fontSize: 16 }}>⭐</span>
            <span>Уровень {level}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

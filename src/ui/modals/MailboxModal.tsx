import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { CROPS, TREES_BUSHES } from '../../config/crops';
import { PRODUCTS } from '../../config/products';

export const MailboxModal: React.FC = () => {
  const {
    mailboxDeals,
    mailboxGiftClaimed,
    inventory,
    acceptMailboxDeal,
    claimMailboxGift,
    refreshMailboxDeals,
    closeModal,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'letters' | 'parcel'>('letters');

  const getItemInfo = (id: string) => {
    return PRODUCTS[id] || CROPS[id] || TREES_BUSHES[id] || { name: id, icon: '📦' };
  };

  const completedCount = mailboxDeals.filter(d => d.isCompleted).length;
  const uncompletedCount = mailboxDeals.length - completedCount;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div 
        className="px-modal-card bg-amber-950 border-4 border-amber-600/90 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-white"
        style={{
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.2)',
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 via-amber-800 to-red-900 px-4 py-3 border-b-2 border-amber-600 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-bounce">📬</span>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-['Press_Start_2P'] text-yellow-300 drop-shadow">
                ПОЧТОВЫЙ ЯЩИК
              </h2>
              <p className="text-[10px] text-amber-200/90 font-sans">
                Специальные письма, бартер и подарки от жителей долины
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-500 border border-red-400 flex items-center justify-center font-bold text-white shadow-md active:scale-95 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-amber-800 bg-amber-900/60 p-1.5 gap-2 font-['Press_Start_2P'] text-[9px]">
          <button
            onClick={() => setActiveTab('letters')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'letters'
                ? 'bg-amber-600 text-yellow-200 border-2 border-yellow-400 shadow-md'
                : 'bg-amber-950/70 text-amber-300 hover:bg-amber-900 border border-amber-800/80'
            }`}
          >
            <span>📜 ПИСЬМА И БАРТЕР</span>
            {uncompletedCount > 0 && (
              <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                {uncompletedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('parcel')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'parcel'
                ? 'bg-amber-600 text-yellow-200 border-2 border-yellow-400 shadow-md'
                : 'bg-amber-950/70 text-amber-300 hover:bg-amber-900 border border-amber-800/80'
            }`}
          >
            <span>🎁 ПОСЫЛКА ПОЧТАЛЬОНА</span>
            {!mailboxGiftClaimed && (
              <span className="bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">
                НОВАЯ
              </span>
            )}
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {activeTab === 'letters' ? (
            <>
              <div className="flex justify-between items-center bg-amber-900/40 p-2.5 rounded-xl border border-amber-700/60">
                <span className="text-[11px] text-amber-200 font-sans">
                  💡 Соседи предлагают редкие инструменты и ресурсы в обмен на урожай!
                </span>
                <button
                  onClick={refreshMailboxDeals}
                  className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 border border-amber-500 rounded-lg text-[9px] font-['Press_Start_2P'] text-yellow-200 shadow active:scale-95 transition-all flex items-center gap-1"
                  title="Обновить список объявлений"
                >
                  <span>🔄</span> Обновить
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {mailboxDeals.map((deal) => {
                  const reqInfo = getItemInfo(deal.requiredItemId);
                  const rewInfo = deal.rewardItemId ? getItemInfo(deal.rewardItemId) : null;
                  const currentHave = inventory[deal.requiredItemId] || 0;
                  const hasEnough = currentHave >= deal.requiredCount;

                  return (
                    <div
                      key={deal.id}
                      className={`p-3.5 rounded-xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        deal.isCompleted
                          ? 'bg-amber-950/40 border-amber-800/60 opacity-60'
                          : hasEnough
                          ? 'bg-gradient-to-r from-amber-900/90 to-amber-950 border-yellow-500/80 shadow-lg'
                          : 'bg-amber-900/40 border-amber-800/80'
                      }`}
                    >
                      {/* Left: Avatar & Letter Text */}
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-11 h-11 rounded-xl bg-amber-800/80 border border-amber-600 flex items-center justify-center text-2xl shadow-inner shrink-0">
                          {deal.senderAvatar}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-yellow-300 text-xs sm:text-sm font-sans">
                              {deal.senderName}
                            </h3>
                            <span className="text-[10px] text-amber-400 font-medium">
                              • {deal.letterTitle}
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-100/80 italic font-sans leading-relaxed">
                            «{deal.letterMessage}»
                          </p>
                        </div>
                      </div>

                      {/* Right: Exchange requirement & reward */}
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-amber-800">
                        {/* Requirement */}
                        <div className="flex flex-col items-center bg-black/30 px-2.5 py-1.5 rounded-lg border border-amber-800 min-w-[70px]">
                          <span className="text-[9px] text-amber-400 uppercase font-sans">Отдать:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-base">{reqInfo.icon}</span>
                            <span className={`text-xs font-bold ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                              {currentHave}/{deal.requiredCount}
                            </span>
                          </div>
                          <span className="text-[9px] text-amber-300/80 truncate max-w-[65px]">
                            {reqInfo.name}
                          </span>
                        </div>

                        <span className="text-amber-400 text-base font-bold">➔</span>

                        {/* Reward */}
                        <div className="flex flex-col items-center bg-yellow-950/60 px-2.5 py-1.5 rounded-lg border border-yellow-600/70 min-w-[70px]">
                          <span className="text-[9px] text-yellow-400 uppercase font-sans">Получить:</span>
                          <div className="flex items-center gap-1">
                            {rewInfo && <span className="text-base">{rewInfo.icon}</span>}
                            <span className="text-xs font-bold text-yellow-300">
                              {deal.rewardCount ? `+${deal.rewardCount}` : ''}
                            </span>
                          </div>
                          <span className="text-[9px] text-yellow-200/90 truncate max-w-[65px]">
                            {rewInfo ? rewInfo.name : 'Награда'}
                          </span>
                        </div>

                        {/* Action Button */}
                        {deal.isCompleted ? (
                          <div className="px-3 py-1.5 bg-green-900/60 border border-green-600 rounded-lg text-green-300 text-[9px] font-['Press_Start_2P'] flex items-center gap-1">
                            <span>✓</span> Выполнено
                          </div>
                        ) : (
                          <button
                            onClick={() => acceptMailboxDeal(deal.id)}
                            disabled={!hasEnough}
                            className={`px-3 py-2 rounded-lg font-['Press_Start_2P'] text-[9px] shadow-md transition-all active:scale-95 ${
                              hasEnough
                                ? 'bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white border-2 border-green-300 animate-pulse'
                                : 'bg-gray-700/60 text-gray-400 border border-gray-600 cursor-not-allowed'
                            }`}
                          >
                            ОБМЕН
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-4 sm:p-6 bg-gradient-to-b from-amber-900/70 to-amber-950 rounded-2xl border-2 border-amber-600 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-4 border-yellow-200 flex items-center justify-center text-4xl shadow-xl animate-bounce">
                📦
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold font-['Press_Start_2P'] text-yellow-300">
                  ЕЖЕДНЕВНАЯ ПОСЫЛКА ПОЧТАЛЬОНА
                </h3>
                <p className="text-xs text-amber-200 mt-1 max-w-md font-sans">
                  Сельская почтовая служба доставила вам подарок с полезными инструментами и монетами!
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full max-w-lg bg-black/40 p-3 rounded-xl border border-amber-700/60">
                <div className="flex flex-col items-center bg-amber-900/60 p-2 rounded-lg border border-amber-600/60">
                  <span className="text-xl">💰</span>
                  <span className="text-xs font-bold text-yellow-300 mt-1">+150</span>
                  <span className="text-[8px] text-amber-200">Монет</span>
                </div>
                <div className="flex flex-col items-center bg-cyan-950/60 p-2 rounded-lg border border-cyan-600/60">
                  <span className="text-xl">💎</span>
                  <span className="text-xs font-bold text-cyan-300 mt-1">+3</span>
                  <span className="text-[8px] text-cyan-200">Алмаза</span>
                </div>
                <div className="flex flex-col items-center bg-blue-950/60 p-2 rounded-lg border border-blue-600/60">
                  <span className="text-xl">⭐</span>
                  <span className="text-xs font-bold text-blue-300 mt-1">+45</span>
                  <span className="text-[8px] text-blue-200">Опыта</span>
                </div>
                <div className="flex flex-col items-center bg-red-950/60 p-2 rounded-lg border border-red-600/60">
                  <span className="text-xl">🪓</span>
                  <span className="text-xs font-bold text-red-300 mt-1">+1</span>
                  <span className="text-[8px] text-red-200">Топор</span>
                </div>
                <div className="flex flex-col items-center bg-gray-950/60 p-2 rounded-lg border border-gray-600/60">
                  <span className="text-xl">🔨</span>
                  <span className="text-xs font-bold text-gray-300 mt-1">+1</span>
                  <span className="text-[8px] text-gray-200">Гвоздь</span>
                </div>
              </div>

              {mailboxGiftClaimed ? (
                <div className="p-3 bg-green-950/80 border border-green-600 rounded-xl text-green-300 font-sans text-xs flex items-center gap-2">
                  <span>✓</span> Вы уже забрали сегодняшнюю посылку! Новая прибудет завтра утром.
                </div>
              ) : (
                <button
                  onClick={claimMailboxGift}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-stone-900 font-bold font-['Press_Start_2P'] text-xs rounded-xl shadow-xl border-2 border-yellow-200 active:scale-95 transition-all animate-pulse"
                >
                  🎁 ЗАБРАТЬ ПОСЫЛКУ
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
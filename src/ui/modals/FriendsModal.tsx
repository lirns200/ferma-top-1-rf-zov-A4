import React, { useState } from 'react';
import { useGameStore } from '../../game/gameState';
import { sounds } from '../../audio/SoundManager';
import { triggerTelegramHaptic, getTelegramUserProfile } from '../../utils/telegram';
import { Users, UserPlus, Gift, Trophy, Share2, Heart, Check, Sparkles } from 'lucide-react';

interface Neighbor {
  id: string;
  name: string;
  avatar: string;
  level: number;
  isOnline: boolean;
  helpedToday: boolean;
  score: number;
}

const INITIAL_NEIGHBORS: Neighbor[] = [
  { id: '1', name: 'Анна Фермер', avatar: '👩‍🌾', level: 12, isOnline: true, helpedToday: false, score: 28400 },
  { id: '2', name: 'Дядя Ваня', avatar: '👨‍🌾', level: 9, isOnline: false, helpedToday: true, score: 19800 },
  { id: '3', name: 'Кот Матроскин', avatar: '🐱', level: 7, isOnline: true, helpedToday: false, score: 14200 },
  { id: '4', name: 'Алиса Садовод', avatar: '🌱', level: 15, isOnline: true, helpedToday: false, score: 36100 },
  { id: '5', name: 'Михаил Пасечник', avatar: '🐝', level: 11, isOnline: false, helpedToday: false, score: 24700 },
];

const CoinSvg = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0 inline-block">
    <circle cx="12" cy="12" r="10" fill="url(#coin_fm_g)" stroke="#92400E" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7.5" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2.5 1" />
    <text x="12" y="16" fontSize="11" fontWeight="900" fill="#78350F" textAnchor="middle" fontFamily="sans-serif">🪙</text>
    <defs>
      <linearGradient id="coin_fm_g" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

export const FriendsModal: React.FC = () => {
  const {
    activeModal,
    isDesign2026,
    coins,
    gems,
    level,
    addFloatingText,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'friends' | 'leaderboard'>('friends');
  const [neighbors, setNeighbors] = useState<Neighbor[]>(INITIAL_NEIGHBORS);
  const [copiedLink, setCopiedLink] = useState(false);

  if (activeModal !== 'friends') return null;

  const tgProfile = getTelegramUserProfile();

  const handleInviteFriend = () => {
    sounds.playClick();
    triggerTelegramHaptic('success');
    
    const shareText = encodeURIComponent('🌾 Присоединяйся к моей 3D ферме в Telegram! Развивай хозяйство, выращивай урожай и торгуй!');
    const shareUrl = encodeURIComponent('https://t.me/SunnysideFarm_bot/game');
    
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.openTelegramLink) {
      (window as any).Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`);
    } else {
      navigator.clipboard?.writeText('https://t.me/SunnysideFarm_bot/game');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSendGift = (id: string) => {
    sounds.playLevelUp();
    triggerTelegramHaptic('success');
    setNeighbors(prev =>
      prev.map(n => (n.id === id ? { ...n, helpedToday: true } : n))
    );
    useGameStore.setState(s => ({ coins: s.coins + 25 }));
    addFloatingText('+25 🪙 Подарок отправлен!', window.innerWidth / 2, window.innerHeight / 2, '#4ADE80');
  };

  return (
    <div className="fixed inset-0 pt-14 sm:pt-16 pb-20 sm:pb-24 z-40 flex flex-col select-none animate-pop-in overflow-hidden game-screen-bg text-amber-100">
      
      {/* ── TOP TABS BAR ── */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 game-screen-header shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('friends');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'friends' ? 'game-tab-btn-active' : 'game-tab-btn'
            }`}
          >
            <Users size={16} />
            <span>Друзья и Соседи</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              setActiveTab('leaderboard');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'leaderboard' ? 'game-tab-btn-active' : 'game-tab-btn'
            }`}
          >
            <Trophy size={16} />
            <span>Таблица лидеров</span>
          </button>
        </div>

        {/* Invite Button Header */}
        <button
          onClick={handleInviteFriend}
          className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-lg active:scale-95 transition-transform cursor-pointer border border-purple-300"
        >
          <UserPlus size={14} />
          <span className="hidden sm:inline">Пригласить</span>
        </button>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-4 pb-12">
          
          {/* ── TAB 1: FRIENDS & NEIGHBORS ── */}
          {activeTab === 'friends' && (
            <>
              {/* Telegram Referral Banner */}
              <div className={`p-4 sm:p-5 rounded-2xl border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isDesign2026
                  ? 'bg-gradient-to-r from-purple-950/50 via-[#181C24] to-indigo-950/50 border-purple-500/30 text-white'
                  : 'hud-parchment border-amber-500 text-[#3B1F0D]'
              }`}>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shrink-0">
                    🎁
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                      <span>Приглашайте друзей в Telegram</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-black font-black uppercase inline-flex items-center gap-1">
                        +250 <CoinSvg />
                      </span>
                    </h3>
                    <p className={`text-xs ${isDesign2026 ? 'text-[#8E939D]' : 'text-[#5C3718]'}`}>
                      Получайте 250 монет и 5 энергии за каждого приглашенного фермера!
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleInviteFriend}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer border border-purple-300 shrink-0"
                >
                  <Share2 size={15} />
                  <span>{copiedLink ? 'Ссылка скопирована!' : 'Поделиться в TG'}</span>
                </button>
              </div>

              {/* Neighbors List */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-extrabold text-[#8E939D] uppercase tracking-wider px-1">
                  Активные соседи ({neighbors.length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {neighbors.map(neighbor => (
                    <div
                      key={neighbor.id}
                      className={`p-3.5 rounded-2xl border shadow flex items-center justify-between gap-3 ${
                        isDesign2026
                          ? 'bg-[#181C24] border-[#242A35] text-white'
                          : 'hud-parchment border-amber-700/60 text-[#3B1F0D]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-inner ${
                            isDesign2026 ? 'bg-[#242A35]' : 'bg-amber-100'
                          }`}>
                            {neighbor.avatar}
                          </div>
                          {neighbor.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="font-bold text-xs sm:text-sm">{neighbor.name}</span>
                          <span className="text-[11px] text-[#8E939D] flex items-center gap-1.5">
                            <span className="text-yellow-400 font-bold">⭐ Ур. {neighbor.level}</span>
                            <span>•</span>
                            <span>{neighbor.isOnline ? '🟢 Онлайн' : 'Вне сети'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Gift / Help Button */}
                      <button
                        onClick={() => handleSendGift(neighbor.id)}
                        disabled={neighbor.helpedToday}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer ${
                          neighbor.helpedToday
                            ? 'bg-[#242A35] text-[#8E939D] border border-transparent cursor-default'
                            : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white border border-emerald-300 shadow-md'
                        }`}
                      >
                        {neighbor.helpedToday ? (
                          <>
                            <Check size={13} className="text-emerald-400" />
                            <span>Помощь отправлена</span>
                          </>
                        ) : (
                          <>
                            <Gift size={13} />
                            <span>Подарок 🎁</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── TAB 2: LEADERBOARD ── */}
          {activeTab === 'leaderboard' && (
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-extrabold text-[#8E939D] uppercase tracking-wider px-1">
                Топ фермеров сезона 🏆
              </span>

              {/* Current User Standing */}
              <div className={`p-4 rounded-2xl border-2 shadow-lg flex items-center justify-between gap-3 ${
                isDesign2026
                  ? 'bg-purple-950/40 border-purple-500 text-white'
                  : 'hud-parchment border-yellow-400 text-[#3B1F0D]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-sm shadow">
                    #4
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm">{tgProfile.name} (Вы)</span>
                    <span className="text-xs text-yellow-400 font-bold">⭐ {level} уровень • 18,450 очков</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-black text-xs">
                  <Sparkles size={14} />
                  <span>В топ 5%</span>
                </div>
              </div>

              {/* Top 5 list */}
              <div className="flex flex-col gap-2 mt-2">
                {[
                  { rank: 1, name: 'Алиса Садовод', avatar: '🌱', score: 36100, reward: '🥇 1,000 🪙' },
                  { rank: 2, name: 'Анна Фермер', avatar: '👩‍🌾', score: 28400, reward: '🥈 500 🪙' },
                  { rank: 3, name: 'Михаил Пасечник', avatar: '🐝', score: 24700, reward: '🥉 250 🪙' },
                  { rank: 4, name: tgProfile.name, avatar: '👨‍🌾', score: 18450, reward: '100 🪙' },
                  { rank: 5, name: 'Дядя Ваня', avatar: '👴', score: 14200, reward: '50 🪙' },
                ].map(item => (
                  <div
                    key={item.rank}
                    className={`p-3 rounded-2xl border shadow flex items-center justify-between gap-3 ${
                      isDesign2026
                        ? item.rank <= 3
                          ? 'bg-[#181C24] border-yellow-500/40 text-white'
                          : 'bg-[#181C24] border-[#242A35] text-white'
                        : 'hud-parchment border-amber-700/60 text-[#3B1F0D]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                        item.rank === 1 ? 'bg-yellow-400 text-black' : item.rank === 2 ? 'bg-slate-300 text-black' : item.rank === 3 ? 'bg-amber-600 text-white' : 'bg-[#242A35] text-[#8E939D]'
                      }`}>
                        {item.rank}
                      </span>
                      <span className="text-xl">{item.avatar}</span>
                      <span className="font-bold text-xs sm:text-sm">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#8E939D] font-mono">{item.score.toLocaleString('ru-RU')} очков</span>
                      <span className="text-xs font-black text-yellow-400">{item.reward}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

import React from 'react';
import { useGameStore } from '../game/gameState';
import { sounds } from '../audio/SoundManager';
import { triggerTelegramHaptic } from '../utils/telegram';
import { CheckCircle2, ChevronRight, X, Sparkles } from 'lucide-react';

const TOTAL_STEPS = 6;

export const TutorialOverlay: React.FC = () => {
  const {
    tutorialStep,
    tutorialCompleted,
    advanceTutorial,
    skipTutorial,
    setSelectedEntity,
  } = useGameStore();

  if (tutorialCompleted || tutorialStep > TOTAL_STEPS) {
    return null;
  }

  const stepsConfig: Record<number, {
    title: string;
    mentorPhrase: string;
    hint: string;
    targetName: string;
    icon: string;
    targetId?: string;
  }> = {
    1: {
      title: 'СБОР ПШЕНИЦЫ',
      mentorPhrase: 'Привет, юный фермер! 🌾 Добро пожаловать на твою новую ферму! Пора собрать спелую пшеницу — нажми на грядку и смахни урожай!',
      hint: 'Нажмите на грядку со спелой пшеницей',
      targetName: 'Спелая грядка',
      icon: '🌾',
      targetId: 'field_1',
    },
    2: {
      title: 'ПОСЕВ СЕМЯН',
      mentorPhrase: 'Отличная работа! 🌾 Теперь давай засеем пустые грядки новыми семенами пшеницы, чтобы урожай рос снова!',
      hint: 'Нажмите на пустую грядку ➔ посадите пшеницу',
      targetName: 'Свободная грядка',
      icon: '🌱',
      targetId: 'field_1',
    },
    3: {
      title: 'КОРМЛЕНИЕ КУР',
      mentorPhrase: 'Смотри, курочки в курятнике проголодались! 🐔 Нажми на курятник и покорми их пшеничным кормом!',
      hint: 'Нажмите на Курятник ➔ Покормить',
      targetName: 'Курятник',
      icon: '🥣',
      targetId: 'ent_chicken_coop_default',
    },
    4: {
      title: 'СБОР СВЕЖИХ ЯИЦ',
      mentorPhrase: 'Сытые курочки снесли свежие яйца! 🥚 Нажми на курятник и собери свежую продукцию в амбар!',
      hint: 'Нажмите на Курятник ➔ Собрать яйца',
      targetName: 'Курятник',
      icon: '🥚',
      targetId: 'ent_chicken_coop_default',
    },
    5: {
      title: 'ВЫПЕЧКА ХЛЕБА',
      mentorPhrase: 'А теперь давай испечем свежий ароматный хлеб! 🍞 Нажми на Пекарню и начни выпечку первой буханки!',
      hint: 'Нажмите на Пекарню ➔ Скрафтить Хлеб',
      targetName: 'Пекарня',
      icon: '🍞',
      targetId: 'ent_bakery_default',
    },
    6: {
      title: 'ОТПРАВКА ЗАКАЗА',
      mentorPhrase: 'Жители соседнего городка прислали заказ! 📋 Нажми на Доску Заказов и отправь наш красный грузовик!',
      hint: 'Нажмите на Доску Заказов ➔ Отправить',
      targetName: 'Доска Заказов',
      icon: '📋',
      targetId: 'ent_order_board_default',
    },
  };

  const current = stepsConfig[tutorialStep] || stepsConfig[1];

  const handleFocusTarget = () => {
    if (current.targetId) {
      sounds.playClick();
      triggerTelegramHaptic('light');
      setSelectedEntity(current.targetId);
    }
  };

  return (
    <div className="fixed top-14 sm:top-16 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-40 select-none animate-fade-in pointer-events-none">
      <div 
        className="pointer-events-auto p-3.5 sm:p-4 rounded-3xl game-dock-tray border-2 border-amber-400/90 shadow-2xl shadow-black/90 text-amber-100 flex flex-col gap-2.5 transform transition-all backdrop-blur-md"
        style={{
          background: 'linear-gradient(180deg, rgba(53, 28, 8, 0.96) 0%, rgba(26, 13, 4, 0.98) 100%)',
          boxShadow: '0 20px 45px rgba(0,0,0,0.85), inset 0 2px 4px rgba(255,255,255,0.2)',
        }}
      >
        {/* Top Mentor Row: Avatar, Name, Step & Close */}
        <div className="flex items-center justify-between gap-2.5 border-b border-amber-900/60 pb-2 px-0.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Friendly Uncle Semyon Avatar with pulsing ring */}
            <div className="relative">
              <div 
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 border-2 border-yellow-200 flex items-center justify-center text-2xl shadow-lg shrink-0"
              >
                👨‍🌾
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-500 border border-black"></span>
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-sm text-yellow-300 game-text-gold truncate">
                  Дядя Семён
                </span>
                <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1.5 py-0.2 rounded-full font-bold">
                  {tutorialStep}/{TOTAL_STEPS}
                </span>
              </div>
              <span className="text-[10.5px] font-bold text-amber-200/80 truncate">
                {current.title}
              </span>
            </div>
          </div>

          {/* Skip Button */}
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('light');
              skipTutorial();
            }}
            className="text-[11px] text-amber-400/70 hover:text-amber-200 underline font-bold cursor-pointer shrink-0 px-1"
            title="Пропустить всё обучение"
          >
            Пропустить
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full h-2 game-badge-slot p-[1px] overflow-hidden rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-green-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(250,204,21,0.7)]"
            style={{ width: `${(tutorialStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Mentor Speech Text */}
        <div className="text-xs sm:text-[12.5px] font-medium text-amber-100/95 leading-snug px-0.5">
          {current.mentorPhrase}
        </div>

        {/* Action Hint Card with Quick Pointer Button */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-black/40 border border-amber-700/60 shadow-inner">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg shrink-0 animate-bounce" style={{ animationDuration: '2s' }}>
              {current.icon}
            </span>
            <span className="text-[11px] font-bold text-yellow-200 game-text-gold truncate">
              {current.hint}
            </span>
          </div>

          {/* Quick Focus / Next button */}
          <button
            onClick={() => {
              sounds.playClick();
              triggerTelegramHaptic('medium');
              if (current.targetId) {
                handleFocusTarget();
              } else {
                advanceTutorial(tutorialStep);
              }
            }}
            className="px-3 py-1.5 rounded-xl game-btn-gold text-amber-950 font-black text-xs flex items-center gap-1 shadow cursor-pointer active:scale-95 shrink-0"
          >
            <span>Показать</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};

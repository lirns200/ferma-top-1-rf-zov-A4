import React from 'react';
import { useGameStore } from '../game/gameState';
import { sounds } from '../audio/SoundManager';
import confetti from 'canvas-confetti';

const TOTAL_STEPS = 9;

export const TutorialOverlay: React.FC = () => {
  const {
    tutorialStep,
    tutorialCompleted,
    introStage,
    advanceTutorial,
    skipTutorial,
    openModal,
    addCoins,
    addGems,
    addXP,
    addFloatingText
  } = useGameStore();

  // If tutorial completed or intro is running, don't show
  if (tutorialCompleted || introStage !== 'completed' || tutorialStep > TOTAL_STEPS) {
    return null;
  }

  const stepsInfo: Record<number, {
    title: string;
    mentorText: string;
    actionHint: string;
    buttonLabel: string;
    icon: string;
    suggestedAction?: () => void;
  }> = {
    1: {
      title: 'ШАГ 1: ФЕРМЕРСКИЙ ДОМ',
      mentorText: 'Приветствую, юный фермер! Я Дядя Семён, староста Долины. Первым делом построим уютный Фермерский Дом! Откройте Магазин, выберите Дом, используйте кнопку 🔄 Повернуть и поставьте на зеленую клетку.',
      actionHint: 'Нажмите кнопку 🚜 Магазин (слева внизу) ➔ вкладка «Здания» ➔ Дом',
      buttonLabel: 'ПОНЯТНО ▶',
      icon: '🏡',
      suggestedAction: () => openModal('shop'),
    },
    2: {
      title: 'ШАГ 2: ПЕРВЫЕ ГРЯДКИ',
      mentorText: 'Отличный дом! Теперь нашей ферме нужны поля для выращивания урожая. Откройте магазин и разместите 4 грядки на свободном газоне рядом с домом.',
      actionHint: 'Магазин 🚜 ➔ Вкладка «Грядки» ➔ поставьте поля',
      buttonLabel: 'ДАЛЕЕ ▶',
      icon: '🌾',
      suggestedAction: () => openModal('shop'),
    },
    3: {
      title: 'ШАГ 3: ПОСЕВ ПШЕНИЦЫ',
      mentorText: 'Пора засеять поля! Нажмите на любую пустую грядку, выберите колосок Пшеницы 🌾 и проведите пальцем или мышкой по всем грядкам.',
      actionHint: 'Нажмите на грядку ➔ проведите Пшеницей 🌾 по полям',
      buttonLabel: 'ДАЛЕЕ ▶',
      icon: '🌱',
    },
    4: {
      title: 'ШАГ 4: СБОР УРОЖАЯ СЕРПОМ',
      mentorText: 'В нашей солнечной долине урожай растет быстро! Когда колоски станут золотыми, нажмите на поле, возьмите Серп 🌾 и смахните созревшую пшеницу.',
      actionHint: 'Нажмите на созревшее поле ➔ смахните Серпом',
      buttonLabel: 'ДАЛЕЕ ▶',
      icon: '🚜',
    },
    5: {
      title: 'ШАГ 5: ЗЕРНОХРАНИЛИЩЕ СИЛОС',
      mentorText: 'Урожая становится больше! Чтобы хранить зерно и семена, постройте Зернохранилище (Силос). Откройте магазин и установите его на ферме.',
      actionHint: 'Магазин 🚜 ➔ вкладка «Здания» ➔ Силос (Silo)',
      buttonLabel: 'ДАЛЕЕ ▶',
      icon: '🥖',
      suggestedAction: () => openModal('shop'),
    },
    6: {
      title: 'ШАГ 6: КУРЯТНИК И КОРМЛЕНИЕ',
      mentorText: 'Время завести первых животных! Поставьте Курятник из вкладки «Животные». Нажмите на него и накормите курочек свежей пшеницей — они снесут свежие яйца!',
      actionHint: 'Магазин 🚜 ➔ «Животные» ➔ Курятник ➔ Покормить 🌾',
      buttonLabel: 'ДАЛЕЕ ▶',
      icon: '🐔',
      suggestedAction: () => openModal('shop'),
    },
    7: {
      title: 'ШАГ 7: ДОСКА ЗАКАЗОВ',
      mentorText: 'Жители соседнего городка ждут свежие продукты! Поставьте Доску Заказов 📋. Выполняйте контракты, и наш красный пикап повезет товары по деревянному мосту в город за монеты и опыт!',
      actionHint: 'Магазин 🚜 ➔ Доска Заказов ➔ Выполнить контракт',
      buttonLabel: 'ДАЛЕЕ ▶',
      icon: '📋',
      suggestedAction: () => openModal('shop'),
    },
    8: {
      title: 'ШАГ 8: ПОЧТОВЫЙ ЯЩИК И ФУРА',
      mentorText: 'У въезда на ферму стоит Почтовый Ящик 📬. Соседи присылают письма с обменом и ежедневные подарки. При подтверждении обмена в Заезд 1 приедет большая грузовая Фура с товарами!',
      actionHint: 'Нажмите на Почтовый Ящик 📬 возле дороги',
      buttonLabel: 'ДАЛЕЕ ▶',
      icon: '📬',
      suggestedAction: () => openModal('mailbox'),
    },
    9: {
      title: 'ШАГ 9: ПРИДОРОЖНАЯ ЛАВКА (РЫНОК)',
      mentorText: 'Поставьте Придорожную Лавку 🏪 возле Заезда 2! В ней вы сможете продавать излишки продуктов другим фермерам по вашей цене. Вы великолепно справились со всеми основами!',
      actionHint: 'Магазин 🚜 ➔ Придорожная Лавка ➔ Завершить обучение',
      buttonLabel: '✓ ЗАВЕРШИТЬ ОБУЧЕНИЕ',
      icon: '🏪',
      suggestedAction: () => openModal('shop'),
    },
  };

  const current = stepsInfo[tutorialStep] || stepsInfo[1];
  const isLastStep = tutorialStep === TOTAL_STEPS;

  const handleNext = () => {
    sounds.playClick();
    if (isLastStep) {
      // Tutorial completion reward
      sounds.playLevelUp();
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
      addCoins(500);
      addGems(25);
      addXP(150);
      addFloatingText('🎉 Обучение завершено! +500 🪙 +25 💎 ✨', 0, 0, '#22C55E');
    }
    advanceTutorial();
  };

  return (
    <div className="fixed top-16 left-3 sm:left-5 z-40 max-w-sm sm:max-w-md pointer-events-auto select-none animate-fade-in">
      <div 
        className="rounded-2xl p-4 sm:p-5 shadow-2xl border-4 border-amber-600 flex flex-col gap-3 text-white"
        style={{
          background: 'linear-gradient(180deg, rgba(61, 34, 8, 0.96) 0%, rgba(35, 18, 6, 0.98) 100%)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.85), inset 0 2px 4px rgba(255,255,255,0.15)',
        }}
      >
        {/* Header with Uncle Semyon Avatar */}
        <div className="flex items-start gap-3.5">
          <div 
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-700 to-yellow-500 border-2 border-yellow-300 flex items-center justify-center text-3xl shadow-lg shrink-0 animate-bounce"
            style={{ animationDuration: '2.5s' }}
          >
            👨‍🌾
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px] text-yellow-400 tracking-wide truncate">
                {current.title}
              </span>
              <button
                onClick={skipTutorial}
                className="text-[9px] text-amber-400/80 hover:text-yellow-200 underline shrink-0 font-sans cursor-pointer"
              >
                Пропустить
              </button>
            </div>
            <p className="text-xs text-amber-100 mt-1.5 font-sans leading-relaxed">
              {current.mentorText}
            </p>
          </div>
        </div>

        {/* Action Hint Banner */}
        <div className="bg-amber-950/80 p-2.5 rounded-xl border border-amber-500/60 flex items-center gap-2">
          <span className="text-lg">{current.icon}</span>
          <span className="text-xs text-yellow-300 font-sans font-medium">
            💡 {current.actionHint}
          </span>
        </div>

        {/* Progress Dots & Buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-amber-800/80">
          {/* Step Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const stepNum = i + 1;
              const isDone = stepNum < tutorialStep;
              const isActive = stepNum === tutorialStep;
              return (
                <div
                  key={stepNum}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-6 bg-yellow-400 shadow-[0_0_8px_#facc15]'
                      : isDone
                      ? 'w-2.5 bg-green-500'
                      : 'w-2 bg-amber-950 border border-amber-700'
                  }`}
                />
              );
            })}
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            {current.suggestedAction && (
              <button
                onClick={current.suggestedAction}
                className="px-3 py-2 bg-amber-700 hover:bg-amber-600 border border-amber-400 rounded-xl text-[9px] font-['Press_Start_2P'] text-yellow-200 shadow active:scale-95 transition-all"
              >
                ОТКРЫТЬ
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl text-[9px] font-['Press_Start_2P'] text-white shadow-lg transition-all active:scale-95 border-2 border-green-300 animate-pulse hover:brightness-110"
              style={{
                background: 'linear-gradient(180deg, #22C55E 0%, #15803D 100%)',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
              }}
            >
              {current.buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

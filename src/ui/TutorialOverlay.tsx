import React from 'react';
import { useGameStore } from '../game/gameState';

const TOTAL = 8;

export const TutorialOverlay: React.FC = () => {
  const { tutorialStep, tutorialCompleted, advanceTutorial, skipTutorial } = useGameStore();
  if (tutorialCompleted || tutorialStep > TOTAL) return null;

  const steps: Record<number, { title: string; text: string; hint: string }> = {
    1: { title: 'Welcome!', text: 'I am Uncle Sam! Let\'s turn this plot into a thriving farm.', hint: 'Press NEXT to start' },
    2: { title: 'Step 1: Plant', text: 'Tap a field, choose wheat and swipe across all plots!', hint: 'Tap any field' },
    3: { title: 'Step 2: Harvest', text: 'Wheat grows fast! Tap a ripe field to harvest with a sickle.', hint: 'Collect the crop' },
    4: { title: 'Step 3: Animals', text: 'Tap the chicken coop and feed the chickens to get eggs!', hint: 'Tap the coop' },
    5: { title: 'Step 4: Build', text: 'Open the shop 🚜 (bottom left) and build new structures.', hint: 'Build from shop' },
    6: { title: 'Step 5: Produce', text: 'Tap a Bakery or Mill and queue a production recipe!', hint: 'Start production' },
    7: { title: 'Step 6: Orders', text: 'Open the Order Board 📋 and send the truck for coins + XP!', hint: 'Fill an order' },
    8: { title: 'All Done!', text: 'You learned all basics! Earn coins, unlock levels and expand!', hint: 'Press FINISH' },
  };

  const cur = steps[tutorialStep] || steps[1];
  const isLast = tutorialStep === TOTAL;

  return (
    <div className="absolute top-20 left-3 sm:left-4 max-w-xs z-30 pointer-events-auto">
      <div className="px-panel flex flex-col gap-3" style={{ padding: '12px 14px' }}>

        {/* Avatar + title */}
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 flex items-center justify-center text-3xl"
            style={{
              width: 52, height: 52,
              border: '3px solid #000',
              background: '#3d2208',
              boxShadow: 'inset 1px 1px 0 #7a4010, inset -1px -1px 0 #0f0600, 2px 2px 0 #000',
            }}
          >
            👨‍🌾
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <span className="px-font text-[7px] text-amber-400 uppercase leading-tight">{cur.title}</span>
              <button onClick={skipTutorial} className="px-font text-[6px] text-amber-600 hover:text-amber-400 underline shrink-0">
                SKIP
              </button>
            </div>
            <p className="px-font text-[6px] text-amber-200 mt-1.5 leading-loose">{cur.text}</p>
          </div>
        </div>

        {/* Hint */}
        <div style={{ borderTop: '2px solid #000', paddingTop: 8 }}>
          <span className="px-font text-[6px] text-amber-500 italic">▶ {cur.hint}</span>
        </div>

        {/* Progress dots + Next */}
        <div className="flex items-center justify-between">
          {/* Dots */}
          <div className="flex items-center gap-1">
            {Array.from({ length: TOTAL }).map((_, i) => {
              const n = i + 1;
              const done = n < tutorialStep;
              const active = n === tutorialStep;
              return (
                <div
                  key={n}
                  style={{
                    width: active ? 14 : 7,
                    height: 7,
                    border: '2px solid #000',
                    background: active ? '#f59e0b' : done ? '#7c4a00' : '#1a0800',
                    boxShadow: active ? '0 0 4px #f59e0b' : 'none',
                    transition: 'all 0.15s',
                  }}
                />
              );
            })}
          </div>

          {/* Step counter + Next */}
          <div className="flex items-center gap-2">
            <span className="px-font text-[6px] text-amber-600">{tutorialStep}/{TOTAL}</span>
            <button
              onClick={() => advanceTutorial()}
              className="px-btn px-btn-green"
              style={{ padding: '5px 10px', fontSize: 7 }}
            >
              {isLast ? '✓ FINISH' : 'NEXT ▶'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

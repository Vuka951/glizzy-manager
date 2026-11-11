'use client';

import { useState } from 'react';
import CareerIntroCutscene from '@/components/games/career/CareerIntroCutscene';
import PreviewTriggerButton from '@/components/preview/PreviewTriggerButton';

export default function CareerIntroPreview() {
  const [introKey, setIntroKey] = useState(0);
  const [showIntro, setShowIntro] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <PreviewTriggerButton
          label={showIntro ? 'Replay' : 'Show'}
          onClick={() => {
            setShowIntro(true);
            setIntroKey(introKey + 1);
          }}
        />
        {showIntro && (
          <PreviewTriggerButton
            label="Hide"
            onClick={() => setShowIntro(false)}
          />
        )}
      </div>
      {showIntro && (
        <div className="flex justify-center">
          <CareerIntroCutscene
            key={introKey}
            onDone={() => setShowIntro(false)}
          />
        </div>
      )}
    </>
  );
}

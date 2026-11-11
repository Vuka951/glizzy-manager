import CareerButton from '@/components/games/career/CareerButton';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import StreetBoard from '@/components/games/career/street/StreetBoard';
import StreetSignPlate from '@/components/games/career/street/StreetSignPlate';

// A short scene hung on the street board: the picture in a slot in the wood,
// its receipt on a slip of paper below it, and the key that moves on
export default function CutsceneBoard({
  title,
  titleExtra,
  stage,
  continueLabel,
  onClose,
  children,
}: {
  title: string;
  titleExtra?: React.ReactNode;
  stage: React.ReactNode;
  continueLabel: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 pt-6 sm:p-3 sm:pt-6">
      <button
        aria-label={continueLabel}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#060912]/75"
      />
      <StreetBoard className="z-10 flex w-full max-w-[33rem] flex-col animate-[bubblein_0.25s_ease-out] phone-landscape:max-w-[46rem]">
        <div className="relative z-10 flex items-center justify-between gap-2 px-1.5 pb-2">
          <StreetSignPlate>{title}</StreetSignPlate>
          {titleExtra}
        </div>
        <div className="flex flex-col phone-landscape:grid phone-landscape:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] phone-landscape:gap-2">
          <div className="relative isolate overflow-hidden rounded-[3px] border border-[#160c05] border-t-[#b8862f] phone-landscape:self-start">
            {stage}
          </div>
          <div className="flex flex-col phone-landscape:justify-between">
            <PaperSheet className="mt-2 flex flex-col gap-1.5 px-3 py-2.5 sm:px-4 phone-landscape:mt-0">
              {children}
            </PaperSheet>
            <CareerButton full className="mt-2 min-h-11" onClick={onClose}>
              {continueLabel}
            </CareerButton>
          </div>
        </div>
      </StreetBoard>
    </div>
  );
}

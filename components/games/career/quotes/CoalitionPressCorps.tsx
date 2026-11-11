const FLASH_MS = 600;
// One barrage: which camera goes off and how long after the cue
const BARRAGE = [
  { camera: 0, after: 0 },
  { camera: 2, after: 110 },
  { camera: 1, after: 230 },
  { camera: 3, after: 380 },
];
const CAMERAS = [
  'left-[6px] bottom-[34px]',
  'left-[30px] bottom-[22px]',
  'right-[30px] bottom-[22px]',
  'right-[6px] bottom-[34px]',
];
const SHOOTERS = [
  'left-[-10px] bottom-[-14px]',
  'left-[16px] bottom-[-24px]',
  'right-[16px] bottom-[-24px]',
  'right-[-10px] bottom-[-14px]',
];

// The press pool crouched at the front of the frame, their flashes going
// off in a barrage at each cue and now and then once the pose is held
export default function CoalitionPressCorps({
  barrages,
  holdFrom,
}: {
  barrages: number[];
  holdFrom?: number;
}) {
  return (
    <>
      {SHOOTERS.map((cls) => (
        <span key={cls} className={`absolute z-40 h-[44px] w-[38px] ${cls}`}>
          <span className="absolute bottom-0 left-0 h-[24px] w-[38px] rounded-t-[16px] bg-slate-950" />
          <span className="absolute bottom-[18px] left-[9px] h-[20px] w-[20px] rounded-full bg-slate-950" />
          <span className="absolute bottom-[22px] left-[11px] h-[12px] w-[16px] rounded-[2px] bg-slate-800 ring-1 ring-slate-950" />
        </span>
      ))}
      {barrages.flatMap((at) =>
        BARRAGE.map(({ camera, after }) => (
          <span
            key={`${at}-${camera}`}
            data-anim="flash"
            data-anim-delay={at + after}
            data-anim-duration={FLASH_MS}
            data-anim-iterations={1}
            className={`absolute z-40 h-[26px] w-[26px] rounded-full bg-slate-50 opacity-0 shadow-[0_0_24px_8px_rgba(248,250,252,0.9)] ${CAMERAS[camera]}`}
          />
        )),
      )}
      {barrages.map((at) => (
        <span
          key={at}
          data-anim="flash"
          data-anim-delay={at}
          data-anim-duration={FLASH_MS + 300}
          data-anim-iterations={1}
          className="absolute inset-0 z-30 bg-slate-50/40 opacity-0"
        />
      ))}
      {holdFrom !== undefined &&
        CAMERAS.map((cls, camera) => (
          <span
            key={cls}
            data-anim="flash"
            data-anim-delay={holdFrom + camera * 530}
            data-anim-duration={1700 + camera * 230}
            className={`absolute z-40 h-[20px] w-[20px] rounded-full bg-slate-50 opacity-0 shadow-[0_0_18px_6px_rgba(248,250,252,0.8)] ${cls}`}
          />
        ))}
    </>
  );
}

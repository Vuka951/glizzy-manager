const CORNERS = ['left-1 top-1', 'right-1 top-1', 'bottom-1 left-1', 'bottom-1 right-1'];

// Four screw heads holding a bank fixture to the wall, steel or old brass
export default function TownBankScrews({ brass = false }: { brass?: boolean }) {
  return CORNERS.map((corner) => (
    <span
      key={corner}
      aria-hidden="true"
      className={`absolute h-1.5 w-1.5 rounded-full shadow-[0_1px_0_rgb(0_0_0/0.5)] ${corner} ${
        brass
          ? 'bg-[radial-gradient(circle_at_35%_35%,#fde68a,#92400e)]'
          : 'bg-[radial-gradient(circle_at_35%_35%,#f1f5f9,#475569)]'
      }`}
    />
  ));
}

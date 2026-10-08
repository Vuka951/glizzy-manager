// A wooden cooking spoon standing on its handle, drawn to fill a 16 by 46
// box so whoever holds it can turn it around the bottom of the handle
export default function WoodenSpoon() {
  return (
    <>
      <span className="absolute bottom-0 left-1/2 h-[30px] w-[5px] -translate-x-1/2 rounded-full bg-gradient-to-b from-yellow-600 to-yellow-700 ring-1 ring-yellow-950/70" />
      <span className="absolute left-0 top-0 h-[20px] w-[16px] rounded-[50%] bg-gradient-to-b from-yellow-500 to-yellow-700 ring-1 ring-yellow-950/70">
        <span className="absolute inset-x-[3px] bottom-[3px] top-[4px] rounded-[50%] bg-yellow-800/80" />
      </span>
    </>
  );
}

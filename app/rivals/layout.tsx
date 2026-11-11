import GamesScale from '@/components/games/GamesScale';

export default function RivalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <span data-dark-only hidden />
      <GamesScale>{children}</GamesScale>
    </>
  );
}

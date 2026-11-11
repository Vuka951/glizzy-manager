import GamesScale from '@/components/games/GamesScale';

export default function ManagerLayout({
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

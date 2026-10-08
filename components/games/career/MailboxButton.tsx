import MailboxIcon from '@/components/icons/MailboxIcon';
import { GAMES_UI } from '@/data/games/locale';

// The mailbox on the scene: shows how many letters wait inside
export default function MailboxButton({
  unread,
  onOpen,
}: {
  unread: number;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      title={GAMES_UI.career.mail.title}
      className={`relative flex h-10 w-11 shrink-0 items-center justify-center rounded-2xl border bg-slate-950/70 backdrop-blur-sm transition hover:-translate-y-0.5 ${
        unread > 0
          ? 'border-amber-400/50 hover:border-amber-400/80'
          : 'border-sky-200/15 opacity-70 hover:border-sky-200/40'
      }`}
    >
      <MailboxIcon flag={unread > 0} className="h-6 w-7" />
      {unread > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-slate-950 bg-red-500 px-1 font-mono text-[10px] font-bold text-white">
          {unread}
        </span>
      )}
    </button>
  );
}

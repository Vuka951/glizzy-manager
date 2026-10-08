import Link from 'next/link';
import Icon from '@/components/icons/Icon';

export default function BackLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 pb-4 text-sm font-medium text-slate-500 transition hover:text-slate-300"
    >
      <Icon name="arrowLeft" className="h-4 w-4" />
      {label}
    </Link>
  );
}

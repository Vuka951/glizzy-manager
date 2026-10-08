import Icon from '@/components/icons/Icon';

export default function BrandMark() {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-frost-border/30 bg-slate-900/60 shadow-lg backdrop-blur-sm">
      <Icon name="hotdog" className="h-6 w-6 text-red-300" />
    </span>
  );
}

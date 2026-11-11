import HintTooltip from '@/components/games/HintTooltip';
import InfoIcon from '@/components/icons/InfoIcon';

// The info button's look, but the text comes up in place on a paper tag
// instead of a modal: a small enamel plate, like CareerIconButton
export default function InfoTip({ text }: { text: string }) {
  return (
    <HintTooltip
      text={text}
      className="rounded-[4px] border-2 border-[#cbd5e1] bg-[#1e3a8a] p-1 text-[#ffffff] shadow-[0_2px_0_rgba(2,6,23,0.6)] transition before:absolute before:-inset-2 before:content-[''] hover:border-[#ffffff]"
    >
      <InfoIcon className="h-3 w-3" />
    </HintTooltip>
  );
}

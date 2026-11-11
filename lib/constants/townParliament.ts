import type { SponsorId } from '@/lib/utils/careerSave';

// The governing party's rally cloth on the assembly: the field, the stripes
// and lettering, and a darker fold shade
export type PartyCloth = { field: string; accent: string; shade: string };

export const PARTY_CLOTH: Record<SponsorId, PartyCloth> = {
  blue: { field: 'fill-[#f8fafc]', accent: 'fill-[#2563eb]', shade: 'fill-[#cbd5e1]' },
  green: { field: 'fill-[#047857]', accent: 'fill-[#fde68a]', shade: 'fill-[#065f46]' },
  yellow: { field: 'fill-[#0b0f19]', accent: 'fill-[#fde047]', shade: 'fill-[#1f2937]' },
  red: { field: 'fill-[#b91c1c]', accent: 'fill-[#fef2f2]', shade: 'fill-[#7f1d1d]' },
};

// When each drop banner starts to unroll after the government changes, ms
export const RALLY_UNROLL_STEP = 260;

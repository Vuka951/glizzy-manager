import { CHARACTER_ROSTER } from '@/data/games/roster';
import { sampleCareer } from '@/components/preview/sampleCareer';
const slugs = CHARACTER_ROSTER.map((c) => c.slug);
process.stdout.write(JSON.stringify(sampleCareer({ slugs, playerSlug: 'vuka', year: 4, season: 2 })));

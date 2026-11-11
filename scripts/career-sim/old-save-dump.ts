import { previewRoster } from '@/components/preview/previewRoster';
import { sampleCareer } from '@/components/preview/sampleCareer';
const slugs = previewRoster().map((c) => c.slug);
process.stdout.write(JSON.stringify(sampleCareer({ slugs, playerSlug: slugs[0], year: 4, season: 2 })));

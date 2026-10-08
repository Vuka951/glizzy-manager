import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Safari and most crawlers ask for /favicon.ico whatever the head says, so
// the SVG icon is rasterised once at build time and served under that path.
// Keeps the repo free of bitmap files while closing the 404
const SIZE = 32;
const iconData = await readFile(join(process.cwd(), 'app/icon.svg'), 'base64');
const iconSrc = `data:image/svg+xml;base64,${iconData}`;

export async function GET() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={iconSrc} width={SIZE} height={SIZE} alt="" />
    ),
    { width: SIZE, height: SIZE },
  );
}

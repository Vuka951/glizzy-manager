'use client';

import { useState, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import { GAMES_UI } from '@/data/games/locale';

const D = GAMES_UI.career.report.download;
// The paper's own cream, so the capture has no transparent corners
const PAPER_BACKGROUND = '#fffbeb';
const PIXEL_RATIO = 2;
const JPEG_QUALITY = 0.9;

type Format = 'png' | 'pdf';

// Two frames: one for React's commit to land, one for layout to settle
function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
  });
}

const SVG_COLOR_PROPERTIES = ['fill', 'stroke', 'color', 'stop-color'] as const;

// The chart colours come from utility classes, and the clone the capture
// draws loses them on SVG nodes. Writing the computed values onto the live
// nodes for the length of the shot keeps every line and bar its colour
function pinSvgColors(root: HTMLElement): () => void {
  const pinned: { el: SVGElement; prop: string; prev: string }[] = [];
  root.querySelectorAll<SVGElement>('svg, svg *').forEach((el) => {
    const computed = window.getComputedStyle(el);
    SVG_COLOR_PROPERTIES.forEach((prop) => {
      const value = computed.getPropertyValue(prop);
      if (!value) return;
      pinned.push({ el, prop, prev: el.style.getPropertyValue(prop) });
      el.style.setProperty(prop, value);
    });
  });
  return () => {
    pinned.forEach(({ el, prop, prev }) => {
      if (prev) el.style.setProperty(prop, prev);
      else el.style.removeProperty(prop);
    });
  };
}

// Saves the printed report as a picture or a one-page PDF of that picture.
// Anything marked data-no-capture (these buttons) stays out of the shot
export default function ReportDownload({
  targetRef,
  fileName,
  onPrepare,
  onFinish,
}: {
  targetRef: RefObject<HTMLElement | null>;
  fileName: string;
  // The paper can print more for the shot than it shows on screen: both
  // charts instead of the toggled one. Prepare flips it, finish flips it back
  onPrepare?: () => void;
  onFinish?: () => void;
}) {
  const [busy, setBusy] = useState<Format | null>(null);
  const [failed, setFailed] = useState(false);

  // The picture keeps every pixel; the PDF takes a JPEG, which a page of
  // paper compresses to a few hundred kilobytes instead of tens of megabytes
  const capture = async (format: Format) => {
    const node = targetRef.current;
    if (!node) throw new Error('report not mounted');
    const { toJpeg, toPng } = await import('html-to-image');
    const restore = pinSvgColors(node);
    try {
      return await shoot(node, format, { toJpeg, toPng });
    } finally {
      restore();
    }
  };

  const shoot = async (
    node: HTMLElement,
    format: Format,
    lib: Pick<typeof import('html-to-image'), 'toJpeg' | 'toPng'>,
  ) => {
    const { toJpeg, toPng } = lib;
    const options = {
      pixelRatio: PIXEL_RATIO,
      cacheBust: true,
      backgroundColor: PAPER_BACKGROUND,
      filter: (child: HTMLElement) =>
        !(child instanceof HTMLElement && child.dataset.noCapture !== undefined),
    };
    const dataUrl =
      format === 'png'
        ? await toPng(node, options)
        : await toJpeg(node, { ...options, quality: JPEG_QUALITY });
    return { dataUrl, width: node.offsetWidth, height: node.offsetHeight };
  };

  const save = async (format: Format) => {
    if (busy) return;
    setBusy(format);
    setFailed(false);
    try {
      if (onPrepare) {
        flushSync(onPrepare);
        await nextPaint();
      }
      const shot = await capture(format);
      if (format === 'png') {
        const link = document.createElement('a');
        link.href = shot.dataUrl;
        link.download = `${fileName}.png`;
        link.click();
      } else {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF({
          orientation: shot.width > shot.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [shot.width, shot.height],
          hotfixes: ['px_scaling'],
          compress: true,
        });
        doc.addImage(shot.dataUrl, 'JPEG', 0, 0, shot.width, shot.height);
        doc.save(`${fileName}.pdf`);
      }
    } catch {
      setFailed(true);
    } finally {
      onFinish?.();
      setBusy(null);
    }
  };

  const button = (format: Format, label: string) => (
    <button
      type="button"
      onClick={() => void save(format)}
      disabled={busy !== null}
      className="rounded-sm border-2 border-slate-900/40 bg-white/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-wait disabled:opacity-60"
    >
      {busy === format ? D.busy : label}
    </button>
  );

  return (
    <div
      data-no-capture
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {button('png', D.png)}
      {button('pdf', D.pdf)}
      {failed && (
        <span className="text-[10px] font-semibold text-red-700">{D.failed}</span>
      )}
    </div>
  );
}

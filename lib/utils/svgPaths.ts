export function ovalPath(cx: number, cy: number, rx: number, ry: number = rx): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
}

export function zigzagPath(x0: number, x1: number, y: number, step: number, amplitude: number): string {
  const parts = [`M ${x0} ${y}`];
  let x = x0;
  let up = true;
  while (x < x1) {
    x = Math.min(x + step, x1);
    parts.push(`L ${x} ${up ? y - amplitude : y + amplitude}`);
    up = !up;
  }
  return parts.join(' ');
}

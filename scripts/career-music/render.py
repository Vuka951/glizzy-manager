"""Regenerate the four Glizi Career season loops:
    python3 scripts/career-music/render.py
Writes music-0..3.mp3 next to this script; copy them into
public/games/audio/music/ once you have listened to them."""

import subprocess, time, wave
import numpy as np
from synth import SR
from seasons import SEASONS

TARGET_RMS = 0.070   # the old loops sat at 0.058-0.063, noise bed included
EDGE = int(0.05 * SR)  # matches EDGE_TRIM in useSeasonMusic.ts

def write_wav(path, stereo):
    data = (np.clip(stereo, -1, 1) * 32767).astype(np.int16).T.reshape(-1)
    w = wave.open(path, 'wb')
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(data.tobytes()); w.close()

for name, label, fn in SEASONS:
    t0 = time.time()
    x = fn()
    x = x - x.mean(axis=1, keepdims=True)
    x *= TARGET_RMS / np.sqrt((x ** 2).mean())
    # wrap-pad so the region Web Audio actually loops is exactly the loop
    padded = np.concatenate([x[:, -EDGE:], x, x[:, :EDGE]], axis=1)
    write_wav(name + '.wav', padded)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', name + '.wav',
                    '-codec:a', 'libmp3lame', '-b:a', '128k',
                    '-map_metadata', '-1', '-id3v2_version', '0', '-write_id3v1', '0',
                    '-fflags', '+bitexact', name + '.mp3'], check=True)
    # An mp3 whose last frame holds only a handful of samples can come back
    # from the decoder a few samples longer, which slides the loop point off
    # the seam. Catch that here rather than in the browser.
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', name + '.mp3',
                    '-ac', '2', '-ar', str(SR), '_roundtrip.wav'], check=True)
    with wave.open('_roundtrip.wav') as rt:
        drift = rt.getnframes() - padded.shape[1]
    if drift:
        print('  WARNING: %s round-trips %+d samples, loop point will be off' % (name, drift))
    seam = np.abs(x[:, 0] - x[:, -1]).max()
    body = np.abs(x).mean()
    print('%s %-10s %5.2fs peak=%.2f rms=%.3f seam-step=%.3f (mean|x|=%.3f) %.1fs'
          % (name, label, padded.shape[1] / SR, np.abs(padded).max(),
             np.sqrt((x ** 2).mean()), seam, body, time.time() - t0))

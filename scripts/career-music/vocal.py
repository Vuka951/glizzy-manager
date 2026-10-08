"""Turns a spoken word into a sung one.

The samples in vocals/ are ElevenLabs takes (eleven_multilingual_v2, the
voice named by XI_VOICE_ID), cut to the word by the timestamps its
speech-to-text returned. The takes are not in the repo, so this module is
reference only unless you render your own. "Pcinja" only survives the round trip spelled
"Pchinja"; "patlidzan" and "krv" had to be read inside a sentence.

Nothing here resynthesises the voice: TD-PSOLA moves the pitch marks around
and leaves the formants alone, so the word stays the word.
"""

import os
import wave

import numpy as np

from synth import SR, mtof, lowpass

VOCALS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vocals")


def load_word(name):
    with wave.open(os.path.join(VOCALS, name + ".wav")) as w:
        frames = w.readframes(w.getnframes())
    return np.frombuffer(frames, dtype=np.int16).astype(float) / 32768


def _f0_contour(x, frame=2048, hop=256):
    """Autocorrelation pitch track, unvoiced frames filled with the median."""
    f0 = np.zeros(len(x) // hop + 1)
    voiced = np.zeros_like(f0)
    lo, hi = int(SR / 400), int(SR / 70)
    for i in range(len(f0)):
        seg = x[i * hop : i * hop + frame]
        if len(seg) < frame or np.sqrt((seg**2).mean()) < 0.02:
            continue
        seg = (seg - seg.mean()) * np.hanning(frame)
        ac = np.correlate(seg, seg, "full")[frame - 1 :]
        k = lo + int(np.argmax(ac[lo:hi]))
        if ac[k] / (ac[0] + 1e-9) < 0.3:
            continue
        f0[i] = SR / k
        voiced[i] = min(1.0, ac[k] / (ac[0] + 1e-9) / 0.6)
    med = np.median(f0[f0 > 0]) if (f0 > 0).any() else 120.0
    f0[f0 == 0] = med
    return f0, voiced, hop


def _pitch_curve(notes, n_out, glide):
    """One held pitch per note, joined by a short portamento. A word that
    moves through the chord reads as a sung line; a word on one flat pitch
    reads as somebody talking."""
    if not isinstance(notes, (list, tuple)):
        notes = [notes]
    curve = np.empty(n_out)
    span = n_out / len(notes)
    ramp = max(int(glide * SR), 1)
    for i, note in enumerate(notes):
        a, b = int(i * span), int((i + 1) * span)
        curve[a:b] = mtof(note)
        if i:
            lo = max(0, a - ramp // 2)
            hi = min(n_out, a + ramp // 2)
            curve[lo:hi] = np.linspace(mtof(notes[i - 1]), mtof(note), hi - lo)
    return curve


def sing(name, notes, dur, vibrato=0.006, tilt=3200.0, attack=0.55, tremolo=0.10,
         vib_rate=4.6, cents=0.0):
    """Re-pitch a word onto a line and stretch it to `dur`, spending the extra
    time on the vowels and letting the consonants pass at their own speed. The
    slow swell matters as much as the pitch: a word that fades in belongs to
    the arrangement, a word that starts on its consonant is an interruption."""
    x = load_word(name)
    f0, voiced, hop = _f0_contour(x)

    # Local stretch: only the voiced, energetic parts get pulled long
    per_sample = np.interp(np.arange(len(x)), np.arange(len(voiced)) * hop, voiced)
    per_sample = np.clip(per_sample, 0, 1)
    room = per_sample.sum() / SR
    in_dur = len(x) / SR
    if room < 1e-3:
        return np.zeros(int(dur * SR))
    scale = 1.0 + max(0.0, dur - in_dur) / room
    local = 1.0 + (scale - 1.0) * per_sample
    out_time = np.cumsum(local) / SR  # output time for each input sample

    n_out = int(dur * SR)
    out = np.zeros(n_out + 8192)
    period_at = np.interp(np.arange(len(x)), np.arange(len(f0)) * hop, f0)

    # Pitch marks: one per glottal period. Grains have to be centred on these,
    # not on arbitrary samples, or successive grains disagree about phase and
    # the voice turns into a buzz.
    marks = []
    pos = 0.0
    while pos < len(x):
        marks.append(int(pos))
        pos += SR / max(period_at[int(pos)], 60.0)
    marks = np.array(marks)

    o = 0.0
    t = np.arange(n_out) / SR
    curve = _pitch_curve(notes, n_out, 0.09) * 2 ** (cents / 1200.0)
    wobble = 1.0 + vibrato * np.sin(2 * np.pi * vib_rate * t)
    while o < n_out:
        a = float(np.interp(o / SR, out_time, np.arange(len(x))))
        m = int(marks[min(np.searchsorted(marks, a), len(marks) - 1)])
        p_in = int(SR / max(period_at[m], 60.0))
        lo, hi = max(0, m - p_in), min(len(x), m + p_in)
        if hi - lo > 8:
            grain = x[lo:hi] * np.hanning(hi - lo)
            start = int(o) - (m - lo)
            if start < 0:
                grain, start = grain[-start:], 0
            out[start : start + len(grain)] += grain
        i = min(int(o), n_out - 1)
        o += SR / (curve[i] * wobble[i])

    out = lowpass(out[:n_out], tilt)
    swell = np.ones(n_out)
    rise = min(int(attack * SR), n_out // 2)
    fall = min(int(0.35 * dur * SR), n_out - rise)
    swell[:rise] = 0.5 * (1 - np.cos(np.pi * np.linspace(0, 1, rise)))
    swell[n_out - fall :] *= 0.5 * (1 + np.cos(np.pi * np.linspace(0, 1, fall)))
    swell *= 1.0 - tremolo * (0.5 - 0.5 * np.cos(2 * np.pi * (0.55 * vib_rate / 4.6) * t))
    out = out * swell
    peak = np.abs(out).max()
    return out / peak if peak > 0 else out


# interval above the lead, gain, pan, entry delay in seconds, vibrato rate,
# tuning offset in cents, lowpass. A section never lands together and never
# agrees on the pitch to the cent, and that disagreement is the choir sound.
CHOIR = [
    (0, 1.00, -0.30, 0.00, 4.6, +5.0, 3000.0),
    (7, 0.58, 0.34, 0.045, 5.1, -6.0, 3400.0),
    (12, 0.50, -0.16, 0.022, 4.2, +8.0, 4200.0),
    (16, 0.32, 0.44, 0.061, 5.5, -7.0, 4800.0),
    (19, 0.20, 0.10, 0.034, 3.9, +4.0, 5200.0),
]


def choir(name, notes, dur):
    """The word sung by a stack of voices a chord apart. Only the bottom voice
    sits near the speaker's own register, so it is the one carrying the word;
    the rest are there to make it shimmer."""
    base = notes if isinstance(notes, (list, tuple)) else [notes]
    layers = []
    for step, gain, pan, delay, rate, cents, tilt in CHOIR:
        voice = sing(name, [n + step for n in base], dur - delay,
                     tilt=tilt, vib_rate=rate, cents=cents,
                     attack=0.55 + delay * 2)
        layers.append((voice, delay, gain, pan))
    return layers

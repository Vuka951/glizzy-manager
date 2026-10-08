"""Instrument voices. Drums included: the kick is a pitch-swept sine, the hats
and snaps are short tuned bursts, so nothing here reaches for a noise source."""

import numpy as np
from synth import SR, adsr, expdecay, lowpass, partials, saw_w, square_w


def kick(dur=0.34, top=118.0, bottom=44.0, click=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = bottom + (top - bottom) * np.exp(-t * 34)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * expdecay(n, 0.085)
    snap = np.sin(2 * np.pi * 900 * t) * expdecay(n, 0.004) * click
    return body + snap


def tom(freq=190.0, dur=0.3):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = freq * (1 + 0.5 * np.exp(-t * 26))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * expdecay(n, 0.09)


def tick(freq=3400.0, dur=0.05, tau=0.011):
    """Hat stand-in: a tuned burst two-thirds of an octave wide, gone in 50ms."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    v = np.zeros(n)
    for ratio, gain in ((1.0, 1.0), (1.51, 0.7), (2.03, 0.5), (2.73, 0.4), (3.61, 0.3)):
        if freq * ratio > SR * 0.45:
            break
        v += gain * np.sin(2 * np.pi * freq * ratio * t)
    return v * expdecay(n, tau)


def jingle(freq=5200.0, dur=0.16):
    """Sleigh bells: a fistful of tuned bursts landing a few milliseconds
    apart, so the ear hears one rattle instead of five pitches."""
    n = int(dur * SR)
    out = np.zeros(n)
    for mult, offset, gain in ((1.0, 0.0000, 1.0), (1.19, 0.0016, 0.85),
                               (1.41, 0.0031, 0.7), (1.73, 0.0047, 0.5),
                               (2.11, 0.0062, 0.35)):
        f = freq * mult
        if f > SR * 0.45:
            continue
        i = int(offset * SR)
        t = np.arange(n - i) / SR
        out[i:] += gain * np.sin(2 * np.pi * f * t) * expdecay(n - i, 0.030)
    return out


def snap(freq=1150.0, dur=0.16):
    n = int(dur * SR)
    t = np.arange(n) / SR
    v = np.zeros(n)
    for ratio, gain in ((1.0, 1.0), (1.63, 0.8), (2.41, 0.6), (3.11, 0.4)):
        if freq * ratio > SR * 0.45:
            break
        v += gain * np.sin(2 * np.pi * freq * ratio * t)
    return v * expdecay(n, 0.017)


def glass(freq, dur, tau=0.30):
    """Bell/glockenspiel: a few inharmonic partials over a fast-decaying body."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    ratios = [1.0, 2.0, 3.01, 4.17, 5.43, 6.79, 8.21, 10.4]
    gains = [1.0, 0.45, 0.3, 0.18, 0.12, 0.09, 0.06, 0.04]
    out = np.zeros(n)
    for r, g in zip(ratios, gains):
        if freq * r > SR * 0.45:
            break
        out += g * np.sin(2 * np.pi * freq * r * t) * expdecay(n, tau / (1 + 0.8 * r))
    return out


def marimba(freq, dur, tau=0.16):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for ratio, gain, scale in ((1.0, 1.0, 1.0), (4.0, 0.35, 0.22), (10.0, 0.14, 0.09), (17.0, 0.07, 0.05)):
        if freq * ratio > SR * 0.45:
            break
        out += gain * np.sin(2 * np.pi * freq * ratio * t) * expdecay(n, tau * scale)
    return out


def pluck(freq, dur, bright=1.0, tau=0.16):
    k = 16
    w = [bright ** (i) / (i + 1) for i in range(k)]
    d = [tau / (1 + 0.55 * i) for i in range(k)]
    return partials(freq, dur, w, d)


def rubber_bass(freq, dur, glide=0.0):
    """Round square-wave bass with an optional slide up into the note."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = freq * (1 - glide * np.exp(-t * 40))
    ph = 2 * np.pi * np.cumsum(f) / SR
    v = sum(w * np.sin(k * ph) for k, w in enumerate(square_w(11), start=1))
    v = lowpass(v, 1830.0)
    return v * adsr(n, 0.006, 0.09, 0.7, 0.05)


def saw_bass(freq, dur, detune=0.004, cut=1900.0):
    n = int(dur * SR)
    a = partials(freq, dur, saw_w(22))
    b = partials(freq * (1 + detune), dur, saw_w(22))
    return lowpass(a + b, cut) * adsr(n, 0.004, 0.12, 0.75, 0.06)


def sub(freq, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    v = np.sin(2 * np.pi * freq * t) + 0.22 * np.sin(2 * np.pi * freq * 2 * t)
    return v * adsr(n, 0.01, 0.2, 0.8, 0.12)


def pad(freqs, dur, cut=2200.0, attack=0.9, detune=0.006):
    n = int(dur * SR)
    out = np.zeros(n)
    for f in freqs:
        out += partials(f, dur, saw_w(14), detune=detune, vibrato=0.004)
    out = lowpass(out, cut)
    return out * adsr(n, attack, 0.4, 0.85, min(0.9, dur * 0.35)) / max(len(freqs), 1)


def whistle(freq, dur, vib=0.02):
    n = int(dur * SR)
    t = np.arange(n) / SR
    ph = 2 * np.pi * freq * (t + vib * np.sin(2 * np.pi * 5.5 * t) / (2 * np.pi * 5.5))
    v = np.sin(ph) + 0.12 * np.sin(3 * ph) + 0.05 * np.sin(5 * ph)
    return v * adsr(n, 0.05, 0.15, 0.8, 0.14)


def brass(freq, dur, cut=2600.0):
    n = int(dur * SR)
    v = partials(freq, dur, saw_w(18), detune=0.008)
    return lowpass(v, cut) * adsr(n, 0.035, 0.12, 0.7, 0.1)

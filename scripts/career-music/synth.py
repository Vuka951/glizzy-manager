"""Tiny additive-synthesis engine. Every voice is built from sine partials, so
there is no noise source anywhere in the signal path."""

import numpy as np

SR = 44100


def mtof(midi):
    return 440.0 * 2 ** ((midi - 69) / 12.0)


def fftconv(x, h):
    n = 1 << int(np.ceil(np.log2(len(x) + len(h) - 1)))
    y = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)
    return y[: len(x)]


def fir_lowpass(cut, taps=257):
    m = (np.arange(taps) - (taps - 1) / 2) / SR
    h = 2 * cut * np.sinc(2 * cut * m) * np.hanning(taps)
    return h / h.sum()


def fir_highpass(cut, taps=257):
    lp = fir_lowpass(cut, taps)
    d = np.zeros(taps)
    d[(taps - 1) // 2] = 1.0
    return d - lp


def lowpass(x, cut):
    return fftconv(x, fir_lowpass(cut))


def highpass(x, cut):
    return fftconv(x, fir_highpass(cut))


def adsr(n, a, d, s, r):
    """Attack/decay/sustain/release in seconds, s is the sustain level."""
    a, d, r = max(int(a * SR), 1), max(int(d * SR), 1), max(int(r * SR), 1)
    body = max(n - r, 1)
    env = np.full(n, float(s))
    env[:a] = np.linspace(0, 1, a)[: min(a, n)]
    if a < body:
        seg = min(d, body - a)
        env[a : a + seg] = np.linspace(1, s, d)[:seg]
        env[a + seg : body] = s
    env[body:] = np.linspace(env[body - 1] if body else s, 0, n - body)
    return env


def expdecay(n, tau, taper=0.2):
    """Exponential decay that is forced smoothly to zero over its last stretch.
    An exponential never reaches zero on its own, so cutting the buffer at the
    note length leaves a step in the waveform, and a step is a click."""
    env = np.exp(-np.arange(n) / (tau * SR))
    k = min(n, max(int(n * taper), 128))
    if k > 1:
        env[n - k :] *= 0.5 * (1 + np.cos(np.pi * np.linspace(0, 1, k)))
    return env


def partials(freq, dur, weights, decays=None, detune=0.0, vibrato=0.0):
    """Sum of harmonics. `decays` gives a per-harmonic time constant so plucked
    voices lose their top end the way a struck string does."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    if vibrato:
        t = t + vibrato * np.sin(2 * np.pi * 5.2 * t) / (2 * np.pi * 5.2)
    for i, w in enumerate(weights):
        if w == 0:
            continue
        k = i + 1
        f = freq * k
        if f > SR * 0.45:
            break
        voice = np.sin(2 * np.pi * f * t)
        if detune:
            voice = 0.6 * voice + 0.4 * np.sin(2 * np.pi * f * (1 + detune) * t + 0.7)
        if decays is not None:
            voice = voice * expdecay(n, decays[i])
        out += w * voice
    return out


def saw_w(k):
    return [1.0 / i for i in range(1, k + 1)]


def square_w(k):
    return [1.0 / i if i % 2 else 0.0 for i in range(1, k + 1)]


def comb(x, delay, g):
    y = x.copy()
    for i in range(delay, len(y), delay):
        n = min(delay, len(y) - i)
        y[i : i + n] += g * y[i - delay : i - delay + n]
    return y


def allpass(x, delay, g):
    xd = np.zeros_like(x)
    xd[delay:] = x[:-delay]
    y = -g * x + xd
    for i in range(delay, len(y), delay):
        n = min(delay, len(y) - i)
        y[i : i + n] += g * y[i - delay : i - delay + n]
    return y


def reverb(x, size=1.0, damp=6000.0):
    """Schroeder comb/allpass network: pure delay lines, no noise impulse."""
    combs = [1557, 1617, 1491, 1422, 1277, 1356]
    wet = np.zeros_like(x)
    for d in combs:
        wet += comb(x, int(d * size), 0.79) / len(combs)
    wet = lowpass(wet, damp)
    for d in (225, 556, 441):
        wet = allpass(wet, int(d * size), 0.5)
    return wet * 0.28


def bandpass(x, lo, hi):
    return lowpass(highpass(x, lo), hi)


def master_eq(stereo, rumble=38.0, presence=0.0, air=0.0, low_trim=0.0):
    """Corrective tilt on the finished mix: drop subsonic rumble, lift the
    midrange the chords live in, and open the top the tuned bursts sit in."""
    out = []
    for ch in stereo:
        y = highpass(ch, rumble)
        if low_trim:
            y = y - low_trim * lowpass(y, 130.0)
        if presence:
            y = y + presence * bandpass(y, 700.0, 2600.0)
        if air:
            y = y + air * highpass(y, 4200.0)
        out.append(y)
    return np.stack(out)


class Track:
    """A stereo bus you drop mono voices onto at a given time and pan."""

    def __init__(self, seconds):
        self.n = int(seconds * SR)
        self.buf = np.zeros((2, self.n))

    FADE = int(0.004 * SR)

    def add(self, voice, at, gain=1.0, pan=0.0):
        i = int(at * SR)
        if i >= self.n:
            return
        v = voice[: self.n - i].copy()
        # Nothing enters the mix with a step at either end, whatever the voice
        # did or where the buffer ran out
        f = min(self.FADE, len(v) // 2)
        if f > 1:
            ramp = 0.5 * (1 - np.cos(np.pi * np.linspace(0, 1, f)))
            v[:f] *= ramp
            v[-f:] *= ramp[::-1]
        left = gain * np.sqrt((1 - pan) / 2) * np.sqrt(2)
        right = gain * np.sqrt((1 + pan) / 2) * np.sqrt(2)
        self.buf[0, i : i + len(v)] += left * v
        self.buf[1, i : i + len(v)] += right * v


def mix_buses(dry, ghost, size, damp, wet, ghost_size, ghost_damp):
    """The ghost bus is nearly all reverb: the word should sound like it is
    coming from another room, present but never in front."""
    def verb(buf, sz, dp):
        return np.stack([reverb(buf[0], sz, dp), reverb(buf[1], sz, dp)])

    return dry + wet * verb(dry, size, damp) + 0.30 * ghost + 1.6 * verb(ghost, ghost_size, ghost_damp)


def fold_loop(stereo, loop_len):
    """Wrap everything ringing past the loop point back onto the head, so the
    seam is inaudible when Web Audio jumps from loopEnd to loopStart."""
    n = int(loop_len * SR)
    tail = stereo[:, n:]
    out = stereo[:, :n].copy()
    m = min(tail.shape[1], n)
    out[:, :m] += tail[:, :m]
    return out

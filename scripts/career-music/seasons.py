"""The four season loops, in calendar order: Ledeno, Patlidzan, Letnje, Krvavo.

Each runs about a minute in two halves, so a full listen does not repeat the
same eight bars six times, and each carries one word sung by a voice mixed far
enough back that you only catch it if you go looking: Glizi in the winter
edition, Pcinja in the summer one, Patlidzan and Krv in their own.
"""

import numpy as np

from synth import SR, Track, fold_loop, master_eq, mix_buses, mtof
import vocal
import voices as V

TAIL = 6.0


class Song:
    def __init__(self, bpm, bars):
        self.spb = 60.0 / bpm
        self.length = bars * 4 * self.spb
        self.track = Track(self.length + TAIL)
        self.ghost = Track(self.length + TAIL)

    def t(self, beat):
        return beat * self.spb

    def add(self, voice, beat, gain=1.0, pan=0.0):
        self.track.add(voice, self.t(beat), gain, pan)

    def word(self, name, notes, beat, dur, gain=1.0, pan=0.0):
        for voice, delay, level, spread in vocal.choir(name, notes, dur):
            self.ghost.add(voice, self.t(beat) + delay, gain * level,
                           max(-1.0, min(1.0, pan + spread)))

    def finish(self, size, damp, wet=1.0, ghost_size=1.7, ghost_damp=2400, **eq):
        mix = mix_buses(self.track.buf, self.ghost.buf, size, damp, wet, ghost_size, ghost_damp)
        return fold_loop(master_eq(mix, **eq), self.length)


def arp_cycle(chord, count):
    """Up then down through the chord, without repeating the turning points."""
    seq = list(chord) + list(chord)[-2:0:-1]
    return [seq[i % len(seq)] for i in range(count)]


# ---------------------------------------------------------------- Ledeno ----
# Winter with the tree up: sleigh pulse, glockenspiel, warm major sevenths.
# The second half brings in a bell melody over the same ground.
def ledeno():
    s = Song(90, 24)
    prog = [
        (36, [52, 55, 59, 64]),
        (45, [52, 55, 60, 64]),
        (41, [53, 57, 60, 64]),
        (43, [50, 55, 59, 62]),
        (40, [52, 55, 59, 62]),
        (41, [53, 57, 60, 67]),
        (36, [52, 55, 59, 64]),
        (45, [52, 55, 60, 64]),
        (38, [53, 57, 60, 64]),
        (43, [53, 55, 60, 62]),
        (41, [53, 57, 60, 67]),
        (36, [50, 55, 59, 64]),
    ]
    carol = [
        (0.0, 1.0, 72), (1.0, 0.5, 71), (1.5, 0.5, 69), (2.0, 2.0, 67),
        (4.0, 1.0, 69), (5.0, 1.0, 71), (6.0, 2.0, 72),
    ]
    for block, (root, chord) in enumerate(prog):
        b0 = block * 8
        late = block >= 6
        s.add(V.pad([mtof(m - 12) for m in chord], s.t(8.4), cut=2600, attack=1.2), b0, gain=0.40)
        for i, m in enumerate(arp_cycle(chord, 16)):
            s.add(V.glass(mtof(m), 1.2, tau=0.45), b0 + i * 0.5,
                  gain=0.58, pan=-0.42 if i % 2 else 0.42)
        for i, m in enumerate(arp_cycle(chord, 8)):
            s.add(V.glass(mtof(m + 12), 0.7, tau=0.25), b0 + 6 + i * 0.25,
                  gain=0.13, pan=0.25 if i % 2 else -0.25)
        if late:
            for beat, dur, m in carol:
                s.add(V.glass(mtof(m), s.t(dur) + 0.6, tau=0.9), b0 + beat, gain=0.26, pan=-0.12)
        for bar in range(2):
            bb = b0 + bar * 4
            for beat, dur, note in ((0.0, 1.4, root), (1.5, 0.5, root),
                                    (2.0, 1.2, root), (3.5, 0.5, root + 7)):
                s.add(V.sub(mtof(note), s.t(dur)), bb + beat, gain=1.05)
            s.add(V.kick(), bb + 0.0, gain=0.72)
            s.add(V.kick(), bb + 2.0, gain=0.58)
            if bar == 1 and block % 2 == 1:
                s.add(V.kick(), bb + 3.5, gain=0.40)
            # the sleigh: on every eighth, heavier on the beat
            for i in range(8):
                s.add(V.jingle(5200 if i % 2 else 4600), bb + i * 0.5,
                      gain=0.16 if i % 2 == 0 else 0.10, pan=0.34 if i % 2 else -0.28)
            s.add(V.tick(2450, 0.08, 0.02), bb + 2.0, gain=0.06, pan=-0.3)
    # one long choral swell per loop, held across the chord change
    s.word("glizi", [45, 41], 40.0, 7.0, gain=0.30)
    return s.finish(size=1.2, damp=7200, wet=1.0, rumble=32, low_trim=0.12,
                    presence=0.55, air=1.6)


# ------------------------------------------------------------- Patlidzan ----
# Spring: rubber-band bass, off-beat stabs, a whistle that will not sit still
def patlidzan():
    s = Song(105, 24)
    prog = [
        (40, [52, 59, 62, 66]),
        (45, [52, 57, 61, 66]),
        (36, [52, 55, 59, 64]),
        (47, [54, 57, 62, 66]),
        (45, [52, 55, 60, 64]),
        (47, [54, 57, 59, 64]),
        (40, [52, 59, 62, 66]),
        (43, [50, 55, 59, 62]),
        (41, [53, 57, 60, 64]),
        (45, [52, 57, 61, 66]),
        (36, [52, 55, 59, 64]),
        (47, [54, 57, 59, 66]),
    ]
    groove = [
        (0.00, 0.24, 0, 0.10), (0.50, 0.22, 0, 0.0), (0.75, 0.22, 12, 0.0),
        (1.50, 0.24, 0, 0.0), (2.00, 0.22, 7, 0.0), (2.25, 0.20, 0, 0.0),
        (3.00, 0.24, 12, 0.06), (3.50, 0.45, 10, 0.0),
    ]
    lead = [
        (0.0, 1.0, 71), (1.0, 0.5, 74), (1.5, 0.5, 76), (2.0, 1.5, 74),
        (3.5, 0.5, 71), (4.0, 1.0, 69), (5.0, 1.0, 66), (6.0, 2.0, 64),
    ]
    for block, (root, chord) in enumerate(prog):
        b0 = block * 8
        s.add(V.pad([mtof(m - 12) for m in chord], s.t(8.4), cut=1900, attack=0.7), b0, gain=0.20)
        for bar in range(2):
            bb = b0 + bar * 4
            for beat, dur, step, glide in groove:
                s.add(V.rubber_bass(mtof(root + step), s.t(dur), glide=glide), bb + beat, gain=0.62)
            for off, pan in ((1.5, -0.35), (3.25, 0.35)):
                for m in chord:
                    s.add(V.brass(mtof(m), s.t(0.35), cut=3000), bb + off, gain=0.22, pan=pan)
            s.add(V.kick(0.30), bb + 0.0, gain=0.66)
            s.add(V.kick(0.26), bb + 1.75, gain=0.44)
            s.add(V.kick(0.26), bb + 2.5, gain=0.40)
            s.add(V.snap(), bb + 1.0, gain=0.30, pan=-0.2)
            s.add(V.snap(), bb + 3.0, gain=0.30, pan=0.2)
            for i in range(8):
                s.add(V.tick(3900, 0.045, 0.008), bb + i * 0.5,
                      gain=0.075 if i % 2 else 0.045, pan=0.34)
            s.add(V.pluck(mtof(chord[0] + 12), 0.6, bright=0.7), bb + 2.75, gain=0.16, pan=-0.4)
        if block in (2, 3, 4, 5, 9, 10, 11):
            for beat, dur, m in lead:
                s.add(V.whistle(mtof(m), s.t(dur)), b0 + beat, gain=0.26, pan=-0.15)
    s.word("patlidzan", [40, 43, 40], 48.0, 6.5, gain=0.163)
    return s.finish(size=0.82, damp=5600, wet=0.8, rumble=32, low_trim=0.10,
                    presence=0.35, air=1.2)


# ----------------------------------------------------------------- Letnje ----
# The loud one: four on the floor, marimba sixteenths, horn stabs on the offbeat
def letnje():
    s = Song(120, 28)
    prog = [
        (36, [52, 55, 57, 62]),
        (45, [52, 55, 60, 64]),
        (41, [53, 57, 60, 67]),
        (43, [50, 55, 59, 62]),
        (45, [52, 55, 60, 64]),
        (41, [53, 57, 60, 67]),
        (36, [52, 55, 57, 62]),
        (40, [52, 55, 59, 62]),
        (45, [52, 55, 60, 64]),
        (38, [53, 57, 60, 65]),
        (43, [50, 55, 59, 62]),
        (41, [53, 57, 60, 67]),
        (45, [52, 55, 60, 64]),
        (43, [50, 55, 59, 67]),
    ]
    lead = [
        (0.0, 0.5, 76), (0.5, 0.5, 79), (1.0, 1.0, 81), (2.0, 0.5, 79),
        (2.5, 0.5, 76), (3.0, 1.0, 72), (4.0, 0.75, 74), (4.75, 0.75, 76),
        (5.5, 2.5, 79),
    ]
    for block, (root, chord) in enumerate(prog):
        b0 = block * 8
        s.add(V.pad([mtof(m) for m in chord], s.t(8.4), cut=3000, attack=0.5), b0, gain=0.16)
        for i, m in enumerate(arp_cycle(chord, 32)):
            up = 12 if (i // 8) % 2 else 0
            s.add(V.marimba(mtof(m + up), 0.55), b0 + i * 0.25,
                  gain=0.42, pan=-0.4 + 0.8 * ((i % 4) / 3))
        for bar in range(2):
            bb = b0 + bar * 4
            for i, step in enumerate([0, 0, 7, 0, 12, 7, 0, 4]):
                s.add(V.saw_bass(mtof(root + step), s.t(0.45), cut=1500), bb + i * 0.5, gain=0.34)
                s.add(V.sub(mtof(root + step - 12), s.t(0.45)), bb + i * 0.5, gain=0.44)
            for beat in (0, 1, 2, 3):
                s.add(V.kick(0.30), bb + beat, gain=0.70 if beat % 2 == 0 else 0.56)
            s.add(V.snap(1280), bb + 1.0, gain=0.34, pan=-0.15)
            s.add(V.snap(1280), bb + 3.0, gain=0.34, pan=0.15)
            for i in range(8):
                s.add(V.tick(4200, 0.07 if i % 2 else 0.04, 0.014 if i % 2 else 0.006),
                      bb + i * 0.5, gain=0.10 if i % 2 else 0.05, pan=0.36)
            for off, pan in ((1.5, -0.45), (3.5, 0.45)):
                for m in chord:
                    s.add(V.brass(mtof(m), s.t(0.4), cut=3600), bb + off, gain=0.24, pan=pan)
        if block in (3, 4, 5, 10, 11, 12, 13):
            for beat, dur, m in lead:
                s.add(V.whistle(mtof(m), s.t(dur), vib=0.012), b0 + beat, gain=0.20, pan=-0.1)
    s.word("pcinja", [43, 40], 48.0, 6.0, gain=0.37)
    return s.finish(size=0.9, damp=6800, wet=0.7, rumble=32, low_trim=0.10,
                    presence=0.35, air=1.1)


# ----------------------------------------------------------------- Krvavo ----
# Autumn: a tolling bell, sixteenth-note saw bass and toms underneath, with a
# minor second grinding away in the pad
def krvavo():
    s = Song(96, 24)
    prog = [
        (38, [53, 57, 60, 62]),
        (39, [51, 55, 58, 62]),
        (38, [53, 57, 60, 62]),
        (46, [53, 57, 58, 62]),
        (39, [51, 55, 58, 62]),
        (45, [49, 55, 58, 64]),
        (38, [53, 57, 60, 62]),
        (43, [51, 55, 58, 62]),
        (39, [51, 55, 58, 65]),
        (38, [53, 57, 60, 65]),
        (46, [53, 57, 58, 62]),
        (45, [49, 55, 58, 64]),
    ]
    lead = [
        (0.0, 1.0, 74), (1.0, 0.5, 72), (1.5, 0.5, 70), (2.0, 2.0, 69),
        (4.0, 1.0, 70), (5.0, 0.5, 69), (5.5, 0.5, 67), (6.0, 2.0, 65),
    ]
    for block, (root, chord) in enumerate(prog):
        b0 = block * 8
        cluster = [mtof(m - 12) for m in chord] + [mtof(chord[0] - 11)]
        s.add(V.pad(cluster, s.t(8.4), cut=1500, attack=1.6), b0, gain=0.26)
        s.add(V.glass(mtof(root - 12), 5.0, tau=2.4), b0, gain=0.30, pan=-0.2)
        s.add(V.glass(mtof(root), 3.0, tau=1.4), b0 + 4, gain=0.16, pan=0.25)
        for bar in range(2):
            bb = b0 + bar * 4
            for i in range(16):
                step = 12 if i in (6, 14) else 10 if i == 11 else 0
                s.add(V.saw_bass(mtof(root + step), s.t(0.22), detune=0.007, cut=1300),
                      bb + i * 0.25, gain=0.30 if i % 4 == 0 else 0.20)
            s.add(V.sub(mtof(root - 12), s.t(2.0)), bb, gain=0.62)
            s.add(V.kick(0.36, top=140, bottom=42), bb + 0.0, gain=0.56)
            s.add(V.kick(0.30, top=130, bottom=44), bb + 2.5, gain=0.50)
            s.add(V.tom(150, 0.34), bb + 1.5, gain=0.30, pan=-0.35)
            s.add(V.tom(196, 0.30), bb + 3.0, gain=0.26, pan=0.35)
            s.add(V.tom(262, 0.24), bb + 3.5, gain=0.20, pan=0.1)
            s.add(V.snap(920), bb + 2.0, gain=0.26)
            for off in (0.75, 1.75, 2.75, 3.75):
                s.add(V.tick(3100, 0.06, 0.013), bb + off, gain=0.13, pan=0.3)
        if block in (2, 3, 4, 5, 8, 9, 10, 11):
            for beat, dur, m in lead:
                s.add(V.brass(mtof(m), s.t(dur), cut=2600), b0 + beat, gain=0.28, pan=-0.12)
    s.word("krv", [53, 50], 48.0, 7.0, gain=0.15)
    return s.finish(size=1.25, damp=4200, wet=1.1, rumble=32, low_trim=0.10,
                    presence=0.60, air=1.7)


SEASONS = [
    ("music-0", "Ledeno", ledeno),
    ("music-1", "Patlidzan", patlidzan),
    ("music-2", "Letnje", letnje),
    ("music-3", "Krvavo", krvavo),
]

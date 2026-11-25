"""Procedural cartoon SFX + a small original music bed. No samples, no licences needed.

Usage (mix):  python sfx.py mix <cues.json> <timemap.json> <narration.wav> <out.wav> <duration>
cues.json: [[design_time, "name", gain_db], ...]
"""
import json
import sys

import numpy as np
from scipy import signal

SR = 44100
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.002, d=0.1):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
    return e


def sweep(f0, f1, d, kind='exp'):
    t = t_(d)
    if kind == 'exp':
        f = f0 * (f1 / f0) ** (t / d)
    else:
        f = f0 + (f1 - f0) * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype='band', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype='high', fs=SR, output='sos'), x)


def noise(d):
    return rng.standard_normal(int(SR * d))


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def moving_bp(x, centers, q=1.5, block=256):
    """band-pass whose centre follows `centers` (array per block)."""
    out = np.zeros_like(x)
    nb = len(x) // block + 1
    cs = np.interp(np.linspace(0, 1, nb), np.linspace(0, 1, len(centers)), centers)
    zi = None
    for i in range(nb):
        seg = x[i * block:(i + 1) * block]
        if not len(seg):
            break
        c = cs[i]
        sos = signal.butter(2, [c / (1 + 1 / q), min(c * (1 + 1 / q), SR / 2 - 100)], btype='band', fs=SR, output='sos')
        if zi is None or zi.shape != (sos.shape[0], 2):
            zi = np.zeros((sos.shape[0], 2))
        y, zi = signal.sosfilt(sos, seg, zi=zi)
        out[i * block:i * block + len(seg)] = y
    return out


# ---------------- effects ----------------
def pop(pitch=1.0):
    d = 0.09
    s = sweep(900 * pitch, 260 * pitch, d) * env(int(SR * d), 0.001, 0.035)
    click = hp(noise(0.006), 3000) * 0.3
    s[:len(click)] += click
    return norm(s, 0.8)


def whoosh(d=0.38, lo=300, hi=2600, under=False):
    n = noise(d)
    cs = np.geomspace(lo, hi, 40) if not under else np.geomspace(180, 900, 40)
    y = moving_bp(n, np.concatenate([cs, cs[::-1][:10]]), q=1.2)
    t = t_(d)
    e = np.sin(np.pi * t / d) ** 1.6
    return norm(y * e, 0.7)


def ding(f=1568, d=0.9):
    t = t_(d)
    s = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * k) for a, m, k in [(1, 1, 4), (0.5, 2.01, 6), (0.3, 3.0, 9), (0.15, 4.2, 12)])
    s *= np.minimum(1, t / 0.002)
    return norm(s, 0.6)


def chime():
    out = np.zeros(int(SR * 1.2))
    for i, f in enumerate([2093, 2637, 3136, 4186]):
        dd = ding(f, 0.8) * 0.6
        o = int(SR * 0.06 * i)
        out[o:o + len(dd)] += dd
    return norm(out, 0.6)


def punch():
    d = 0.22
    t = t_(d)
    body = sweep(140, 45, d) * np.exp(-t / 0.06)
    hit = lp(noise(d), 2500) * np.exp(-t / 0.015)
    return norm(np.tanh(2.5 * (body + 0.6 * hit)), 0.95)


def cloud(d=1.0):
    n = noise(d)
    br = lp(np.cumsum(n) / 50, 500)
    t = t_(d)
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * 13 * t)
    y = br * trem * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.2)
    y = norm(y, 0.6)
    for k in range(6):  # little hits inside the cloud
        p = punch() * 0.5
        o = int(SR * (0.08 + k * 0.15))
        y[o:o + len(p)] += p[:len(y) - o]
    return norm(y, 0.9)


def rip(d=0.4):
    out = np.zeros(int(SR * d))
    t = 0
    while t < d - 0.02:
        g = bp(noise(0.012), 1200 + 2500 * t / d, 5000) * np.hanning(int(SR * 0.012))
        o = int(SR * t)
        out[o:o + len(g)] += g * (0.6 + 0.4 * rng.random())
        t += 0.006 + 0.01 * rng.random()
    return norm(out, 0.8)


def whip():
    sw = whoosh(0.16, 500, 4000) * 0.6
    crack = hp(noise(0.05), 2500) * np.exp(-t_(0.05) / 0.006)
    crack = np.tanh(4 * crack)
    out = np.zeros(len(sw) + len(crack))
    out[:len(sw)] += sw
    out[len(sw) - 200:len(sw) - 200 + len(crack)] += crack
    return norm(out, 0.95)


def chomp():
    t = t_(0.18)
    thump = sweep(110, 60, 0.18) * np.exp(-t / 0.05)
    crunch = bp(noise(0.18), 700, 3000) * np.exp(-t / 0.04) * (0.5 + 0.5 * (rng.random(len(t)) > 0.7))
    a = thump + 0.8 * crunch
    out = np.concatenate([a, np.zeros(int(SR * 0.04)), 0.7 * a])
    return norm(out, 0.9)


def slide_down(d=0.8):
    t = t_(d)
    f = 900 * (380 / 900) ** (t / d) * (1 + 0.02 * np.sin(2 * np.pi * 6 * t))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return norm(s * np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.15), 0.5)


def boing(d=0.6):
    t = t_(d)
    f = 180 + 140 * np.sin(2 * np.pi * 11 * t) * np.exp(-t * 5) + 80 * t
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.5)
    return norm(s, 0.7)


def bass_drop(d=1.0):
    t = t_(d)
    s = sweep(120, 32, d) * np.exp(-t * 1.2)
    s = np.tanh(3 * s) + 0.4 * lp(noise(d), 200) * np.exp(-t * 6)
    return norm(s, 0.95)


def power_up(d=0.9):
    t = t_(d)
    f = 180 * (1300 / 180) ** (t / d)
    saw = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (0.7 + 0.3 * np.sin(2 * np.pi * 18 * t))
    return norm(lp(saw, 4000) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.05 + 0.2), 0.5)


def knock():
    def one():
        t = t_(0.14)
        return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(420, 40), (690, 55), (1150, 70)])
    a = one()
    out = np.concatenate([a, np.zeros(int(SR * 0.09)), a * 0.8])
    return norm(out, 0.8)


def water_drop():
    d = 0.12
    s = sweep(500, 1700, d) * np.exp(-t_(d) / 0.04)
    return norm(s, 0.6)


def beep():
    t = t_(0.08)
    b = signal.square(2 * np.pi * 880 * t) * 0.5
    b = lp(b, 3000)
    return norm(np.concatenate([b, np.zeros(int(SR * 0.05)), b]), 0.4)


def snip():
    c = hp(noise(0.02), 3000) * np.exp(-t_(0.02) / 0.003)
    return norm(np.concatenate([c, np.zeros(int(SR * 0.07)), c]), 0.6)


def bubbles(n=6, d=0.9):
    out = np.zeros(int(SR * d))
    for k in range(n):
        b = sweep(300 + 500 * rng.random(), 900 + 900 * rng.random(), 0.06) * np.exp(-t_(0.06) / 0.02)
        o = int(SR * (k * d / n + 0.03 * rng.random()))
        out[o:o + len(b)] += b[:len(out) - o]
    return norm(out, 0.5)


def dizzy(d=0.9):
    out = np.zeros(int(SR * d))
    for k in range(5):
        c = sweep(2600, 3600, 0.08) * np.hanning(int(SR * 0.08))
        o = int(SR * k * 0.16)
        out[o:o + len(c)] += c
    return norm(out, 0.35)


def impact():
    return norm(np.tanh(1.5 * (punch() + np.pad(bass_drop(0.6), (0, 0))[:len(punch())])), 0.95)


def giggle():
    out = np.zeros(int(SR * 0.9))
    for k, f in enumerate([700, 760, 820, 760]):
        t = t_(0.12)
        v = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.15 * np.sin(2 * np.pi * 30 * t))) / SR) * np.sin(np.pi * t / 0.12)
        o = int(SR * k * 0.17)
        out[o:o + len(v)] += v
    return norm(out, 0.35)


SFX = dict(pop=pop, pop_hi=lambda: pop(1.5), pop_lo=lambda: pop(0.7), whoosh=whoosh, whoosh_under=lambda: whoosh(0.5, under=True),
           ding=ding, chime=chime, punch=punch, cloud=cloud, rip=rip, whip=whip, chomp=chomp, slide_down=slide_down, boing=boing,
           bass_drop=bass_drop, power_up=power_up, knock=knock, water_drop=water_drop, beep=beep, snip=snip, bubbles=bubbles,
           dizzy=dizzy, impact=impact, giggle=giggle)


# ---------------- music: original sneaky pizzicato bed ----------------
def pluck(f, d, bright=0.5):
    """Karplus-Strong plucked string."""
    n = int(SR * d)
    p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * (0.994 - 0.01 * (1 - bright))
    return out


def music(dur, bpm=112):
    beat = 60 / bpm
    out = np.zeros(int(SR * (dur + 2)))
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    # D minor sneaky walking bass (2 bars x 4), original pattern
    bass = [38, 41, 45, 41, 43, 46, 45, 44, 38, 41, 45, 48, 46, 45, 43, 40]
    mel = [None, 62, None, 65, 64, None, 62, None, None, 69, None, 67, 65, 64, 62, None,
           None, 62, None, 65, 64, None, 67, None, 69, None, 70, 69, None, 65, 62, None]
    cache = {}

    def note(m, d, br, g):
        k = (m, round(d, 3), br)
        if k not in cache:
            cache[k] = pluck(hz(m), d, br)
        return cache[k] * g

    nbeats = int(dur / beat) + 1
    for b in range(nbeats):
        o = int(SR * b * beat)
        x = note(bass[b % len(bass)], beat * 0.9, 0.3, 0.9)
        out[o:o + len(x)] += x[:len(out) - o]
        # offbeat tick + snap on 2 and 4
        tick = hp(noise(0.03), 7000) * np.exp(-t_(0.03) / 0.008) * 0.12
        oo = int(SR * (b + 0.5) * beat)
        out[oo:oo + len(tick)] += tick[:len(out) - oo]
        if b % 2 == 1:
            sn = bp(noise(0.06), 1500, 5000) * np.exp(-t_(0.06) / 0.015) * 0.35
            out[o:o + len(sn)] += sn[:len(out) - o]
    for i in range(nbeats * 2):
        m = mel[i % len(mel)]
        if m is None:
            continue
        o = int(SR * i * beat / 2)
        x = note(m, beat * 0.45, 0.8, 0.45)
        out[o:o + len(x)] += x[:len(out) - o]
    out = out[:int(SR * dur)]
    fade = np.ones_like(out)
    fl = int(SR * 1.5)
    fade[-fl:] = np.linspace(1, 0, fl)
    fade[:int(SR * 0.3)] = np.linspace(0, 1, int(SR * 0.3))
    return norm(lp(out, 6000) * fade, 0.9)


def warp(td, tm):
    """design time -> audio time (inverse of the stage's map)."""
    for i in range(len(tm) - 1):
        a0, d0 = tm[i]
        a1, d1 = tm[i + 1]
        if td < d1 or i == len(tm) - 2:
            return a0 + (td - d0) * (a1 - a0) / (d1 - d0)
    return td


def db(x):
    return 10 ** (x / 20)


def rms(x):
    return np.sqrt(np.mean(x ** 2) + 1e-12)


def mix(cues_p, tm_p, narr_p, out_p, dur):
    from scipy.io import wavfile
    dur = float(dur)
    cues = json.load(open(cues_p))
    tm = json.load(open(tm_p))['timemap']
    sr, narr = wavfile.read(narr_p)
    narr = narr.astype(np.float64)
    if narr.ndim > 1:
        narr = narr.mean(1)
    narr /= 32768.0
    assert sr == SR
    n = int(SR * dur)
    vo = np.zeros(n)
    vo[:min(n, len(narr))] = narr[:n]
    vo = vo / (np.max(np.abs(vo)) or 1) * db(-3)
    fx = np.zeros(n)
    cache = {}
    for td, name, g in cues:
        ta = warp(td, tm)
        if name not in cache:
            cache[name] = SFX[name]()
        s = cache[name] * db(g)
        o = int(SR * ta)
        if o >= n:
            continue
        fx[o:o + len(s)] += s[:n - o]
    bed = music(dur)
    # music sits ~24 dB under the voice
    bed *= rms(vo[vo != 0]) / rms(bed) * db(-24)
    # gentle ducking of the bed while the narrator speaks
    talk = np.convolve(np.abs(vo) > 0.02, np.ones(SR // 10) / (SR // 10), 'same')
    bed *= 1 - 0.35 * np.clip(talk * 3, 0, 1)
    out = vo + fx + bed
    out = np.tanh(out * 1.1) / 1.1
    wavfile.write(out_p, SR, (out * 32767).astype(np.int16))
    print('mixed', out_p, round(dur, 2), 's')


if __name__ == '__main__':
    if sys.argv[1] == 'mix':
        mix(*sys.argv[2:7])
    elif sys.argv[1] == 'demo':
        from scipy.io import wavfile
        parts = []
        for k, f in SFX.items():
            parts += [f(), np.zeros(int(SR * 0.35))]
        wavfile.write(sys.argv[2], SR, (np.concatenate(parts) * 0.9 * 32767).astype(np.int16))
        print(list(SFX))

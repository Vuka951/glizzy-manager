export type AudioChannel = 'sfx' | 'music' | 'voice';

export type GameAudioSettings = {
  volume: number;
  muted: boolean;
  sfxMuted: boolean;
  musicMuted: boolean;
  voiceMuted: boolean;
  sfxVolume: number;
  musicVolume: number;
  voiceVolume: number;
};

const STORAGE_KEY = 'glizzy-audio-settings';

const DEFAULT_SETTINGS: GameAudioSettings = {
  volume: 0.8,
  muted: false,
  sfxMuted: false,
  musicMuted: false,
  voiceMuted: false,
  sfxVolume: 1,
  musicVolume: 1,
  voiceVolume: 1,
};

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedSettings: GameAudioSettings = DEFAULT_SETTINGS;
let cacheInitialized = false;

function clampLevel(value: unknown, fallback: number): number {
  const level = Number(value);
  return Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : fallback;
}

function parseSettings(raw: string | null): GameAudioSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<GameAudioSettings>;
    return {
      volume: clampLevel(parsed.volume, DEFAULT_SETTINGS.volume),
      muted: Boolean(parsed.muted),
      sfxMuted: Boolean(parsed.sfxMuted),
      musicMuted: Boolean(parsed.musicMuted),
      voiceMuted: Boolean(parsed.voiceMuted),
      sfxVolume: clampLevel(parsed.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
      musicVolume: clampLevel(parsed.musicVolume, DEFAULT_SETTINGS.musicVolume),
      voiceVolume: clampLevel(parsed.voiceVolume, DEFAULT_SETTINGS.voiceVolume),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const gameAudio = {
  load(): GameAudioSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return DEFAULT_SETTINGS;
    }
    if (!cacheInitialized || raw !== cachedRaw) {
      cacheInitialized = true;
      cachedRaw = raw;
      cachedSettings = parseSettings(raw);
    }
    return cachedSettings;
  },
  save(settings: GameAudioSettings): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage can be unavailable (private mode); settings are best-effort
    }
    listeners.forEach((listener) => listener());
  },
  setVolume(volume: number): void {
    gameAudio.save({
      ...gameAudio.load(),
      volume: clampLevel(volume, DEFAULT_SETTINGS.volume),
      muted: false,
    });
  },
  toggleMute(): void {
    const current = gameAudio.load();
    gameAudio.save({ ...current, muted: !current.muted });
  },
  toggleChannel(channel: AudioChannel): void {
    const current = gameAudio.load();
    const key = `${channel}Muted` as const;
    gameAudio.save({ ...current, [key]: !current[key] });
  },
  setChannelVolume(channel: AudioChannel, volume: number): void {
    gameAudio.save({
      ...gameAudio.load(),
      [`${channel}Volume`]: clampLevel(volume, 1),
      [`${channel}Muted`]: false,
    });
  },
  scaled(base: number, channel?: AudioChannel): number {
    const settings = gameAudio.load();
    if (settings.muted) return 0;
    if (!channel) return Math.min(1, base * settings.volume);
    if (settings[`${channel}Muted`]) return 0;
    return Math.min(1, base * settings.volume * settings[`${channel}Volume`]);
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getServerSnapshot(): GameAudioSettings {
    return DEFAULT_SETTINGS;
  },
};

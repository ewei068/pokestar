import type { FrameSound } from "./soundCues";
import type { SoundClip } from "./soundConfig";

/** Web Audio clock and decoded-buffer cache for the battle presentation layer. */
export class SoundPlayer {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private active = new Set<AudioBufferSourceNode>();
  private epoch = 0;

  async unlock(): Promise<boolean> {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.connect(this.context.destination);
    }
    await this.context.resume();
    return this.context.state === "running";
  }

  setVolume(volume: number) {
    if (this.master) this.master.gain.value = volume;
  }

  private load(src: string): Promise<AudioBuffer | null> {
    const cached = this.buffers.get(src);
    if (cached) return cached;
    const promise = fetch(src).then(async response => {
      if (!response.ok) throw new Error(`${src}: HTTP ${response.status}`);
      return this.context!.decodeAudioData(await response.arrayBuffer());
    }).catch(() => { this.buffers.delete(src); return null; });
    this.buffers.set(src, promise);
    return promise;
  }

  /** Warm a few files at a time so phone playback does not start 66 fetches at once. */
  async warm(clips: SoundClip[]) {
    let next = 0;
    await Promise.all(Array.from({ length: 3 }, async () => {
      while (next < clips.length && this.context) {
        const clip = clips[next++];
        await this.load(clip.src);
      }
    }));
  }

  async play(sound: Pick<FrameSound, "clip" | "delayMs" | "maxSeconds">): Promise<boolean | null> {
    const context = this.context, destination = this.master;
    if (!context || !destination || context.state !== "running") return null;
    const epoch = this.epoch;
    const requestedAt = context.currentTime;
    const buffer = await this.load(sound.clip.src);
    if (epoch !== this.epoch || context.state !== "running") return null;
    if (!buffer) return false;
    const intendedAt = requestedAt + sound.delayMs / 1000;
    const startAt = Math.max(intendedAt, context.currentTime);
    const lateBy = startAt - intendedAt;
    const offset = sound.clip.offsetSeconds + lateBy;
    const duration = Math.min(buffer.duration - offset, sound.maxSeconds - lateBy);
    if (duration <= 0) return null;
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.connect(gain).connect(destination);
    const level = sound.clip.gain ?? 1;
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(level, startAt + Math.min(0.01, duration / 4));
    if (buffer.duration - offset > duration) {
      gain.gain.setValueAtTime(level, startAt + Math.max(0.01, duration - 0.2));
      gain.gain.linearRampToValueAtTime(0, startAt + duration);
    }
    source.onended = () => this.active.delete(source);
    this.active.add(source);
    source.start(startAt, offset);
    source.stop(startAt + duration);
    return true;
  }

  stopAll() {
    this.epoch++;
    for (const source of this.active) {
      try { source.stop(); } catch { /* already ended */ }
    }
    this.active.clear();
  }

  dispose() {
    this.stopAll();
    this.buffers.clear();
    void this.context?.close();
    this.context = null;
    this.master = null;
  }
}

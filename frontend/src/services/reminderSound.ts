import type { ReminderSoundType } from "@/services/reminderApi";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.15,
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playWebAudioPattern(soundType: ReminderSoundType) {
  const ctx = getCtx();
  void ctx.resume();

  switch (soundType) {
    case "bell":
      playTone(880, 0.35, "sine", 0.2);
      setTimeout(() => playTone(660, 0.4, "sine", 0.18), 200);
      break;
    case "soft":
      playTone(440, 0.6, "sine", 0.08);
      break;
    case "urgent":
      for (let i = 0; i < 3; i++) {
        setTimeout(() => playTone(1046, 0.12, "square", 0.12), i * 180);
      }
      break;
    case "silent":
      break;
    case "chime":
    case "default":
    default:
      playTone(523, 0.25, "sine", 0.16);
      setTimeout(() => playTone(784, 0.35, "sine", 0.14), 120);
      break;
  }
}

const mp3Paths: Partial<Record<ReminderSoundType, string>> = {
  chime: "/sounds/chime.mp3",
  bell: "/sounds/bell.mp3",
  soft: "/sounds/soft.mp3",
  urgent: "/sounds/urgent.mp3",
  default: "/sounds/chime.mp3",
};

export async function playReminderSound(soundType: ReminderSoundType = "chime"): Promise<void> {
  if (soundType === "silent") return;

  const path = mp3Paths[soundType];
  if (path) {
    try {
      const audio = new Audio(path);
      audio.volume = soundType === "urgent" ? 0.9 : 0.6;
      await audio.play();
      return;
    } catch {
      /* fall through to Web Audio */
    }
  }

  playWebAudioPattern(soundType);
}

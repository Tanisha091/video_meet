// Simple notification sounds using Web Audio API
let audioContext: AudioContext | null = null;

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const playBeep = (frequency: number, duration: number, volume: number = 0.3) => {
  const context = initAudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(volume, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + duration);
};

export const playUserJoinSound = () => {
  // Pleasant ascending chime
  playBeep(600, 0.1);
  setTimeout(() => playBeep(800, 0.15), 100);
};

export const playUserLeaveSound = () => {
  // Descending tone
  playBeep(800, 0.1);
  setTimeout(() => playBeep(600, 0.15), 100);
};

export const playMessageSound = () => {
  // Quick notification beep
  playBeep(700, 0.1);
};

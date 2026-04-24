export const playClockInBeep = () => {
  try {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime + start);
      gain.gain.setValueAtTime(0, audioContext.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + start + duration);
      osc.start(audioContext.currentTime + start);
      osc.stop(audioContext.currentTime + start + duration);
    };
    playNote(587.33, 0, 0.15); // D5
    playNote(739.99, 0.1, 0.15); // F#5
    playNote(880.00, 0.2, 0.3); // A5
    setTimeout(() => audioContext.close(), 1000);
  } catch (err) {
    console.warn('Clock-in audio failed');
  }
};

export const playClockOutBeep = () => {
  try {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime + start);
      gain.gain.setValueAtTime(0, audioContext.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + start + duration);
      osc.start(audioContext.currentTime + start);
      osc.stop(audioContext.currentTime + start + duration);
    };
    playNote(880.00, 0, 0.15); // A5
    playNote(739.99, 0.1, 0.15); // F#5
    playNote(587.33, 0.2, 0.4); // D5
    setTimeout(() => audioContext.close(), 1000);
  } catch (err) {
    console.warn('Clock-out audio failed');
  }
};

export const playIdentityVerifiedBeep = () => {
  try {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime + start);
      gain.gain.setValueAtTime(0, audioContext.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + start + duration);
      osc.start(audioContext.currentTime + start);
      osc.stop(audioContext.currentTime + start + duration);
    };
    playNote(783.99, 0, 0.15); // G5
    playNote(1046.50, 0.15, 0.3); // C6
    setTimeout(() => audioContext.close(), 1000);
  } catch (err) {
    console.warn('Identity verification audio failed');
  }
};

export const playScanCompleteBeep = () => {
  try {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime + start);
      gain.gain.setValueAtTime(0, audioContext.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + start + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + start + duration);
      osc.start(audioContext.currentTime + start);
      osc.stop(audioContext.currentTime + start + duration);
    };
    playNote(1046.50, 0, 0.05);
    playNote(1318.51, 0.07, 0.05);
    playNote(1567.98, 0.14, 0.1);
    setTimeout(() => audioContext.close(), 600);
  } catch (err) {
    console.warn('Scan complete audio failed');
  }
};

export const playSuccessBeep = () => {
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioContextClass) return;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
      setTimeout(() => audioContext.close(), 500);
    } catch (err) {
      console.warn('Success beep failed');
    }
};

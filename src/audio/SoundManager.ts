// Web Audio API procedural sound synthesizer and background acoustic farm music generator

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.35;
  private sfxVolume: number = 0.6;
  private isMusicPlaying: boolean = false;
  private musicTimer: number | null = null;
  private musicStep: number = 0;

  constructor() {
    // Lazy AudioContext initialization on first user gesture
  }

  private initContext() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // Browser autoplay policy requires user gesture
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  public playPlant() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playHarvest() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Rich dual-tone harvest chime
    [587.33, 880, 1174.66].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.04);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.04 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.04);
      osc.stop(this.ctx.currentTime + i * 0.04 + 0.15);
    });
  }

  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    [987.77, 1318.51].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume, this.ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.08);
      osc.stop(this.ctx.currentTime + i * 0.08 + 0.25);
    });
  }

  public playXP() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [659.25, 783.99, 987.77, 1318.51];
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.05);
      osc.stop(this.ctx.currentTime + i * 0.05 + 0.2);
    });
  }

  public playLevelUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Fanfare chord sequence
    const chords = [
      [523.25, 659.25, 783.99],
      [587.33, 739.99, 880.00],
      [659.25, 830.61, 987.77],
      [783.99, 987.77, 1318.51],
    ];

    chords.forEach((chord, step) => {
      if (!this.ctx) return;
      chord.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + step * 0.12);

        gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime + step * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + step * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + step * 0.12);
        osc.stop(this.ctx.currentTime + step * 0.12 + 0.4);
      });
    });
  }

  public playCraftStart() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(480, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playAnimalSound(animalId: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (animalId === 'chicken') {
      // Cluck
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    } else if (animalId === 'cow') {
      // Gentle Moo
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    } else if (animalId === 'pig') {
      // Oink
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
    } else {
      // Baa / Bleat
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(300, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  public playTruckHonk() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    [349.23, 440].forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    });
  }

  public playWaterSplash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  public playThunder() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Initial sharp crack
    const oscCrack = this.ctx.createOscillator();
    const gainCrack = this.ctx.createGain();
    oscCrack.type = 'sawtooth';
    oscCrack.frequency.setValueAtTime(140, t);
    oscCrack.frequency.exponentialRampToValueAtTime(35, t + 0.12);
    gainCrack.gain.setValueAtTime(0.35 * this.sfxVolume, t);
    gainCrack.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    oscCrack.connect(gainCrack);
    gainCrack.connect(this.ctx.destination);
    oscCrack.start(t);
    oscCrack.stop(t + 0.15);

    // 2. Deep rolling rumble (sub-bass 45Hz -> 25Hz)
    const oscRumble = this.ctx.createOscillator();
    const gainRumble = this.ctx.createGain();
    oscRumble.type = 'triangle';
    oscRumble.frequency.setValueAtTime(65, t + 0.05);
    oscRumble.frequency.linearRampToValueAtTime(40, t + 0.8);
    oscRumble.frequency.linearRampToValueAtTime(25, t + 1.8);

    gainRumble.gain.setValueAtTime(0.01, t);
    gainRumble.gain.linearRampToValueAtTime(0.4 * this.sfxVolume, t + 0.08);
    gainRumble.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

    oscRumble.connect(gainRumble);
    gainRumble.connect(this.ctx.destination);
    oscRumble.start(t);
    oscRumble.stop(t + 2.0);
  }

  public startMusic() {
    if (this.isMusicPlaying || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    this.scheduleMusicStep();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleMusicStep() {
    if (!this.isMusicPlaying || this.isMuted || !this.ctx) return;

    // Soothing Country Farm Pentatonic Melody Pattern in C Major (C4, D4, E4, G4, A4, C5)
    const melodyNotes = [
      261.63, 329.63, 392.00, 523.25, // C E G C
      392.00, 329.63, 293.66, 329.63, // G E D E
      220.00, 261.63, 329.63, 392.00, // A C E G
      329.63, 293.66, 261.63, null,   // E D C rest
    ];

    const currentNote = melodyNotes[this.musicStep % melodyNotes.length];
    if (currentNote) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(currentNote, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08 * this.musicVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.75);
    }

    this.musicStep++;
    this.musicTimer = window.setTimeout(() => {
      this.scheduleMusicStep();
    }, 480); // ~125 BPM pleasant country stroll
  }
}

export const sounds = new SoundManager();

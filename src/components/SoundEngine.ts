// Web Audio API Synthesizer for Base Chain Maze retro-tech sounds
class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private musicEnabled: boolean = false;
  private musicInterval: any = null;
  private fadeInterval: any = null;
  private currentStep: number = 0;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private audio: HTMLAudioElement | null = null;
  private isAudioPlaying: boolean = false;
  private hasInteracted: boolean = false;
  private ambientOscs: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;

  constructor() {
    // Lazy initialisation to prevent audio playing warnings before interaction
    this.setupInteractionListener();
  }

  private setupInteractionListener() {
    if (typeof window === 'undefined') return;

    const startAudioOnInteraction = () => {
      if (this.hasInteracted) return;
      this.hasInteracted = true;

      // Force initialize AudioContext and resume
      this.init();

      // If music is enabled and not playing, try starting it
      if (this.musicEnabled && !this.isAudioPlaying) {
        this.tryPlayMP3();
      }

      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click', startAudioOnInteraction);
      window.removeEventListener('keydown', startAudioOnInteraction);
      window.removeEventListener('touchstart', startAudioOnInteraction);
      window.removeEventListener('mousedown', startAudioOnInteraction);
    };

    window.addEventListener('click', startAudioOnInteraction);
    window.addEventListener('keydown', startAudioOnInteraction);
    window.addEventListener('touchstart', startAudioOnInteraction);
    window.addEventListener('mousedown', startAudioOnInteraction);
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        
        try {
          // Create premium ambient echo/delay loop
          this.delayNode = this.ctx.createDelay(1.0);
          this.delayNode.delayTime.setValueAtTime(0.3, this.ctx.currentTime); // 300ms delay
          
          this.delayGain = this.ctx.createGain();
          this.delayGain.gain.setValueAtTime(0.3, this.ctx.currentTime); // feedback amount
          
          // Connect feedback loop
          this.delayNode.connect(this.delayGain);
          this.delayGain.connect(this.delayNode);
          
          // Connect delay to destination
          this.delayNode.connect(this.ctx.destination);
        } catch (e) {
          console.warn("Failed to initialize custom Web Audio delay nodes", e);
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private startProceduralAmbient() {
    if (this.isAmbientPlaying || this.muted || !this.musicEnabled) return;
    this.init();
    if (!this.ctx) return;

    this.isAmbientPlaying = true;
    
    try {
      // Create an ambient main gain node
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.0, this.ctx.currentTime); // start at 0 for fade-in

      // 1. Warm base drone (low-pass filtered sawtooth + triangle detuned)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, this.ctx.currentTime);

      const freqs = [110, 165, 220, 275]; // A2, E3, A3, C#4 (Warm major-ish chord)
      
      this.ambientOscs = [];
      
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        // Alternate waveforms for richness
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        // Detune slightly for chorus effect
        osc.detune.setValueAtTime((idx * 4) - 6, this.ctx.currentTime);
        
        // Soft, unequal volume for each partial
        const vol = 0.05 / (idx + 1);
        oscGain.gain.setValueAtTime(vol, this.ctx.currentTime);
        
        osc.connect(oscGain);
        oscGain.connect(filter);
        
        osc.start();
        this.ambientOscs.push(osc);
      });

      // Connect to main ambient gain
      filter.connect(this.ambientGain);
      
      // Optionally connect to delay node if initialized
      if (this.delayNode && this.ambientGain) {
        this.ambientGain.connect(this.delayNode);
      } else if (this.ambientGain) {
        this.ambientGain.connect(this.ctx.destination);
      }

      // Fade in the ambient music smoothly over 2 seconds
      this.ambientGain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 2.0);
    } catch (e) {
      console.warn("Failed to start procedural ambient synth:", e);
      this.isAmbientPlaying = false;
    }
  }

  private stopProceduralAmbient() {
    if (!this.isAmbientPlaying) return;
    this.isAmbientPlaying = false;
    
    const now = this.ctx ? this.ctx.currentTime : 0;
    
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.cancelScheduledValues(now);
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
        this.ambientGain.gain.linearRampToValueAtTime(0.0, now + 1.0);
      } catch (e) {
        console.warn("Failed to smoothly stop ambient gains:", e);
      }
    }
    
    setTimeout(() => {
      if (!this.isAmbientPlaying) {
        this.ambientOscs.forEach(osc => {
          try {
            osc.stop();
          } catch(e) {}
        });
        this.ambientOscs = [];
        this.ambientGain = null;
      }
    }, 1100);
  }

  setMute(isMuted: boolean) {
    this.muted = isMuted;
    if (this.audio) {
      this.audio.muted = isMuted;
    }
    if (isMuted) {
      this.stopProceduralAmbient();
    } else if (this.musicEnabled) {
      this.tryPlayMP3();
    }
  }

  isMuted() {
    return this.muted;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.tryPlayMP3();
    } else {
      this.isAudioPlaying = false;
      this.stopProceduralAmbient(); // Stop ambient if running
      this.fadeAudio(0.0, 1000, () => {
        if (!this.musicEnabled && this.audio) {
          this.audio.pause();
        }
      });
    }
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  private fadeAudio(target: number, duration: number, callback?: () => void) {
    if (!this.audio) {
      if (callback) callback();
      return;
    }

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    const steps = 25; // 25 steps for a highly smooth cross-fade
    const stepTime = duration / steps;
    const startVolume = this.audio.volume;
    const volumeChange = target - startVolume;
    let currentStep = 0;

    this.fadeInterval = setInterval(() => {
      currentStep++;
      if (this.audio) {
        const nextVolume = Math.max(0, Math.min(1, startVolume + (volumeChange * (currentStep / steps))));
        this.audio.volume = nextVolume;
      }

      if (currentStep >= steps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        if (this.audio) {
          this.audio.volume = target;
        }
        if (callback) callback();
      }
    }, stepTime);
  }

  private tryPlayMP3() {
    if (this.audio) {
      this.audio.muted = this.muted;
      
      if (this.isAudioPlaying) {
        this.fadeAudio(1.0, 1000);
        return;
      }

      this.audio.volume = 0; // Start at 0 volume for smooth fade-in
      this.audio.play()
        .then(() => {
          this.isAudioPlaying = true;
          this.fadeAudio(1.0, 1000); // Fade in to 1.0 over 1 second
        })
        .catch((e) => {
          console.log("MP3 play failed:", e);
          this.isAudioPlaying = false;
        });
      return;
    }

    // Try multiple standard paths
    const possiblePaths = ['/music.mp3', '/tots_theme.mp3', '/assets/music.mp3', '/tots.mp3'];
    let pathIndex = 0;

    const tryNextPath = () => {
      if (pathIndex >= possiblePaths.length) {
        console.warn("All MP3 paths failed. Starting gorgeous procedural synth ambient music fallback...");
        this.isAudioPlaying = false;
        this.startProceduralAmbient();
        return;
      }

      const currentPath = possiblePaths[pathIndex];
      const audio = new Audio(currentPath);
      audio.loop = true;
      audio.muted = this.muted;

      // Event listeners for seamless loading & fallback
      const onCanPlay = () => {
        if (!this.musicEnabled) {
          audio.pause();
          return;
        }
        audio.volume = 0; // Start at 0 volume for smooth fade-in
        audio.play()
          .then(() => {
            this.audio = audio;
            this.isAudioPlaying = true;
            this.fadeAudio(1.0, 1000); // Fade in to 1.0 over 1 second
          })
          .catch((err) => {
            console.warn("Autoplay blocked or failed for", currentPath, err);
            this.isAudioPlaying = false;
          });
        
        cleanup();
      };

      const onError = () => {
        pathIndex++;
        tryNextPath();
        cleanup();
      };

      const cleanup = () => {
        audio.removeEventListener('canplaythrough', onCanPlay);
        audio.removeEventListener('error', onError);
      };

      audio.addEventListener('canplaythrough', onCanPlay);
      audio.addEventListener('error', onError);

      // Force load trigger
      audio.load();
    };

    tryNextPath();
  }

  playMove() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playCoin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.setValueAtTime(0.15, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.25);
  }

  playPowerup() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(330, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3);

    osc2.frequency.setValueAtTime(335, now);
    osc2.frequency.exponentialRampToValueAtTime(885, now + 0.3);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  playWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    const duration = 0.12;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * duration);

      gain.gain.setValueAtTime(0.12, now + idx * duration);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * duration + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * duration);
      osc.stop(now + idx * duration + 0.3);
    });
  }

  playError() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.setValueAtTime(90, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playReset() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }
}

export const sound = new SoundEngine();

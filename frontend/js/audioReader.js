/**
 * LexiMed Frontend - Accessible Audio Reader
 * Uses Web Speech API to provide audio synthesis for elderly, dyslexic, or visually impaired users
 */

class AudioReader {
  constructor() {
    this.synth = window.speechSynthesis;
    this.isPlaying = false;
    this.currentUtterance = null;
    this.speed = 1.0;

    this.playBtn = document.getElementById('audio-play-btn');
    this.stopBtn = document.getElementById('audio-stop-btn');
    this.speedSelect = document.getElementById('audio-speed-select');
    this.statusText = document.getElementById('audio-status-text');
    this.audioIcon = document.getElementById('audio-icon');
    this.audioLabel = document.getElementById('audio-label');
    this.audioDock = document.querySelector('.wb-audio-dock');

    this.initListeners();
  }

  initListeners() {
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlay());
    }

    if (this.stopBtn) {
      this.stopBtn.addEventListener('click', () => this.stop());
    }

    if (this.speedSelect) {
      this.speedSelect.addEventListener('change', (e) => {
        this.speed = parseFloat(e.target.value) || 1.0;
        if (this.isPlaying) {
          this.stop();
          this.playCurrentDigest();
        }
      });
    }
  }

  getTextToRead() {
    // Collect the executive digest sentences and main categories
    const digestNodes = document.querySelectorAll('#executive-digest-items .finding-text, #executive-digest-items .finding-body');
    const texts = [];
    
    texts.push('Synthesis Overview.');
    digestNodes.forEach(node => {
      texts.push(node.textContent.trim());
    });

    const categoryItems = document.querySelectorAll('#structured-categories-container .finding-body, #structured-categories-container div');
    if (categoryItems.length > 0) {
      categoryItems.forEach(node => {
        if (node.textContent.trim().length > 25 && !texts.includes(node.textContent.trim())) {
          texts.push(node.textContent.trim());
        }
      });
    }

    return texts.join(' ');
  }

  togglePlay() {
    if (!this.synth) {
      this.updateStatus('Speech synthesis is not supported on this browser.');
      return;
    }

    if (this.isPlaying) {
      this.stop();
    } else {
      this.playCurrentDigest();
    }
  }

  playCurrentDigest() {
    if (!this.synth) return;

    this.synth.cancel(); // Clear any existing queue
    const fullText = this.getTextToRead();

    if (!fullText || fullText.length < 15) {
      this.updateStatus('No synthesis text available to read aloud.');
      return;
    }

    this.currentUtterance = new SpeechSynthesisUtterance(fullText);
    this.currentUtterance.rate = this.speed;
    this.currentUtterance.pitch = 1.0;

    // Pick a natural human voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Enhanced') || v.name.includes('Samantha') || v.name.includes('Google')));
    if (naturalVoice) {
      this.currentUtterance.voice = naturalVoice;
    }

    this.currentUtterance.onstart = () => {
      this.isPlaying = true;
      if (this.audioDock) this.audioDock.classList.add('playing');
      if (this.audioIcon) this.audioIcon.textContent = '❚❚';
      if (this.audioLabel) this.audioLabel.textContent = 'Pause';
      this.updateStatus(`Reading aloud at ${this.speed}x speed...`);
    };

    this.currentUtterance.onend = () => {
      this.isPlaying = false;
      if (this.audioDock) this.audioDock.classList.remove('playing');
      if (this.audioIcon) this.audioIcon.textContent = '▶';
      if (this.audioLabel) this.audioLabel.textContent = 'Listen';
      this.updateStatus('Audio readout complete.');
    };

    this.currentUtterance.onerror = (e) => {
      console.error('Audio readout error:', e);
      this.isPlaying = false;
      if (this.audioDock) this.audioDock.classList.remove('playing');
      if (this.audioIcon) this.audioIcon.textContent = '▶';
      if (this.audioLabel) this.audioLabel.textContent = 'Listen';
      this.updateStatus('Audio playback stopped.');
    };

    this.synth.speak(this.currentUtterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    if (this.audioDock) this.audioDock.classList.remove('playing');
    if (this.audioIcon) this.audioIcon.textContent = '▶';
    if (this.audioLabel) this.audioLabel.textContent = 'Listen';
    this.updateStatus('Audio stopped.');
  }

  updateStatus(msg) {
    if (this.statusText) {
      this.statusText.textContent = msg;
    }
  }
}

window.AudioReader = AudioReader;

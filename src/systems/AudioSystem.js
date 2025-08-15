// 音频系统 - 海洋音效和背景音乐
// Audio System - Ocean sound effects and ambient audio

class OceanAudio {
    constructor() {
        this.audioContext = null;
        this.enabled = false;
        this.init();
    }
    
    init() {
        // 用户首次交互时初始化音频
        document.addEventListener('click', () => this.enableAudio(), { once: true });
        document.addEventListener('keydown', () => this.enableAudio(), { once: true });
    }
    
    enableAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = true;
            console.log('Ocean audio system enabled');
        }
    }
    
    playBubbleSound(pitch = 1000, duration = 0.3) {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 频率从高到低，模拟气泡破裂声
        oscillator.frequency.setValueAtTime(pitch, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            pitch * 0.3, 
            this.audioContext.currentTime + duration
        );
        
        // 音量衰减
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.001, 
            this.audioContext.currentTime + duration
        );
        
        oscillator.type = 'sine';
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playMovementSound() {
        if (!this.enabled || !this.audioContext) return;
        
        // 创建章鱼移动的"呼呼"声
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 低频震动声
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            80, 
            this.audioContext.currentTime + 0.2
        );
        
        // 低通滤波器，创造水下效果
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.001, 
            this.audioContext.currentTime + 0.2
        );
        
        oscillator.type = 'sawtooth';
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    playAmbientBubbles() {
        if (!this.enabled || !this.audioContext) return;
        
        // 随机的环境气泡声
        const pitch = 800 + Math.random() * 400;
        const duration = 0.1 + Math.random() * 0.3;
        this.playBubbleSound(pitch, duration);
    }
    
    playEducationalSound() {
        if (!this.enabled || !this.audioContext) return;
        
        // 教育信息显示时的悦耳音效
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 和谐的和弦音效
        oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
        
        oscillator.type = 'sine';
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
    
    playSwimSound() {
        if (!this.enabled || !this.audioContext) return;
        
        // 游泳水流声
        const noise = this.audioContext.createBufferSource();
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // 生成白噪声
        for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        const gainNode = this.audioContext.createGain();
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 带通滤波器，模拟水流声
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
        filter.Q.setValueAtTime(10, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
        
        noise.start();
        noise.stop(this.audioContext.currentTime + 0.5);
    }
    
    startAmbientLoop() {
        if (!this.enabled || !this.audioContext) return;
        
        // 开始环境音循环
        this.ambientInterval = setInterval(() => {
            if (Math.random() < 0.3) {
                this.playAmbientBubbles();
            }
        }, 2000 + Math.random() * 3000);
    }
    
    stopAmbientLoop() {
        if (this.ambientInterval) {
            clearInterval(this.ambientInterval);
            this.ambientInterval = null;
        }
    }
    
    // 音量控制
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    // 清理资源
    cleanup() {
        this.stopAmbientLoop();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// 注册模块
if (window.moduleManager) {
    window.moduleManager.registerModule('OceanAudio', OceanAudio);
}
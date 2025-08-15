// Audio system for ocean sounds
class OceanAudio {
    constructor() {
        this.audioContext = null;
        this.enabled = false;
        this.init();
    }
    
    init() {
        // Initialize audio context when user first interacts
        document.addEventListener('click', () => this.enableAudio(), { once: true });
        document.addEventListener('keydown', () => this.enableAudio(), { once: true });
    }
    
    enableAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = true;
        }
    }
    
    playBubbleSound(pitch = 1000, duration = 0.3) {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(pitch, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(pitch * 0.3, this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.type = 'sine';
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playMovementSound() {
        if (!this.enabled || !this.audioContext) return;
        
        // Create a whoosh-like sound for octopus movement
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.2);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
        
        oscillator.type = 'sawtooth';
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    playAmbientBubbles() {
        if (!this.enabled || !this.audioContext) return;
        
        const pitch = 800 + Math.random() * 400;
        const duration = 0.1 + Math.random() * 0.3;
        this.playBubbleSound(pitch, duration);
    }
}

class OceanOctopus {
    constructor() {
        this.octopus = document.getElementById('octopus');
        this.position = { x: 50, y: 50 }; // percentage
        this.speed = 2;
        this.isMoving = false;
        this.currentDirection = null;
        this.audio = new OceanAudio();
        
        this.init();
    }
    
    init() {
        this.setupControls();
        this.startAnimation();
        this.createRandomBubbles();
    }
    
    setupControls() {
        const keys = {};
        
        document.addEventListener('keydown', (e) => {
            keys[e.code] = true;
            this.handleMovement(keys);
        });
        
        document.addEventListener('keyup', (e) => {
            keys[e.code] = false;
            this.handleMovement(keys);
        });
        
        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            
            const deltaX = touchX - touchStartX;
            const deltaY = touchY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 20) this.move('right');
                else if (deltaX < -20) this.move('left');
            } else {
                if (deltaY > 20) this.move('down');
                else if (deltaY < -20) this.move('up');
            }
        });
    }
    
    handleMovement(keys) {
        const isMoving = keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'] ||
                        keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight'];
        
        if (isMoving) {
            if (keys['KeyW'] || keys['ArrowUp']) this.move('up');
            if (keys['KeyS'] || keys['ArrowDown']) this.move('down');
            if (keys['KeyA'] || keys['ArrowLeft']) this.move('left');
            if (keys['KeyD'] || keys['ArrowRight']) this.move('right');
        } else {
            this.stopMoving();
        }
    }
    
    move(direction) {
        this.isMoving = true;
        this.currentDirection = direction;
        
        // Update position
        switch(direction) {
            case 'up':
                this.position.y = Math.max(10, this.position.y - this.speed);
                break;
            case 'down':
                this.position.y = Math.min(85, this.position.y + this.speed);
                break;
            case 'left':
                this.position.x = Math.max(5, this.position.x - this.speed);
                break;
            case 'right':
                this.position.x = Math.min(95, this.position.x + this.speed);
                break;
        }
        
        // Update visual position with 3D movement
        this.octopus.style.left = this.position.x + '%';
        this.octopus.style.top = this.position.y + '%';
        
        // Add 3D rotation based on movement direction
        let rotateY = 0, rotateX = 0, translateZ = 0;
        switch(direction) {
            case 'up':
                rotateX = -10;
                translateZ = 15;
                break;
            case 'down':
                rotateX = 10;
                translateZ = -10;
                break;
            case 'left':
                rotateY = -15;
                translateZ = 5;
                break;
            case 'right':
                rotateY = 15;
                translateZ = 5;
                break;
        }
        
        this.octopus.style.transform = `translate(-50%, -50%) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // Add movement class for animation
        this.octopus.className = `moving-${direction}`;
        
        // Create movement bubbles
        this.createMovementBubbles();
        
        // Play movement sound occasionally
        if (Math.random() < 0.3) {
            this.audio.playMovementSound();
        }
    }
    
    stopMoving() {
        this.isMoving = false;
        this.currentDirection = null;
        this.octopus.className = '';
        // Reset to default 3D position
        this.octopus.style.transform = 'translate(-50%, -50%) translateZ(0px) rotateX(0deg) rotateY(0deg)';
    }
    
    createMovementBubbles() {
        if (Math.random() < 0.3) { // 30% chance
            const bubble = document.createElement('div');
            bubble.className = 'movement-bubble';
            bubble.style.position = 'absolute';
            bubble.style.width = (5 + Math.random() * 10) + 'px';
            bubble.style.height = bubble.style.width;
            bubble.style.background = 'rgba(255, 255, 255, 0.6)';
            bubble.style.borderRadius = '50%';
            bubble.style.left = this.position.x + '%';
            bubble.style.top = this.position.y + '%';
            bubble.style.pointerEvents = 'none';
            bubble.style.animation = 'bubble-rise-3d 2s linear forwards';
            bubble.style.transformStyle = 'preserve-3d';
            bubble.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.4)';
            
            document.getElementById('ocean-container').appendChild(bubble);
            
            // Play bubble sound
            this.audio.playBubbleSound(1200 + Math.random() * 300, 0.2);
            
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
            }, 2000);
        }
    }
    
    createRandomBubbles() {
        setInterval(() => {
            const bubble = document.createElement('div');
            bubble.className = 'random-bubble';
            bubble.style.position = 'absolute';
            bubble.style.width = (3 + Math.random() * 8) + 'px';
            bubble.style.height = bubble.style.width;
            bubble.style.background = 'rgba(255, 255, 255, 0.4)';
            bubble.style.borderRadius = '50%';
            bubble.style.left = Math.random() * 100 + '%';
            bubble.style.bottom = '0px';
            bubble.style.pointerEvents = 'none';
            bubble.style.animation = 'bubble-rise-3d ' + (4 + Math.random() * 4) + 's linear forwards';
            bubble.style.transformStyle = 'preserve-3d';
            bubble.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.3)';
            bubble.style.transform = `translateZ(${-30 + Math.random() * 60}px)`;
            
            document.getElementById('ocean-container').appendChild(bubble);
            
            // Play ambient bubble sound occasionally
            if (Math.random() < 0.4) {
                setTimeout(() => this.audio.playAmbientBubbles(), Math.random() * 1000);
            }
            
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
            }, 8000);
        }, 1000);
    }
    
    startAnimation() {
        // Random octopus movements when idle
        setInterval(() => {
            if (!this.isMoving) {
                const randomMovements = ['idle-float', 'idle-drift'];
                const movement = randomMovements[Math.floor(Math.random() * randomMovements.length)];
                
                this.octopus.style.transform = 'translate(-50%, -50%) ' + 
                    (movement === 'idle-float' ? 'translateY(-5px)' : 'translateX(5px)');
                
                setTimeout(() => {
                    if (!this.isMoving) {
                        this.octopus.style.transform = 'translate(-50%, -50%)';
                    }
                }, 1000);
            }
        }, 3000);
        
        // Color change when moving through kelp
        setInterval(() => {
            const octopusHead = document.querySelector('.octopus-head');
            if (this.isMoving && Math.random() < 0.1) {
                octopusHead.style.background = 'radial-gradient(circle at 30% 30%, #ff9f43, #ff6348, #d63031)';
                setTimeout(() => {
                    octopusHead.style.background = 'radial-gradient(circle at 30% 30%, #ff6b6b, #d63031, #a71e2a)';
                }, 500);
            }
        }, 100);
    }
}

// Interactive ocean effects
class OceanEffects {
    constructor(audioSystem) {
        this.audio = audioSystem;
        this.init();
    }
    
    init() {
        this.addClickRipples();
        this.addKelpInteraction();
        this.addFishScareEffect();
    }
    
    addClickRipples() {
        document.addEventListener('click', (e) => {
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.left = e.clientX - 25 + 'px';
            ripple.style.top = e.clientY - 25 + 'px';
            ripple.style.width = '50px';
            ripple.style.height = '50px';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.3)';
            ripple.style.pointerEvents = 'none';
            ripple.style.animation = 'ripple-effect 1s ease-out forwards';
            ripple.style.zIndex = '50';
            
            document.body.appendChild(ripple);
            
            // Play splash sound
            this.audio.playBubbleSound(600 + Math.random() * 200, 0.4);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 1000);
        });
    }
    
    addKelpInteraction() {
        const kelps = document.querySelectorAll('.kelp');
        kelps.forEach(kelp => {
            kelp.addEventListener('mouseenter', () => {
                kelp.style.transform = 'rotate(15deg)';
                kelp.style.transition = 'transform 0.3s ease';
            });
            
            kelp.addEventListener('mouseleave', () => {
                kelp.style.transform = '';
                kelp.style.transition = '';
            });
        });
    }
    
    addFishScareEffect() {
        const octopus = document.getElementById('octopus');
        const fishes = document.querySelectorAll('.fish');
        
        setInterval(() => {
            const octopusRect = octopus.getBoundingClientRect();
            
            fishes.forEach(fish => {
                const fishRect = fish.getBoundingClientRect();
                const distance = Math.sqrt(
                    Math.pow(octopusRect.left - fishRect.left, 2) + 
                    Math.pow(octopusRect.top - fishRect.top, 2)
                );
                
                if (distance < 100) {
                    fish.style.animationDuration = '2s'; // Speed up
                    fish.style.transform = 'scaleY(0.7) translateY(-10px)'; // Panic movement
                } else {
                    fish.style.animationDuration = '8s'; // Normal speed
                    fish.style.transform = '';
                }
            });
        }, 100);
    }
}

// Add CSS animations via JavaScript
const additionalCSS = `
@keyframes ripple-effect {
    0% {
        transform: scale(0);
        opacity: 1;
    }
    100% {
        transform: scale(4);
        opacity: 0;
    }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// Initialize the ocean world
document.addEventListener('DOMContentLoaded', () => {
    const octopus = new OceanOctopus();
    const effects = new OceanEffects(octopus.audio);
    
    // Welcome message
    setTimeout(() => {
        const info = document.querySelector('.info');
        info.textContent = 'Explore the kelp forest as an octopus!';
        
        setTimeout(() => {
            info.textContent = 'Click anywhere to create ripples and sounds!';
        }, 3000);
        
        setTimeout(() => {
            info.textContent = 'Audio enabled - enjoy the bubble sounds!';
        }, 6000);
    }, 1000);
});
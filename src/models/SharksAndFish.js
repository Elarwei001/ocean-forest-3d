// 鲨鱼和鱼类协调模块 - 整合鲨鱼和珊瑚鱼类模块
// Sharks and Fish Coordinator Module - Integrates shark and reef fish modules

class SharksAndFish {
    constructor(scene) {
        this.scene = scene;
        
        // 等待依赖模块加载
        this.sharkModel = null;
        this.reefFishModel = null;
        
        this.initializeModels();
    }
    
    initializeModels() {
        // 直接初始化依赖模块（加载顺序已在HTML中确保）
        if (typeof SharkModel !== 'undefined' && typeof ReefFishModel !== 'undefined') {
            this.sharkModel = new SharkModel(this.scene);
            this.reefFishModel = new ReefFishModel(this.scene);
        } else {
            // 延迟初始化
            setTimeout(() => this.initializeModels(), 100);
        }
    }
    
    createGreatWhiteSharks() {
        if (!this.sharkModel) {
            console.warn('SharkModel not initialized');
            return [];
        }
        return this.sharkModel.createGreatWhiteSharks();
    }
    
    createSingleGreatWhiteShark() {
        if (!this.sharkModel) {
            this.sharkModel = new SharkModel(this.scene);
        }
        const shark = this.sharkModel.createSingleGreatWhiteShark();
        // Position randomly
        shark.position.set(
            (Math.random() - 0.5) * 100,
            -8 + Math.random() * 10,
            (Math.random() - 0.5) * 100
        );
        return shark;
    }
    
    createCapeReefFish() {
        if (!this.reefFishModel) {
            console.warn('ReefFishModel not initialized');
            return [];
        }
        return this.reefFishModel.createCapeReefFish();
    }
    
    createSingleCapeReefFish() {
        try {
            console.log('🐟 SharksAndFish: Creating single Cape reef fish...');
            
            if (!this.reefFishModel) {
                console.log('🔧 Creating new ReefFishModel instance...');
                this.reefFishModel = new ReefFishModel(this.scene);
                console.log('✅ ReefFishModel created');
            }
            
            // Create a random Cape reef fish type with proper object structure
            const fishTypes = [
                { name: "黄尾鰤鱼", englishName: "Yellowtail", 
                  bodyColor: 0xc0c0c0, finColor: 0xffd700, 
                  stripeColor: 0xffa500, pattern: 'yellowtail' },
                { name: "霍屯督鱼", englishName: "Hottentot", 
                  bodyColor: 0xa0a0a0, finColor: 0x808080, 
                  stripeColor: 0x606060, pattern: 'hottentot' },
                { name: "石头鱼", englishName: "Steentjie", 
                  bodyColor: 0x8b4513, finColor: 0x654321, 
                  stripeColor: 0xa0522d, pattern: 'steentjie' }
            ];
            
            const randomType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
            console.log('🎲 Selected fish type:', randomType.englishName);
            
            const fish = this.reefFishModel.createSingleReefFish(randomType);
            console.log('🐟 Fish created:', !!fish);
            
            if (fish) {
                // Position randomly
                fish.position.set(
                    (Math.random() - 0.5) * 60,
                    -10 + Math.random() * 8,
                    (Math.random() - 0.5) * 60
                );
                console.log('📍 Fish positioned at:', fish.position);
                console.log('✅ Single Cape reef fish creation successful');
                return fish;
            } else {
                console.error('❌ ReefFishModel.createSingleReefFish returned null/undefined');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Error in createSingleCapeReefFish:', error);
            console.error('Error stack:', error.stack);
            return null;
        }
    }
    
    updateGreatWhiteSharks(deltaTime) {
        if (this.sharkModel) {
            this.sharkModel.updateGreatWhiteSharks(deltaTime);
        }
    }
    
    updateCapeReefFish(deltaTime) {
        if (this.reefFishModel) {
            this.reefFishModel.updateCapeReefFish(deltaTime);
        }
    }
    
    // Getter方法
    getGreatWhiteSharks() { 
        return this.sharkModel ? this.sharkModel.getGreatWhiteSharks() : [];
    }
    
    getCapeReefFish() { 
        return this.reefFishModel ? this.reefFishModel.getCapeReefFish() : [];
    }
}

// 注册模块
if (window.moduleManager) {
    window.moduleManager.registerModule('SharksAndFish', SharksAndFish);
}
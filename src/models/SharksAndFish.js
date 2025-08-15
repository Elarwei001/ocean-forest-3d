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
    
    createCapeReefFish() {
        if (!this.reefFishModel) {
            console.warn('ReefFishModel not initialized');
            return [];
        }
        return this.reefFishModel.createCapeReefFish();
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
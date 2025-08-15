// 模块管理器 - 统一管理所有模块
// Module Manager - Unified management of all modules

class ModuleManager {
    constructor() {
        this.modules = new Map();
        this.initialized = false;
        this.loadingCallbacks = [];
    }
    
    // 注册模块
    registerModule(name, moduleClass) {
        this.modules.set(name, moduleClass);
        console.log(`Module registered: ${name}`);
        
        // 检查是否所有模块都已加载
        this.checkModulesReady();
    }
    
    // 获取模块
    getModule(name) {
        return this.modules.get(name);
    }
    
    // 检查所有必需模块是否已加载
    checkModulesReady() {
        const requiredModules = [
            'OceanForest',
            'OceanEnvironment', 
            'OctopusModel',
            'MarineAnimals',
            'SharkModel',
            'ReefFishModel',
            'SharksAndFish',
            'EducationSystem',
            'FloatingLabelsSystem',
            'OceanAudio',
            'RenderEngine'
        ];
        
        // 可选的高级模块
        const optionalModules = [
            'CinematicAnimationSystem',
            'AdvancedParticleSystem', 
            'MarineLifeBehavior',
            'CinematicCameraSystem',
            'CinematicControlPanel'
        ];
        
        const loadedModules = Array.from(this.modules.keys());
        const missingModules = requiredModules.filter(name => !this.modules.has(name));
        
        console.log(`Loaded modules: [${loadedModules.join(', ')}]`);
        if (missingModules.length > 0) {
            console.log(`Missing modules: [${missingModules.join(', ')}]`);
        }
        
        const allLoaded = missingModules.length === 0;
        
        if (allLoaded && !this.initialized) {
            this.initialized = true;
            this.onAllModulesReady();
        }
        
        return allLoaded;
    }
    
    // 所有模块准备就绪时的回调
    onAllModulesReady() {
        console.log('All modules loaded successfully');
        
        // 执行所有等待的回调
        this.loadingCallbacks.forEach(callback => callback());
        this.loadingCallbacks = [];
        
        // 初始化主应用
        this.initializeApplication();
    }
    
    // 添加加载完成回调
    onReady(callback) {
        if (this.initialized) {
            callback();
        } else {
            this.loadingCallbacks.push(callback);
        }
    }
    
    // 初始化主应用
    initializeApplication() {
        try {
            // 创建主应用实例
            const OceanForestClass = this.getModule('OceanForest');
            if (OceanForestClass) {
                window.oceanForestApp = new OceanForestClass();
                console.log('Ocean Forest application initialized successfully');
            } else {
                throw new Error('OceanForest main class not found');
            }
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showErrorMessage(error.message);
        }
    }
    
    // 显示错误信息
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        errorDiv.innerHTML = `
            <h3>加载错误 / Loading Error</h3>
            <p>${message}</p>
            <p>请刷新页面重试 / Please refresh the page to retry</p>
        `;
        document.body.appendChild(errorDiv);
    }
    
    // 等待所有模块加载完成的Promise方法
    waitForModules(timeout = 10000) {
        return new Promise((resolve, reject) => {
            const checkModules = () => {
                const isReady = this.checkModulesReady();
                if (isReady) {
                    resolve(true);
                } else {
                    const timeoutId = setTimeout(() => {
                        reject(new Error('Module loading timeout'));
                    }, timeout);
                    
                    setTimeout(() => {
                        clearTimeout(timeoutId);
                        checkModules();
                    }, 100);
                }
            };
            
            checkModules();
        });
    }
    
    // 获取模块加载状态
    getLoadingStatus() {
        const requiredModules = [
            'OceanForest',
            'OceanEnvironment', 
            'OctopusModel',
            'MarineAnimals',
            'SharksAndFish',
            'EducationSystem',
            'FloatingLabelsSystem',
            'OceanAudio',
            'RenderEngine'
        ];
        
        const status = {};
        requiredModules.forEach(moduleName => {
            status[moduleName] = this.modules.has(moduleName);
        });
        
        return status;
    }
}

// 创建全局模块管理器实例
window.moduleManager = new ModuleManager();

// 模块加载完成后的自动检查
window.addEventListener('DOMContentLoaded', () => {
    // 延迟检查，确保所有脚本都已加载
    setTimeout(() => {
        console.log('DOMContentLoaded - checking modules...');
        window.moduleManager.checkModulesReady();
    }, 500);
});

// 额外的检查机制
setTimeout(() => {
    console.log('Fallback check - checking modules...');
    if (window.moduleManager && !window.moduleManager.initialized) {
        window.moduleManager.checkModulesReady();
    }
}, 2000);

// 导出模块管理器（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleManager;
}
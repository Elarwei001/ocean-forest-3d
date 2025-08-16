// Module Manager - Unified management of all modules
// Module Manager - Unified management of all modules

class ModuleManager {
    constructor() {
        this.modules = new Map();
        this.initialized = false;
        this.loadingCallbacks = [];
    }
    
    // Register module
    registerModule(name, moduleClass) {
        this.modules.set(name, moduleClass);
        console.log(`Module registered: ${name}`);
        
        // Check if all modules are loaded
        this.checkModulesReady();
    }
    
    // Get module
    getModule(name) {
        return this.modules.get(name);
    }
    
    // Check if all required modules are loaded
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
        
        // Optional advanced modules
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
    
    // Callback when all modules are ready
    onAllModulesReady() {
        console.log('All modules loaded successfully');
        
        // Execute all waiting callbacks
        this.loadingCallbacks.forEach(callback => callback());
        this.loadingCallbacks = [];
        
        // Initialize main application
        this.initializeApplication();
    }
    
    // Add loading completion callback
    onReady(callback) {
        if (this.initialized) {
            callback();
        } else {
            this.loadingCallbacks.push(callback);
        }
    }
    
    // Initialize main application
    initializeApplication() {
        try {
            // Create main application instance
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
    
    // Show error message
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
            <h3>Loading Error</h3>
            <p>${message}</p>
            <p>Please refresh the page to retry</p>
        `;
        document.body.appendChild(errorDiv);
    }
    
    // Promise method to wait for all modules to load
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
    
    // Get module loading status
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

// Create global module manager instance
window.moduleManager = new ModuleManager();

// Automatic check after module loading
window.addEventListener('DOMContentLoaded', () => {
    // Delayed check to ensure all scripts are loaded
    setTimeout(() => {
        console.log('DOMContentLoaded - checking modules...');
        window.moduleManager.checkModulesReady();
    }, 500);
});

// Additional check mechanism
setTimeout(() => {
    console.log('Fallback check - checking modules...');
    if (window.moduleManager && !window.moduleManager.initialized) {
        window.moduleManager.checkModulesReady();
    }
}, 2000);

// Export module manager (if using module system)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleManager;
}
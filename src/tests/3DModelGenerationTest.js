/**
 * 3D Model Generation System Test
 * Validates the integration and functionality of the advanced 3D model systems
 */

class ModelGenerationTest {
    constructor() {
        this.results = {
            photogrammetrySystem: false,
            aiDepthEstimation: false,
            proceduralGeneration: false,
            advanced3DModelSystem: false,
            integration: false
        };
    }
    
    async runTests() {
        console.log('🧪 Starting 3D Model Generation System Tests...');
        
        // Test 1: Check if all systems are available
        await this.testSystemAvailability();
        
        // Test 2: Test photogrammetry with multiple images
        await this.testPhotogrammetrySystem();
        
        // Test 3: Test AI depth estimation with single image
        await this.testAIDepthEstimation();
        
        // Test 4: Test procedural generation
        await this.testProceduralGeneration();
        
        // Test 5: Test advanced 3D model system integration
        await this.testAdvanced3DModelSystem();
        
        // Test 6: Test Ocean Forest integration
        await this.testOceanForestIntegration();
        
        this.reportResults();
    }
    
    async testSystemAvailability() {
        console.log('📋 Testing system availability...');
        
        const moduleManager = window.moduleManager;
        if (!moduleManager) {
            console.error('❌ ModuleManager not available');
            return;
        }
        
        // Check PhotogrammetrySystem
        const PhotogrammetrySystem = moduleManager.getModule('PhotogrammetrySystem');
        this.results.photogrammetrySystem = !!PhotogrammetrySystem;
        console.log(`📸 PhotogrammetrySystem: ${this.results.photogrammetrySystem ? '✅' : '❌'}`);
        
        // Check AIDepthEstimation
        const AIDepthEstimation = moduleManager.getModule('AIDepthEstimation');
        this.results.aiDepthEstimation = !!AIDepthEstimation;
        console.log(`🤖 AIDepthEstimation: ${this.results.aiDepthEstimation ? '✅' : '❌'}`);
        
        // Check ProceduralModelGenerator
        const ProceduralModelGenerator = moduleManager.getModule('ProceduralModelGenerator');
        this.results.proceduralGeneration = !!ProceduralModelGenerator;
        console.log(`🎨 ProceduralModelGenerator: ${this.results.proceduralGeneration ? '✅' : '❌'}`);
        
        // Check Advanced3DModelSystem
        const Advanced3DModelSystem = moduleManager.getModule('Advanced3DModelSystem');
        this.results.advanced3DModelSystem = !!Advanced3DModelSystem;
        console.log(`🚀 Advanced3DModelSystem: ${this.results.advanced3DModelSystem ? '✅' : '❌'}`);
    }
    
    async testPhotogrammetrySystem() {
        console.log('📸 Testing Photogrammetry System...');
        
        try {
            const PhotogrammetrySystem = window.moduleManager.getModule('PhotogrammetrySystem');
            if (!PhotogrammetrySystem) {
                console.warn('⚠️ PhotogrammetrySystem not available for testing');
                return;
            }
            
            const photogrammetry = new PhotogrammetrySystem();
            
            // Test with Cape Fur Seal images
            const testImages = [
                'assets/profiles/CapeFurSeal_profile.jpeg',
                'assets/profiles/CapeFurSeal_profile.jpeg', // Duplicate for testing
                'assets/profiles/CapeFurSeal_profile.jpeg'
            ];
            
            const result = await photogrammetry.processMarineSpecies(testImages, 'test_cape_seal', 'preview');
            
            if (result && result.isMesh) {
                this.results.photogrammetrySystem = true;
                console.log('✅ Photogrammetry system test passed');
            } else {
                console.warn('⚠️ Photogrammetry system returned invalid result');
            }
            
        } catch (error) {
            console.warn('⚠️ Photogrammetry system test failed:', error);
        }
    }
    
    async testAIDepthEstimation() {
        console.log('🤖 Testing AI Depth Estimation System...');
        
        try {
            const AIDepthEstimation = window.moduleManager.getModule('AIDepthEstimation');
            if (!AIDepthEstimation) {
                console.warn('⚠️ AIDepthEstimation not available for testing');
                return;
            }
            
            const aiDepth = new AIDepthEstimation();
            
            // Test with Yellowtail image
            const result = await aiDepth.generateFishModel(
                'assets/profiles/Yellowtail_profile.png',
                'test_yellowtail',
                { quality: 'preview' }
            );
            
            if (result && (result.isMesh || result.isLOD)) {
                this.results.aiDepthEstimation = true;
                console.log('✅ AI Depth Estimation system test passed');
            } else {
                console.warn('⚠️ AI Depth Estimation system returned invalid result');
            }
            
        } catch (error) {
            console.warn('⚠️ AI Depth Estimation system test failed:', error);
        }
    }
    
    async testProceduralGeneration() {
        console.log('🎨 Testing Procedural Generation System...');
        
        try {
            const ProceduralModelGenerator = window.moduleManager.getModule('ProceduralModelGenerator');
            if (!ProceduralModelGenerator) {
                console.warn('⚠️ ProceduralModelGenerator not available for testing');
                return;
            }
            
            const procedural = new ProceduralModelGenerator();
            
            // Test with reference image
            const result = await procedural.generateFromReferences(
                ['assets/profiles/Steentjie_profile.png'],
                'test_steentjie',
                { maxLength: 0.3, family: 'Sparidae' },
                'preview'
            );
            
            if (result && (result.isMesh || result.isGroup)) {
                this.results.proceduralGeneration = true;
                console.log('✅ Procedural Generation system test passed');
            } else {
                console.warn('⚠️ Procedural Generation system returned invalid result');
            }
            
        } catch (error) {
            console.warn('⚠️ Procedural Generation system test failed:', error);
        }
    }
    
    async testAdvanced3DModelSystem() {
        console.log('🚀 Testing Advanced 3D Model System...');
        
        try {
            const Advanced3DModelSystem = window.moduleManager.getModule('Advanced3DModelSystem');
            if (!Advanced3DModelSystem) {
                console.warn('⚠️ Advanced3DModelSystem not available for testing');
                return;
            }
            
            // Create a temporary scene for testing
            const testScene = new THREE.Scene();
            const testCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            const testRenderer = new THREE.WebGLRenderer();
            
            const advanced3D = new Advanced3DModelSystem(testScene, testCamera, testRenderer);
            
            // Test species generation
            const testSpecies = {
                name: 'test_fish',
                type: 'standard',
                referenceImages: ['assets/profiles/hottentot_profile.webp'],
                biologicalParams: { maxLength: 0.5 },
                quality: 'preview'
            };
            
            const result = await advanced3D.generateMarineSpeciesModel(testSpecies);
            
            if (result && (result.isMesh || result.isLOD || result.isGroup)) {
                this.results.advanced3DModelSystem = true;
                console.log('✅ Advanced 3D Model System test passed');
            } else {
                console.warn('⚠️ Advanced 3D Model System returned invalid result');
            }
            
        } catch (error) {
            console.warn('⚠️ Advanced 3D Model System test failed:', error);
        }
    }
    
    async testOceanForestIntegration() {
        console.log('🌊 Testing Ocean Forest Integration...');
        
        try {
            // Check if Ocean Forest instance has the advanced 3D model system
            if (window.oceanForest && window.oceanForest.advanced3DModels) {
                this.results.integration = true;
                console.log('✅ Ocean Forest integration test passed');
                
                // Test performance metrics
                const metrics = window.oceanForest.advanced3DModels.getPerformanceMetrics();
                console.log('📊 Performance Metrics:', metrics);
                
            } else {
                console.warn('⚠️ Ocean Forest integration not found');
            }
            
        } catch (error) {
            console.warn('⚠️ Ocean Forest integration test failed:', error);
        }
    }
    
    reportResults() {
        console.log('\n📋 3D Model Generation System Test Results:');
        console.log('='.repeat(50));
        
        const tests = [
            { name: 'Photogrammetry System', key: 'photogrammetrySystem' },
            { name: 'AI Depth Estimation', key: 'aiDepthEstimation' },
            { name: 'Procedural Generation', key: 'proceduralGeneration' },
            { name: 'Advanced 3D Model System', key: 'advanced3DModelSystem' },
            { name: 'Ocean Forest Integration', key: 'integration' }
        ];
        
        let passedTests = 0;
        tests.forEach(test => {
            const status = this.results[test.key] ? '✅ PASS' : '❌ FAIL';
            console.log(`${test.name}: ${status}`);
            if (this.results[test.key]) passedTests++;
        });
        
        console.log('='.repeat(50));
        console.log(`Overall Result: ${passedTests}/${tests.length} tests passed`);
        
        if (passedTests === tests.length) {
            console.log('🎉 All 3D Model Generation System tests passed!');
        } else {
            console.log('⚠️ Some tests failed. Check the logs above for details.');
        }
    }
}

// Export for testing
if (typeof window !== 'undefined') {
    window.ModelGenerationTest = ModelGenerationTest;
}

// Auto-run test when loaded (can be disabled by setting window.autoRunTests = false)
if (typeof window !== 'undefined' && window.autoRunTests !== false) {
    window.addEventListener('load', () => {
        // Wait for Ocean Forest to initialize
        setTimeout(() => {
            if (window.oceanForest) {
                const test = new ModelGenerationTest();
                test.runTests();
            }
        }, 5000); // Wait 5 seconds for full initialization
    });
}
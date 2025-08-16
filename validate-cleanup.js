/**
 * Validation script to test Ocean Forest after cinematic control panel cleanup
 * Run this in browser console after page loads
 */

function validateCleanup() {
    console.log('🧪 Starting Ocean Forest Cleanup Validation...');
    
    const results = {
        moduleManager: false,
        oceanForest: false,
        advanced3DModels: false,
        noCinematicControlPanel: true,
        renderEngine: false,
        marineLife: false
    };
    
    // Test 1: Module Manager
    if (window.moduleManager) {
        results.moduleManager = true;
        console.log('✅ Module Manager: Available');
    } else {
        console.log('❌ Module Manager: Missing');
    }
    
    // Test 2: Ocean Forest Main Application
    if (window.oceanForest) {
        results.oceanForest = true;
        console.log('✅ Ocean Forest: Initialized');
        
        // Test 3: Advanced 3D Model System
        if (window.oceanForest.advanced3DModels) {
            results.advanced3DModels = true;
            console.log('✅ Advanced 3D Models: Available');
        } else {
            console.log('❌ Advanced 3D Models: Missing');
        }
        
        // Test 4: Render Engine
        if (window.oceanForest.renderEngine) {
            results.renderEngine = true;
            console.log('✅ Render Engine: Available');
        } else {
            console.log('❌ Render Engine: Missing');
        }
        
        // Test 5: Marine Life
        const marineLifeCount = (window.oceanForest.capeFurSeals?.length || 0) +
                               (window.oceanForest.africanPenguins?.length || 0) +
                               (window.oceanForest.greatWhiteSharks?.length || 0) +
                               (window.oceanForest.capeReefFish?.length || 0);
        
        if (marineLifeCount > 0) {
            results.marineLife = true;
            console.log(`✅ Marine Life: ${marineLifeCount} animals loaded`);
        } else {
            console.log('❌ Marine Life: No animals found');
        }
        
    } else {
        console.log('❌ Ocean Forest: Not initialized');
    }
    
    // Test 6: Cinematic Control Panel Removed
    if (window.CinematicControlPanel || window.cinematicPanel) {
        results.noCinematicControlPanel = false;
        console.log('❌ Cinematic Control Panel: Still present (should be removed)');
    } else {
        console.log('✅ Cinematic Control Panel: Successfully removed');
    }
    
    // Summary
    console.log('\n📋 Cleanup Validation Results:');
    console.log('='.repeat(40));
    
    const tests = [
        { name: 'Module Manager', key: 'moduleManager' },
        { name: 'Ocean Forest App', key: 'oceanForest' },
        { name: 'Advanced 3D Models', key: 'advanced3DModels' },
        { name: 'Control Panel Removed', key: 'noCinematicControlPanel' },
        { name: 'Render Engine', key: 'renderEngine' },
        { name: 'Marine Life Loaded', key: 'marineLife' }
    ];
    
    let passedTests = 0;
    tests.forEach(test => {
        const status = results[test.key] ? '✅ PASS' : '❌ FAIL';
        console.log(`${test.name}: ${status}`);
        if (results[test.key]) passedTests++;
    });
    
    console.log('='.repeat(40));
    console.log(`Overall: ${passedTests}/${tests.length} tests passed`);
    
    if (passedTests === tests.length) {
        console.log('🎉 Cleanup validation successful!');
        console.log('✨ Ocean Forest is clean and functional');
    } else {
        console.log('⚠️ Some issues detected. Check logs above.');
    }
    
    return results;
}

// Auto-run after 3 seconds if ocean forest is available
setTimeout(() => {
    if (window.oceanForest) {
        validateCleanup();
    } else {
        console.log('⏳ Ocean Forest not ready yet. Run validateCleanup() manually when ready.');
    }
}, 3000);

// Make function globally available
window.validateCleanup = validateCleanup;
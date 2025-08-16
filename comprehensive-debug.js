/**
 * Comprehensive diagnostic script for Ocean Forest
 * This will test everything and give us a complete picture
 */

function runComprehensiveDiagnostic() {
    console.log('🔍 COMPREHENSIVE OCEAN FOREST DIAGNOSTIC');
    console.log('=' .repeat(50));
    
    const results = {
        timestamp: new Date().toISOString(),
        tests: {}
    };
    
    // Test 1: Basic DOM Elements
    console.log('\n📄 DOM ELEMENTS TEST');
    const fishButton = document.querySelector('.animal-control button[onclick="addFish()"]');
    results.tests.fishButtonExists = !!fishButton;
    console.log(`Fish + button exists: ${results.tests.fishButtonExists}`);
    
    if (fishButton) {
        console.log(`Button text: "${fishButton.textContent}"`);
        console.log(`Button onclick: ${fishButton.onclick}`);
        console.log(`Button disabled: ${fishButton.disabled}`);
        console.log(`Button visible: ${fishButton.style.display !== 'none'}`);
    }
    
    // Test 2: Global Functions
    console.log('\n🔧 GLOBAL FUNCTIONS TEST');
    const globalFunctions = ['addFish', 'removeFish', 'addSeal', 'removeSeal'];
    globalFunctions.forEach(fn => {
        results.tests[`${fn}Exists`] = typeof window[fn] === 'function';
        console.log(`${fn}: ${typeof window[fn]}`);
    });
    
    // Test 3: Ocean Forest Instance
    console.log('\n🌊 OCEAN FOREST TEST');
    results.tests.oceanForestExists = !!window.oceanForest;
    console.log(`Ocean Forest exists: ${results.tests.oceanForestExists}`);
    
    if (window.oceanForest) {
        const methods = ['addCapeReefFish', 'removeCapeReefFish', 'addGreatWhiteShark', 'removeGreatWhiteShark'];
        methods.forEach(method => {
            results.tests[`${method}Exists`] = typeof window.oceanForest[method] === 'function';
            console.log(`${method}: ${typeof window.oceanForest[method]}`);
        });
        
        console.log(`Current fish count: ${window.oceanForest.capeReefFish?.length || 0}`);
        console.log(`Scene children count: ${window.oceanForest.scene?.children?.length || 0}`);
    }
    
    // Test 4: Module System
    console.log('\n📦 MODULE SYSTEM TEST');
    results.tests.moduleManagerExists = !!window.moduleManager;
    console.log(`Module Manager exists: ${results.tests.moduleManagerExists}`);
    
    if (window.moduleManager) {
        const requiredModules = ['OceanForest', 'SharksAndFish', 'ReefFishModel'];
        requiredModules.forEach(module => {
            const moduleExists = !!window.moduleManager.getModule(module);
            results.tests[`${module}ModuleExists`] = moduleExists;
            console.log(`${module} module: ${moduleExists}`);
        });
    }
    
    // Test 5: Class Availability
    console.log('\n🏗️ CLASS AVAILABILITY TEST');
    const classes = ['SharksAndFish', 'ReefFishModel', 'MarineAnimals'];
    classes.forEach(className => {
        results.tests[`${className}ClassExists`] = typeof window[className] === 'function';
        console.log(`${className} class: ${typeof window[className]}`);
    });
    
    // Test 6: Manual Function Call Test
    console.log('\n🧪 MANUAL FUNCTION CALL TEST');
    if (typeof window.addFish === 'function') {
        try {
            console.log('Attempting to call addFish() manually...');
            window.addFish();
            results.tests.manualAddFishSuccess = true;
            console.log('✅ Manual addFish() call completed');
        } catch (error) {
            results.tests.manualAddFishSuccess = false;
            results.tests.manualAddFishError = error.message;
            console.error('❌ Manual addFish() call failed:', error);
        }
    }
    
    // Test 7: Button Click Simulation
    console.log('\n🖱️ BUTTON CLICK SIMULATION TEST');
    if (fishButton) {
        try {
            console.log('Simulating button click...');
            fishButton.click();
            results.tests.buttonClickSimulationSuccess = true;
            console.log('✅ Button click simulation completed');
        } catch (error) {
            results.tests.buttonClickSimulationSuccess = false;
            results.tests.buttonClickSimulationError = error.message;
            console.error('❌ Button click simulation failed:', error);
        }
    }
    
    // Test 8: Error Check
    console.log('\n🚨 ERROR CHECK');
    const errors = [];
    
    // Check for common issues
    if (!window.oceanForest) {
        errors.push('Ocean Forest not initialized');
    }
    if (!window.moduleManager) {
        errors.push('Module Manager not available');
    }
    if (typeof window.addFish !== 'function') {
        errors.push('addFish function not defined');
    }
    if (!fishButton) {
        errors.push('Fish + button not found in DOM');
    }
    
    results.tests.errors = errors;
    if (errors.length > 0) {
        console.error('Found issues:', errors);
    } else {
        console.log('✅ No obvious issues detected');
    }
    
    // Summary
    console.log('\n📊 DIAGNOSTIC SUMMARY');
    console.log('=' .repeat(50));
    const passedTests = Object.values(results.tests).filter(test => test === true).length;
    const totalBooleanTests = Object.values(results.tests).filter(test => typeof test === 'boolean').length;
    console.log(`Tests passed: ${passedTests}/${totalBooleanTests}`);
    
    if (errors.length === 0 && passedTests === totalBooleanTests) {
        console.log('🎉 All tests passed! Fish button should work.');
        console.log('💡 Try clicking the Fish + button now.');
    } else {
        console.log('⚠️ Issues detected. Check the detailed output above.');
    }
    
    // Store results globally for inspection
    window.diagnosticResults = results;
    
    return results;
}

// Auto-run diagnostic
setTimeout(() => {
    console.log('🚀 Running comprehensive diagnostic...');
    runComprehensiveDiagnostic();
}, 7000);

// Make function globally available
window.runComprehensiveDiagnostic = runComprehensiveDiagnostic;
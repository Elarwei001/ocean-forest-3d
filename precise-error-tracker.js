/**
 * Precise error tracking for fish creation
 * This will show exactly which line fails
 */

function trackFishCreationErrors() {
    console.log('🔍 PRECISE ERROR TRACKING ENABLED');
    console.log('=' .repeat(50));
    
    // Override console.error to capture stack traces
    const originalError = console.error;
    window.fishCreationErrors = [];
    
    console.error = function(...args) {
        // Store fish-related errors
        if (args.some(arg => typeof arg === 'string' && 
            (arg.includes('fish') || arg.includes('Fish') || arg.includes('reef') || arg.includes('Reef')))) {
            window.fishCreationErrors.push({
                timestamp: new Date().toISOString(),
                message: args.join(' '),
                stack: new Error().stack
            });
        }
        originalError.apply(console, args);
    };
    
    // Test fish creation step by step
    setTimeout(() => {
        testFishCreationStepByStep();
    }, 6000);
}

function testFishCreationStepByStep() {
    console.log('\n🚀 STEP-BY-STEP FISH CREATION TEST');
    console.log('=' .repeat(50));
    
    let currentStep = 'Starting';
    
    try {
        currentStep = 'Checking Ocean Forest';
        console.log('Step 1: ' + currentStep);
        if (!window.oceanForest) {
            throw new Error('Ocean Forest not available');
        }
        console.log('✅ Ocean Forest exists');
        
        currentStep = 'Accessing scene';
        console.log('Step 2: ' + currentStep);
        if (!window.oceanForest.scene) {
            throw new Error('Scene not available');
        }
        console.log('✅ Scene exists');
        
        currentStep = 'Checking SharksAndFish class';
        console.log('Step 3: ' + currentStep);
        if (typeof SharksAndFish === 'undefined') {
            throw new Error('SharksAndFish class not defined');
        }
        console.log('✅ SharksAndFish class available');
        
        currentStep = 'Creating SharksAndFish instance';
        console.log('Step 4: ' + currentStep);
        if (!window.oceanForest.sharksAndFish) {
            window.oceanForest.sharksAndFish = new SharksAndFish(window.oceanForest.scene);
        }
        console.log('✅ SharksAndFish instance created');
        
        currentStep = 'Checking ReefFishModel class';
        console.log('Step 5: ' + currentStep);
        if (typeof ReefFishModel === 'undefined') {
            throw new Error('ReefFishModel class not defined');
        }
        console.log('✅ ReefFishModel class available');
        
        currentStep = 'Creating ReefFishModel instance';
        console.log('Step 6: ' + currentStep);
        if (!window.oceanForest.sharksAndFish.reefFishModel) {
            window.oceanForest.sharksAndFish.reefFishModel = new ReefFishModel(window.oceanForest.scene);
        }
        console.log('✅ ReefFishModel instance created');
        
        currentStep = 'Checking createSingleCapeReefFish method';
        console.log('Step 7: ' + currentStep);
        const methodExists = typeof window.oceanForest.sharksAndFish.createSingleCapeReefFish === 'function';
        console.log('Method exists:', methodExists);
        
        if (methodExists) {
            console.log('✅ Fish creation method available!');
            console.log('Note: Actual fish creation skipped to maintain zero startup count');
            console.log('Current fish count:', window.oceanForest.capeReefFish.length);
            console.log('🎉 SYSTEM READY FOR MANUAL FISH CREATION!');
        } else {
            console.error('❌ Fish creation method not available');
        }
        
    } catch (error) {
        console.error('❌ ERROR AT STEP: ' + currentStep);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Line number:', error.stack.split('\n')[1]);
    }
    
    // Show all captured errors
    setTimeout(() => {
        console.log('\n📊 CAPTURED FISH ERRORS:');
        window.fishCreationErrors.forEach((error, index) => {
            console.log(`Error ${index + 1}:`, error.message);
            console.log('Stack:', error.stack.split('\n')[1]);
        });
    }, 1000);
}

// Manual fish creation with line-by-line tracking
function manualFishCreation() {
    console.log('\n🔧 MANUAL FISH CREATION WITH LINE TRACKING');
    console.log('=' .repeat(50));
    
    try {
        console.log('Line 1: Creating fish type object');
        const fishType = {
            name: "黄尾鰤鱼",
            englishName: "Yellowtail",
            bodyColor: 0xc0c0c0,
            finColor: 0xffd700,
            stripeColor: 0xffa500,
            pattern: 'yellowtail'
        };
        console.log('✅ Fish type created');
        
        console.log('Line 2: Creating THREE.Group');
        const group = new THREE.Group();
        console.log('✅ Group created');
        
        console.log('Line 3: Creating body geometry');
        const bodyGeometry = new THREE.SphereGeometry(0.5, 8, 6);
        console.log('✅ Body geometry created');
        
        console.log('Line 4: Scaling body geometry');
        bodyGeometry.scale(2, 1, 0.8);
        console.log('✅ Body geometry scaled');
        
        console.log('Line 5: Creating body material');
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: fishType.bodyColor,
            shininess: 30
        });
        console.log('✅ Body material created');
        
        console.log('Line 6: Creating body mesh');
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        console.log('✅ Body mesh created');
        
        console.log('Line 7: Setting shadow casting');
        body.castShadow = true;
        console.log('✅ Shadow casting set');
        
        console.log('Line 8: Adding body to group');
        group.add(body);
        console.log('✅ Body added to group');
        
        console.log('Line 9: Creating tail geometry');
        const tailGeometry = new THREE.ConeGeometry(0.3, 0.8, 6);
        console.log('✅ Tail geometry created');
        
        console.log('Line 10: Creating tail material');
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: fishType.finColor
        });
        console.log('✅ Tail material created');
        
        console.log('Line 11: Creating tail mesh');
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        console.log('✅ Tail mesh created');
        
        console.log('Line 12: Positioning tail');
        tail.position.x = -1.0;
        tail.rotation.z = Math.PI / 2;
        console.log('✅ Tail positioned');
        
        console.log('Line 13: Adding tail to group');
        group.add(tail);
        console.log('✅ Tail added to group');
        
        console.log('Line 14: Adding user data');
        group.userData.species = {
            name: fishType.name,
            englishName: fishType.englishName,
            facts: ["Test fish"]
        };
        console.log('✅ User data added');
        
        console.log('Line 15: Positioning fish');
        group.position.set(0, -5, 10);
        console.log('✅ Fish positioned');
        
        console.log('Line 16: Adding to scene');
        window.oceanForest.scene.add(group);
        console.log('✅ Fish added to scene');
        
        console.log('Line 17: Adding to array');
        window.oceanForest.capeReefFish.push(group);
        console.log('✅ Fish added to array');
        
        console.log('🎉 MANUAL CREATION SUCCESSFUL!');
        return group;
        
    } catch (error) {
        console.error('❌ MANUAL CREATION FAILED');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        const lines = error.stack.split('\n');
        console.error('Specific line:', lines[1] || 'Unknown');
        return null;
    }
}

// Make functions globally available
window.trackFishCreationErrors = trackFishCreationErrors;
window.testFishCreationStepByStep = testFishCreationStepByStep;
window.manualFishCreation = manualFishCreation;

// Auto-run error tracking
trackFishCreationErrors();

console.log('🔍 Precise error tracker loaded. Use:');
console.log('- testFishCreationStepByStep() for step-by-step test');
console.log('- manualFishCreation() for line-by-line manual creation');
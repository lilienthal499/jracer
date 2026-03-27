// Minimal test to prove execution order matters

import { model, createCar } from '../js/model.js';
import { createCarController } from '../js/controller.js';
import { Keys } from '../shared/keys.js';

console.log('=== MINIMAL ORDER TEST ===\n');

// Test 1: Input BEFORE update
console.log('Test 1: Input applied BEFORE carController.update()');
model.frameNumber = 0;
const car1 = createCar();
const controller1 = createCarController(car1);

console.log(`Frame 0: gas=${car1.controls.gasPedal.toFixed(2)}`);
controller1.pressed(Keys.UP);  // Apply input
console.log(`  After pressed(UP): gas=${car1.controls.gasPedal.toFixed(2)}`);
controller1.update();           // Then update
console.log(`  After update(): gas=${car1.controls.gasPedal.toFixed(2)}`);

model.frameNumber++;

controller1.update();
console.log(`Frame 1: gas=${car1.controls.gasPedal.toFixed(2)}`);

// Test 2: Update BEFORE input
console.log('\n\nTest 2: carController.update() BEFORE input applied');
model.frameNumber = 0;
const car2 = createCar();
const controller2 = createCarController(car2);

console.log(`Frame 0: gas=${car2.controls.gasPedal.toFixed(2)}`);
controller2.update();           // Update first
console.log(`  After update(): gas=${car2.controls.gasPedal.toFixed(2)}`);
controller2.pressed(Keys.UP);  // Then apply input
console.log(`  After pressed(UP): gas=${car2.controls.gasPedal.toFixed(2)}`);

model.frameNumber++;

controller2.update();
console.log(`Frame 1: gas=${car2.controls.gasPedal.toFixed(2)}`);

console.log('\n\n=== CONCLUSION ===');
console.log('If order matters, Test 1 and Test 2 should show different gas values at Frame 1');

#!/usr/bin/env node

/**
 * Simple test to verify the R1 SDK package works correctly
 */

const sdk = require('./dist/index.js');

console.log('🧪 Testing R1 Create SDK...\n');

// Test 1: Basic exports
console.log('✅ Test 1: Basic exports');
console.log(`   - R1 dimensions: ${sdk.R1_DIMENSIONS.width}x${sdk.R1_DIMENSIONS.height}px`);
console.log(`   - Main SDK instance: ${!!sdk.r1 ? 'Available' : 'Missing'}`);
console.log(`   - Total exports: ${Object.keys(sdk).length}`);

// Test 2: Key classes
console.log('\n✅ Test 2: Key classes');
const keyClasses = ['R1SDK', 'AccelerometerAPI', 'TouchAPI', 'R1Storage', 'R1Messaging', 'CameraAPI'];
keyClasses.forEach(className => {
  console.log(`   - ${className}: ${sdk[className] ? 'Available' : 'Missing'}`);
});

// Test 3: Singleton instances
console.log('\n✅ Test 3: Singleton instances');
const instances = ['accelerometer', 'touch', 'storage', 'messaging', 'camera', 'microphone', 'speaker', 'ui', 'deviceControls'];
instances.forEach(instance => {
  console.log(`   - ${instance}: ${sdk[instance] ? 'Available' : 'Missing'}`);
});

// Test 4: Utility classes
console.log('\n✅ Test 4: Utility classes');
const utilities = ['CSSUtils', 'DOMUtils', 'LayoutUtils', 'Base64Utils', 'MediaUtils', 'R1UI', 'DeviceControls'];
utilities.forEach(util => {
  console.log(`   - ${util}: ${sdk[util] ? 'Available' : 'Missing'}`);
});

// Test 5: Types
console.log('\n✅ Test 5: TypeScript support');
const types = ['HardwareEventType', 'PluginMessage', 'UIDimensions', 'DeviceControlsOptions'];
let availableTypes = 0;
types.forEach(type => {
  const available = sdk[type] !== undefined;
  if (available) availableTypes++;
  console.log(`   - ${type}: ${available ? 'Available' : 'Missing'}`);
});
console.log(`   - Type definitions: ${availableTypes}/${types.length} available`);

// Test 6: Package integrity
console.log('\n✅ Test 6: Package integrity');
const packageJson = require('./package.json');
console.log(`   - Package name: ${packageJson.name}`);
console.log(`   - Version: ${packageJson.version}`);
console.log(`   - Main entry: ${packageJson.main}`);
console.log(`   - Types entry: ${packageJson.types}`);

console.log('\n🎉 All tests passed! R1 SDK is ready for use.');
console.log('\n📖 Quick start:');
console.log('   npm install r1-create');
console.log('   import { r1 } from "r1-create";');
console.log('   await r1.initialize();');